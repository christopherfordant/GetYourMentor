-- Additive contract for the isolated public recruiter demo only.
-- Apply after 001_demo_schema.sql and 004_demo_schedule_idempotency.sql.
-- Never apply to preprod or production. No payment provider is called here.
begin;

alter table public.gym_demo_coaches add column fixture_key text;
alter table public.gym_demo_coaches
  add constraint gym_demo_coaches_fixture_key_owner_check
  check (fixture_key is null or (is_fixture and owner_session_id is null));
create unique index gym_demo_coaches_fixture_key_idx
  on public.gym_demo_coaches (fixture_key) where fixture_key is not null;

create table public.gym_demo_fixture_catalog (
  fixture_key text primary key check (fixture_key ~ '^[a-z0-9_-]{2,40}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  sport text not null check (char_length(sport) between 1 and 60),
  city_label text not null check (char_length(city_label) between 1 and 80),
  service_label text not null check (char_length(service_label) between 1 and 120),
  display_price_cents integer not null check (display_price_cents between 0 and 100000),
  active boolean not null default true
);

create table public.gym_demo_fixture_slot_templates (
  fixture_key text not null references public.gym_demo_fixture_catalog(fixture_key) on delete cascade,
  slot_key text not null check (slot_key ~ '^[a-z0-9_-]{2,40}$'),
  day_offset integer not null check (day_offset between 1 and 14),
  starts_at_utc time not null,
  duration_minutes integer not null check (duration_minutes between 30 and 180),
  primary key (fixture_key, slot_key)
);

insert into public.gym_demo_fixture_catalog
  (fixture_key, display_name, sport, city_label, service_label, display_price_cents)
values
  ('coach-demo-tennis', 'Coach Démo — Tennis', 'Tennis', 'Ville de démonstration', 'Séance fictive de tennis', 4000);
insert into public.gym_demo_fixture_slot_templates
  (fixture_key, slot_key, day_offset, starts_at_utc, duration_minutes)
values
  ('coach-demo-tennis', 'tennis-matin', 2, time '10:00', 60),
  ('coach-demo-tennis', 'tennis-apres-midi', 3, time '15:00', 60);

alter table public.gym_demo_fixture_catalog enable row level security;
alter table public.gym_demo_fixture_slot_templates enable row level security;
revoke all on public.gym_demo_fixture_catalog, public.gym_demo_fixture_slot_templates from public, anon, authenticated;
grant select on public.gym_demo_fixture_catalog, public.gym_demo_fixture_slot_templates to anon, authenticated;
grant select, insert, update, delete on public.gym_demo_fixture_catalog, public.gym_demo_fixture_slot_templates to service_role;
create policy gym_demo_fixture_catalog_read_active on public.gym_demo_fixture_catalog
  for select to anon, authenticated using (active);
create policy gym_demo_fixture_slots_read_active on public.gym_demo_fixture_slot_templates
  for select to anon, authenticated using (
    exists (select 1 from public.gym_demo_fixture_catalog c
      where c.fixture_key = gym_demo_fixture_slot_templates.fixture_key and c.active)
  );

-- Creates or reuses the synthetic actor, materializes one allow-listed slot,
-- then records an accepted demo reservation and holds the slot atomically.
-- The API server authenticates the demo session before calling this function.
create function public.gym_demo_book_and_accept_fixture(
  p_athlete_session_id uuid,
  p_fixture_key text,
  p_slot_key text,
  p_idempotency_key uuid
) returns uuid
language plpgsql security definer set search_path = pg_catalog
as $$
declare
  v_catalog public.gym_demo_fixture_catalog%rowtype;
  v_template public.gym_demo_fixture_slot_templates%rowtype;
  v_coach public.gym_demo_coaches%rowtype;
  v_slot public.gym_demo_slots%rowtype;
  v_existing public.gym_demo_reservations%rowtype;
  v_starts_at timestamptz;
  v_fingerprint text;
  v_reservation_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception using errcode = '42501', message = 'server role required';
  end if;
  if p_idempotency_key is null then
    raise exception using errcode = '22023', message = 'idempotency key required';
  end if;
  if not exists (select 1 from public.gym_demo_sessions s
    where s.id = p_athlete_session_id and s.role = 'sportif' and s.expires_at > now()) then
    raise exception using errcode = '22023', message = 'active athlete session required';
  end if;

  v_fingerprint := 'fixture=' || coalesce(p_fixture_key, '') || ';slot=' || coalesce(p_slot_key, '');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    p_athlete_session_id::text || ':' || p_idempotency_key::text, 0));
  select r.* into v_existing from public.gym_demo_reservations r
    where r.athlete_session_id = p_athlete_session_id and r.idempotency_key = p_idempotency_key for update;
  if found then
    if v_existing.request_fingerprint <> v_fingerprint then
      raise exception using errcode = '22023', message = 'idempotency key reused with different request';
    end if;
    return v_existing.id;
  end if;

  select c.* into v_catalog from public.gym_demo_fixture_catalog c
    where c.fixture_key = p_fixture_key and c.active for share;
  if not found then
    raise exception using errcode = '22023', message = 'active demo coach fixture required';
  end if;
  select t.* into v_template from public.gym_demo_fixture_slot_templates t
    where t.fixture_key = p_fixture_key and t.slot_key = p_slot_key for share;
  if not found then
    raise exception using errcode = '22023', message = 'allow-listed demo slot required';
  end if;

  -- Serialize first creation by fixture key. A conflicting/corrupt actor is
  -- rejected instead of silently overwriting the shared profile.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('fixture:' || p_fixture_key, 0));
  insert into public.gym_demo_coaches
    (owner_session_id, is_fixture, fixture_key, display_name, sport, city_label, service_label, display_price_cents)
  values
    (null, true, v_catalog.fixture_key, v_catalog.display_name, v_catalog.sport,
     v_catalog.city_label, v_catalog.service_label, v_catalog.display_price_cents)
  on conflict (fixture_key) where fixture_key is not null do nothing;
  select c.* into v_coach from public.gym_demo_coaches c where c.fixture_key = p_fixture_key for update;
  if not found or not v_coach.is_fixture or v_coach.owner_session_id is not null
     or v_coach.display_name <> v_catalog.display_name or v_coach.sport <> v_catalog.sport
     or v_coach.city_label <> v_catalog.city_label or v_coach.service_label <> v_catalog.service_label
     or v_coach.display_price_cents <> v_catalog.display_price_cents then
    raise exception using errcode = 'P0001', message = 'demo coach actor integrity check failed';
  end if;

  v_starts_at := ((now() at time zone 'UTC')::date + v_template.day_offset + v_template.starts_at_utc) at time zone 'UTC';
  insert into public.gym_demo_slots (coach_id, starts_at, ends_at)
  values (v_coach.id, v_starts_at, v_starts_at + make_interval(mins => v_template.duration_minutes))
  on conflict (coach_id, starts_at) do nothing;
  select s.* into v_slot from public.gym_demo_slots s
    where s.coach_id = v_coach.id and s.starts_at = v_starts_at for update;
  if not found or v_slot.state <> 'available' or v_slot.starts_at <= now() then
    raise exception using errcode = 'P0001', message = 'demo slot unavailable';
  end if;

  insert into public.gym_demo_reservations (
    athlete_session_id, coach_id, coach_name_snapshot, sport_snapshot,
    service_snapshot, appointment_at, status, approval_mode, display_price_cents,
    payment_mode, payment_status, slot_id, idempotency_key, request_fingerprint
  ) values (
    p_athlete_session_id, v_coach.id, v_coach.display_name, v_coach.sport,
    v_coach.service_label, v_slot.starts_at, 'accepted', 'simulated', v_coach.display_price_cents,
    'simulated', 'not_started', v_slot.id, p_idempotency_key, v_fingerprint
  ) returning id into v_reservation_id;
  update public.gym_demo_slots set state = 'booked' where id = v_slot.id;
  return v_reservation_id;
