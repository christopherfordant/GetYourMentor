-- Additive proposal for the isolated recruiter-demo project only.
-- Apply after 001_demo_schema.sql. Never apply to preprod or production.
begin;

create table public.gym_demo_slots (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.gym_demo_coaches(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  state text not null default 'available' check (state in ('available', 'booked', 'cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (coach_id, starts_at)
);

alter table public.gym_demo_reservations
  add column slot_id uuid references public.gym_demo_slots(id) on delete set null,
  add column idempotency_key uuid,
  add column request_fingerprint text;

alter table public.gym_demo_reservations
  add constraint gym_demo_reservations_idempotency_pair_check
    check ((idempotency_key is null and request_fingerprint is null)
      or (idempotency_key is not null and request_fingerprint is not null
        and char_length(request_fingerprint) between 1 and 128));

create unique index gym_demo_reservations_idempotency_idx
  on public.gym_demo_reservations (athlete_session_id, idempotency_key)
  where idempotency_key is not null;
create index gym_demo_slots_coach_start_idx
  on public.gym_demo_slots (coach_id, starts_at);

alter table public.gym_demo_slots enable row level security;
revoke all on public.gym_demo_slots from public, anon, authenticated;
grant select on public.gym_demo_slots to anon, authenticated;
grant select, insert, update, delete on public.gym_demo_slots to service_role;

create policy gym_demo_slots_read_public_fixtures_or_own_coach on public.gym_demo_slots
  for select to anon, authenticated using (
    exists (
      select 1 from public.gym_demo_coaches c
      where c.id = coach_id and c.is_fixture and c.owner_session_id is null
    )
    or exists (
      select 1 from public.gym_demo_coaches c
      join public.gym_demo_sessions s on s.id = c.owner_session_id
      where c.id = coach_id and not c.is_fixture
        and s.owner_user_id = (select auth.uid()) and s.role = 'coach'
    )
  );

-- The server calls this function only after authenticating the individual demo
-- session. The function serializes bookings on the slot row and returns the
-- same reservation id for a repeated key/payload. It never calls a payment API.
create function public.gym_demo_book_slot(
  p_athlete_session_id uuid,
  p_slot_id uuid,
  p_idempotency_key uuid,
  p_request_fingerprint text
) returns uuid
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_existing public.gym_demo_reservations%rowtype;
  v_slot public.gym_demo_slots%rowtype;
  v_coach public.gym_demo_coaches%rowtype;
  v_reservation_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception using errcode = '42501', message = 'server role required';
  end if;
  if p_idempotency_key is null or p_request_fingerprint is null
     or char_length(p_request_fingerprint) not between 1 and 128 then
    raise exception using errcode = '22023', message = 'valid idempotency input required';
  end if;
  if not exists (
    select 1 from public.gym_demo_sessions s
    where s.id = p_athlete_session_id and s.role = 'sportif' and s.expires_at > now()
  ) then
    raise exception using errcode = '22023', message = 'active athlete session required';
  end if;

  -- Serialize concurrent submissions that reuse the same key, even if a
  -- malformed retry names another slot. A hash collision only adds waiting.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_athlete_session_id::text || ':' || p_idempotency_key::text, 0)
  );
  select r.* into v_existing
  from public.gym_demo_reservations r
  where r.athlete_session_id = p_athlete_session_id
    and r.idempotency_key = p_idempotency_key
  for update;
  if found then
    if v_existing.slot_id <> p_slot_id
       or v_existing.request_fingerprint <> p_request_fingerprint then
      raise exception using errcode = '22023', message = 'idempotency key reused with different request';
    end if;
    return v_existing.id;
  end if;

  select s.* into v_slot from public.gym_demo_slots s where s.id = p_slot_id for update;
  if not found or v_slot.state <> 'available' or v_slot.starts_at <= now() then
    raise exception using errcode = 'P0001', message = 'slot unavailable';
  end if;
  select c.* into v_coach from public.gym_demo_coaches c where c.id = v_slot.coach_id;
  if not found then
    raise exception using errcode = 'P0001', message = 'coach unavailable';
  end if;

  insert into public.gym_demo_reservations (
    athlete_session_id, coach_id, coach_name_snapshot, sport_snapshot,
    service_snapshot, appointment_at, display_price_cents, slot_id,
    idempotency_key, request_fingerprint
  ) values (
    p_athlete_session_id, v_coach.id, v_coach.display_name, v_coach.sport,
    v_coach.service_label, v_slot.starts_at, v_coach.display_price_cents,
    v_slot.id, p_idempotency_key, p_request_fingerprint
  ) returning id into v_reservation_id;

  update public.gym_demo_slots set state = 'booked' where id = v_slot.id;
  return v_reservation_id;
end;
$$;

create function public.gym_demo_transition_reservation(
  p_reservation_id uuid,
  p_next_status text
) returns boolean
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_reservation public.gym_demo_reservations%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception using errcode = '42501', message = 'server role required';
  end if;
  if p_next_status not in ('accepted', 'cancelled') then
    raise exception using errcode = '22023', message = 'unsupported reservation transition';
  end if;

  select r.* into v_reservation from public.gym_demo_reservations r
  where r.id = p_reservation_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'reservation not found';
  end if;
  if v_reservation.status = p_next_status then return false; end if;
  if v_reservation.status <> 'requested' then
    raise exception using errcode = 'P0001', message = 'reservation is already final';
  end if;

  update public.gym_demo_reservations set status = p_next_status where id = p_reservation_id;
  if p_next_status = 'cancelled' and v_reservation.slot_id is not null then
    update public.gym_demo_slots set state = 'available'
    where id = v_reservation.slot_id and state = 'booked';
  end if;
  return true;
end;
$$;

revoke all on function public.gym_demo_book_slot(uuid, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.gym_demo_transition_reservation(uuid, text) from public, anon, authenticated;
grant execute on function public.gym_demo_book_slot(uuid, uuid, uuid, text) to service_role;
grant execute on function public.gym_demo_transition_reservation(uuid, text) to service_role;

commit;
