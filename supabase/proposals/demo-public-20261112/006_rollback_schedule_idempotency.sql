-- Proposal rollback for 004_demo_schedule_idempotency.sql only.
-- Review the target project in the dashboard first. Never run on preprod or production.
begin;

lock table public.gym_demo_slots, public.gym_demo_reservations in access exclusive mode;

do $$
begin
  if exists (select 1 from public.gym_demo_slots limit 1)
     or exists (
       select 1 from public.gym_demo_reservations
       where slot_id is not null or idempotency_key is not null or request_fingerprint is not null
       limit 1
     ) then
    raise exception 'Rollback refused: schedule slots or idempotency reservation data exist';
  end if;
end;
$$;

drop function public.gym_demo_transition_reservation(uuid, text);
drop function public.gym_demo_book_slot(uuid, uuid, uuid, text);
drop policy gym_demo_slots_read_public_fixtures_or_own_coach on public.gym_demo_slots;
revoke all on public.gym_demo_slots from public, anon, authenticated, service_role;
drop index public.gym_demo_reservations_idempotency_idx;
alter table public.gym_demo_reservations
  drop constraint gym_demo_reservations_idempotency_pair_check,
  drop column request_fingerprint,
  drop column idempotency_key,
  drop column slot_id;
drop table public.gym_demo_slots;

commit;
