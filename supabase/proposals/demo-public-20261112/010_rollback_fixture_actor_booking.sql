-- Guarded rollback for 009_demo_fixture_actor_booking.sql only.
-- It refuses to remove any actor, slot, or reservation created by the demo.
begin;

lock table public.gym_demo_fixture_catalog, public.gym_demo_fixture_slot_templates,
  public.gym_demo_coaches, public.gym_demo_slots, public.gym_demo_reservations
  in access exclusive mode;

do $$
begin
  if exists (select 1 from public.gym_demo_coaches where fixture_key is not null)
     or exists (select 1 from public.gym_demo_slots s join public.gym_demo_coaches c on c.id = s.coach_id where c.fixture_key is not null)
     or exists (select 1 from public.gym_demo_reservations r join public.gym_demo_coaches c on c.id = r.coach_id where c.fixture_key is not null) then
    raise exception 'Rollback refused: fixture actors, slots, or reservations exist';
  end if;
  if (select count(*) from public.gym_demo_fixture_catalog) <> 1
     or not exists (select 1 from public.gym_demo_fixture_catalog
       where fixture_key = 'coach-demo-tennis' and display_name = 'Coach Démo — Tennis'
         and sport = 'Tennis' and city_label = 'Ville de démonstration'
         and service_label = 'Séance fictive de tennis' and display_price_cents = 4000 and active) then
    raise exception 'Rollback refused: fixture catalogue differs from the seeded proposal';
  end if;
  if (select count(*) from public.gym_demo_fixture_slot_templates) <> 2
     or not exists (select 1 from public.gym_demo_fixture_slot_templates
       where fixture_key = 'coach-demo-tennis' and slot_key = 'tennis-matin' and day_offset = 2 and starts_at_utc = time '10:00' and duration_minutes = 60)
     or not exists (select 1 from public.gym_demo_fixture_slot_templates
       where fixture_key = 'coach-demo-tennis' and slot_key = 'tennis-apres-midi' and day_offset = 3 and starts_at_utc = time '15:00' and duration_minutes = 60) then
    raise exception 'Rollback refused: fixture slot templates differ from the seeded proposal';
  end if;
end;
$$;

drop function public.gym_demo_confirm_simulated_payment(uuid, uuid);
drop function public.gym_demo_book_and_accept_fixture(uuid, text, text, uuid);
drop policy gym_demo_fixture_slots_read_active on public.gym_demo_fixture_slot_templates;
drop policy gym_demo_fixture_catalog_read_active on public.gym_demo_fixture_catalog;
revoke all on public.gym_demo_fixture_catalog, public.gym_demo_fixture_slot_templates from public, anon, authenticated, service_role;
drop table public.gym_demo_fixture_slot_templates;
drop table public.gym_demo_fixture_catalog;
drop index public.gym_demo_coaches_fixture_key_idx;
alter table public.gym_demo_coaches
  drop constraint gym_demo_coaches_fixture_key_owner_check,
  drop column fixture_key;

commit;