end;
$$;

-- Marks a demo payment in the reservation only; no payment provider or charge.
create function public.gym_demo_confirm_simulated_payment(
  p_athlete_session_id uuid,
  p_reservation_id uuid
) returns boolean
language plpgsql security definer set search_path = pg_catalog
as $$
declare v_reservation public.gym_demo_reservations%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception using errcode = '42501', message = 'server role required';
  end if;
  if not exists (select 1 from public.gym_demo_sessions s
    where s.id = p_athlete_session_id and s.role = 'sportif' and s.expires_at > now()) then
    raise exception using errcode = '22023', message = 'active athlete session required';
  end if;
  select r.* into v_reservation from public.gym_demo_reservations r
    join public.gym_demo_coaches c on c.id = r.coach_id and c.is_fixture and c.fixture_key is not null
    where r.id = p_reservation_id and r.athlete_session_id = p_athlete_session_id for update of r;
  if not found or v_reservation.status <> 'accepted' or v_reservation.approval_mode <> 'simulated'
     or v_reservation.payment_mode <> 'simulated' then
    raise exception using errcode = 'P0001', message = 'accepted demo reservation required';
  end if;
  if v_reservation.payment_status = 'simulated_confirmed' then return false; end if;
  if v_reservation.payment_status <> 'not_started' then
    raise exception using errcode = 'P0001', message = 'unsupported demo payment state';
  end if;
  update public.gym_demo_reservations set payment_status = 'simulated_confirmed' where id = p_reservation_id;
  return true;
end;
$$;

revoke all on function public.gym_demo_book_and_accept_fixture(uuid, text, text, uuid) from public, anon, authenticated;
revoke all on function public.gym_demo_confirm_simulated_payment(uuid, uuid) from public, anon, authenticated;
grant execute on function public.gym_demo_book_and_accept_fixture(uuid, text, text, uuid) to service_role;
grant execute on function public.gym_demo_confirm_simulated_payment(uuid, uuid) to service_role;

commit;
