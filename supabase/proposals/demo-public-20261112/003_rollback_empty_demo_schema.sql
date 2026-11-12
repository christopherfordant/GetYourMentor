-- Emergency rollback for the isolated recruiter-demo schema only.
-- Before running, verify the project ref in the Supabase dashboard is
-- rqxoovriacgoriimpbwi. Never run against getyourmentor-preprod or production.
-- This script refuses to drop any demo data. It is intentionally operator-run.

begin;

lock table
  public.gym_demo_telegram_links,
  public.gym_demo_reservations,
  public.gym_demo_coaches,
  public.gym_demo_sessions
in access exclusive mode;

do $$
begin
  if exists (select 1 from public.gym_demo_telegram_links limit 1)
    or exists (select 1 from public.gym_demo_reservations limit 1)
    or exists (select 1 from public.gym_demo_coaches limit 1)
    or exists (select 1 from public.gym_demo_sessions limit 1) then
    raise exception 'Rollback refused: recruiter demo tables contain data';
  end if;
end
$$;

drop policy if exists gym_demo_sessions_select_owner on public.gym_demo_sessions;
drop policy if exists gym_demo_sessions_insert_owner on public.gym_demo_sessions;
drop policy if exists gym_demo_sessions_delete_owner on public.gym_demo_sessions;
drop policy if exists gym_demo_coaches_read_fixture_or_owner on public.gym_demo_coaches;
drop policy if exists gym_demo_coaches_insert_owner on public.gym_demo_coaches;
drop policy if exists gym_demo_coaches_update_owner on public.gym_demo_coaches;
drop policy if exists gym_demo_coaches_delete_owner on public.gym_demo_coaches;
drop policy if exists gym_demo_reservations_read_participants on public.gym_demo_reservations;

drop table public.gym_demo_telegram_links;
drop table public.gym_demo_reservations;
drop table public.gym_demo_coaches;
drop table public.gym_demo_sessions;

commit;
