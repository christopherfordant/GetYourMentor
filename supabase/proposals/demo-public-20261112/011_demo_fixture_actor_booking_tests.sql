-- pgTAP tests for 009_demo_fixture_actor_booking.sql.
-- Run only on a disposable local PostgreSQL 12 database after 001, 004, 009.
begin;

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('d3100000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'd13-fixture-athlete-a@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('d3100000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'd13-fixture-athlete-b@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('d3100000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'd13-fixture-coach@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb)
on conflict (id) do nothing;
insert into public.gym_demo_sessions (id, owner_user_id, role)
values
  ('d3110000-0000-4000-8000-000000000001', 'd3100000-0000-4000-8000-000000000001', 'sportif'),
  ('d3110000-0000-4000-8000-000000000002', 'd3100000-0000-4000-8000-000000000002', 'sportif'),
  ('d3110000-0000-4000-8000-000000000003', 'd3100000-0000-4000-8000-000000000003', 'coach')
on conflict (id) do nothing;

select plan(33);
select has_table('public', 'gym_demo_fixture_catalog', 'synthetic coach catalogue exists');
select has_table('public', 'gym_demo_fixture_slot_templates', 'allow-listed demo slots exist');
select has_column('public', 'gym_demo_coaches', 'fixture_key', 'stable actor key is stored on coach');
select policies_are('public', 'gym_demo_fixture_catalog', array['gym_demo_fixture_catalog_read_active']);
select policies_are('public', 'gym_demo_fixture_slot_templates', array['gym_demo_fixture_slots_read_active']);
select ok(not has_table_privilege('anon', 'public.gym_demo_fixture_catalog', 'insert,update,delete'), 'visitor cannot mutate fixture catalogue');
select ok(not has_table_privilege('authenticated', 'public.gym_demo_fixture_slot_templates', 'insert,update,delete'), 'visitor cannot mutate slot templates');
select ok(not has_function_privilege('anon', 'public.gym_demo_book_and_accept_fixture(uuid,text,text,uuid)', 'execute'), 'anon cannot create actor or accept booking');
select ok(not has_function_privilege('authenticated', 'public.gym_demo_confirm_simulated_payment(uuid,uuid)', 'execute'), 'athlete client cannot confirm payment directly');
select ok(not has_function_privilege('authenticated', 'public.gym_demo_book_and_accept_fixture(uuid,text,text,uuid)', 'execute'), 'athlete client cannot trigger auto-accept directly');

set local role anon;
select set_config('request.jwt.claim.role', 'anon', true);
select set_config('request.jwt.claim.sub', '', true);
select is((select count(*)::int from public.gym_demo_fixture_catalog), 1, 'visitor can read the active fictitious coach choice');
select is((select count(*)::int from public.gym_demo_fixture_slot_templates), 2, 'visitor can read allow-listed demo time choices');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', 'd3100000-0000-4000-8000-000000000001', true);
select throws_ok($$insert into public.gym_demo_coaches (owner_session_id, is_fixture, fixture_key, display_name, sport, service_label, display_price_cents)
values ('d3110000-0000-4000-8000-000000000003', true, 'forged-fixture', 'Fake', 'Tennis', 'Fake', 1)$$,
  '42501', 'new row violates row-level security policy for table "gym_demo_coaches"', 'visitor cannot create a shared fixture actor');
select is((select count(*)::int from public.gym_demo_coaches where fixture_key = 'forged-fixture'), 0, 'visitor cannot create a shared fixture actor');
reset role;

set local role service_role;
select set_config('request.jwt.claim.role', 'service_role', true);
select lives_ok($$select public.gym_demo_book_and_accept_fixture('d3110000-0000-4000-8000-000000000001','coach-demo-tennis','tennis-matin','d3120000-0000-4000-8000-000000000001')$$,
  'server creates the stable coach actor and accepts the demo booking atomically');
select is((select count(*)::int from public.gym_demo_coaches where fixture_key = 'coach-demo-tennis' and is_fixture and owner_session_id is null), 1, 'one shared actor is created for the fixture key');
select is((select count(*)::int from public.gym_demo_reservations where athlete_session_id = 'd3110000-0000-4000-8000-000000000001' and status = 'accepted' and approval_mode = 'simulated' and payment_mode = 'simulated' and payment_status = 'not_started'), 1, 'new booking is accepted as a simulation and payment has not yet been confirmed');
select is((select state from public.gym_demo_slots s join public.gym_demo_coaches c on c.id = s.coach_id where c.fixture_key = 'coach-demo-tennis'), 'booked', 'slot is held in the booking transaction');
select is(public.gym_demo_book_and_accept_fixture('d3110000-0000-4000-8000-000000000001','coach-demo-tennis','tennis-matin','d3120000-0000-4000-8000-000000000001'),
  (select id from public.gym_demo_reservations where idempotency_key = 'd3120000-0000-4000-8000-000000000001'), 'identical retry returns the same reservation');
select is((select count(*)::int from public.gym_demo_coaches where fixture_key = 'coach-demo-tennis'), 1, 'retry reuses the same fictitious actor');
select is((select count(*)::int from public.gym_demo_reservations where idempotency_key = 'd3120000-0000-4000-8000-000000000001'), 1, 'identical retry does not duplicate the booking');
select throws_ok($$select public.gym_demo_book_and_accept_fixture('d3110000-0000-4000-8000-000000000001','coach-demo-tennis','tennis-apres-midi','d3120000-0000-4000-8000-000000000001')$$,
  '22023', 'idempotency key reused with different request', 'same idempotency key cannot change the selected time');
select throws_ok($$select public.gym_demo_book_and_accept_fixture('d3110000-0000-4000-8000-000000000001','real-coach','tennis-matin','d3120000-0000-4000-8000-000000000002')$$,
  '22023', 'active demo coach fixture required', 'real or unknown coach cannot enter the automatic acceptance path');
select throws_ok($$select public.gym_demo_book_and_accept_fixture('d3110000-0000-4000-8000-000000000001','coach-demo-tennis','unknown-slot','d3120000-0000-4000-8000-000000000003')$$,
  '22023', 'allow-listed demo slot required', 'unapproved times cannot be booked');
select throws_ok($$select public.gym_demo_book_and_accept_fixture('d3110000-0000-4000-8000-000000000003','coach-demo-tennis','tennis-apres-midi','d3120000-0000-4000-8000-000000000004')$$,
  '22023', 'active athlete session required', 'coach session cannot book as an athlete');
select is(public.gym_demo_confirm_simulated_payment('d3110000-0000-4000-8000-000000000001', (select id from public.gym_demo_reservations where idempotency_key = 'd3120000-0000-4000-8000-000000000001')), true, 'server records only simulated payment confirmation');
select is(public.gym_demo_confirm_simulated_payment('d3110000-0000-4000-8000-000000000001', (select id from public.gym_demo_reservations where idempotency_key = 'd3120000-0000-4000-8000-000000000001')), false, 'simulated payment confirmation is idempotent');
select is((select payment_status from public.gym_demo_reservations where idempotency_key = 'd3120000-0000-4000-8000-000000000001'), 'simulated_confirmed', 'payment state is marked simulated only');
select throws_ok($$select public.gym_demo_confirm_simulated_payment('d3110000-0000-4000-8000-000000000002', (select id from public.gym_demo_reservations where idempotency_key = 'd3120000-0000-4000-8000-000000000001'))$$,
  'P0001', 'accepted demo reservation required', 'another athlete cannot confirm this reservation payment');
select throws_ok($$select public.gym_demo_confirm_simulated_payment('d3110000-0000-4000-8000-000000000001','d3130000-0000-4000-8000-000000000001')$$,
  'P0001', 'accepted demo reservation required', 'unknown reservation cannot be paid');
select ok(not has_function_privilege('anon', 'public.gym_demo_confirm_simulated_payment(uuid,uuid)', 'execute'), 'payment mutation remains server-only');
select ok(not has_function_privilege('authenticated', 'public.gym_demo_book_and_accept_fixture(uuid,text,text,uuid)', 'execute'), 'booking mutation remains server-only');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', 'd3100000-0000-4000-8000-000000000001', true);
delete from public.gym_demo_coaches where fixture_key = 'coach-demo-tennis';
update public.gym_demo_coaches set display_name = 'Tampered' where fixture_key = 'coach-demo-tennis';
select is((select count(*)::int from public.gym_demo_coaches where fixture_key = 'coach-demo-tennis' and display_name = 'Coach Démo — Tennis'), 1, 'visitor cannot delete or change shared actor');
reset role;

select * from finish();
rollback;
