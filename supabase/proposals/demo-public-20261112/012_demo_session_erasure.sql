-- Local proposal: authenticated self-erasure and server-only TTL data purge.
-- Apply after 001, 004 and 009. Never apply remotely without a separate review.
begin;

create or replace function public.gym_demo_delete_my_athlete_session(p_session_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  delete from public.gym_demo_sessions
  where id = p_session_id
    and owner_user_id = auth.uid()
    and role = 'sportif';
  return found;
end;
$$;

revoke all on function public.gym_demo_delete_my_athlete_session(uuid) from public, anon;
grant execute on function public.gym_demo_delete_my_athlete_session(uuid) to authenticated;

-- Reservations point to reusable public fixture slots. Erasing a tester must
-- release a future slot rather than strand it as booked after ON DELETE SET NULL.
create or replace function public.gym_demo_release_slot_on_reservation_delete()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if old.slot_id is not null then
    update public.gym_demo_slots
    set state = 'available'
    where id = old.slot_id and state = 'booked' and starts_at > statement_timestamp();
  end if;
  return old;
end;
$$;

revoke all on function public.gym_demo_release_slot_on_reservation_delete() from public, anon, authenticated;
create trigger gym_demo_reservation_release_slot_before_delete
before delete on public.gym_demo_reservations
for each row execute function public.gym_demo_release_slot_on_reservation_delete();

-- Purges only expired athlete-owned demo data. Auth identities remain intact;
-- a scheduler and server credential are deliberately outside this SQL contract.
create or replace function public.gym_demo_purge_expired_athlete_sessions()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  deleted_count integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'server role required' using errcode = '42501';
  end if;

  delete from public.gym_demo_sessions
  where role = 'sportif' and expires_at <= statement_timestamp();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.gym_demo_purge_expired_athlete_sessions() from public, anon, authenticated;
grant execute on function public.gym_demo_purge_expired_athlete_sessions() to service_role;

commit;
