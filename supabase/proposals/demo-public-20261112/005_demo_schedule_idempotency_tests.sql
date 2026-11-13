-- pgTAP contract tests for 004_demo_schedule_idempotency.sql.
-- Run only after the proposal schema on a disposable local DB or the isolated
-- recruiter-demo project. The transaction rolls back all synthetic rows.
begin;

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('d2000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'd13-athlete-a@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('d2000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'd13-coach-b@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('d2000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'd13-athlete-c@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb)
on conflict (id) do nothing;

insert into public.gym_demo_sessions (id, owner_user_id, role)
values
  ('d2100000-0000-4000-8000-000000000001', 'd2000000-0000-4000-8000-000000000001', 'sportif'),
  ('d2100000-0000-4000-8000-000000000002', 'd2000000-0000-4000-8000-000000000002', 'coach'),
  ('d2100000-0000-4000-8000-000000000003', 'd2000000-0000-4000-8000-000000000003', 'sportif')
on conflict (id) do nothing;

insert into public.gym_demo_coaches (id, owner_session_id, is_fixture, display_name, sport, service_label, display_price_cents)
values
  ('d2200000-0000-4000-8000-000000000001', null, true, 'Coach fixture D13', 'Tennis', 'Séance fictive', 4000),
  ('d2200000-0000-4000-8000-000000000002', 'd2100000-0000-4000-8000-000000000002', false, 'Coach privé D13', 'Natation', 'Séance privée fictive', 5000)
on conflict (id) do nothing;

insert into public.gym_demo_slots (id, coach_id, starts_at, ends_at)
values
  ('d2300000-0000-4000-8000-000000000001', 'd2200000-0000-4000-8000-000000000001', now() + interval '2 days', now() + interval '2 days 1 hour'),
  ('d2300000-0000-4000-8000-000000000002', 'd2200000-0000-4000-8000-000000000002', now() + interval '3 days', now() + interval '3 days 1 hour')
on conflict (id) do nothing;

select plan(25);
select has_table('public', 'gym_demo_slots', 'coach slots table exists');
select has_column('public', 'gym_demo_reservations', 'slot_id', 'reservation keeps its selected slot reference');
select has_column('public', 'gym_demo_reservations', 'idempotency_key', 'reservation stores an idempotency key');
select has_column('public', 'gym_demo_reservations', 'request_fingerprint', 'reservation stores a non-sensitive request fingerprint');
select policies_are('public', 'gym_demo_slots', array['gym_demo_slots_read_public_fixtures_or_own_coach']);
select ok(not has_function_privilege('anon', 'public.gym_demo_book_slot(uuid,uuid,uuid,text)', 'execute'), 'anon cannot invoke booking mutation');
select ok(not has_function_privilege('authenticated', 'public.gym_demo_transition_reservation(uuid,text)', 'execute'), 'authenticated cannot invoke state transition');
select ok(not has_table_privilege('authenticated', 'public.gym_demo_slots', 'insert,update,delete'), 'client cannot mutate slots directly');

set local role anon;
select set_config('request.jwt.claim.role', 'anon', true);
select set_config('request.jwt.claim.sub', '', true);
select is((select count(*)::int from public.gym_demo_slots), 1, 'anon sees only the shared fixture slot');
select is((select count(*)::int from public.gym_demo_slots where id = 'd2300000-0000-4000-8000-000000000002'), 0, 'anon cannot see a private coach slot');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000001', true);
select is((select count(*)::int from public.gym_demo_slots where id = 'd2300000-0000-4000-8000-000000000001'), 1, 'athlete sees a fixture slot');
select is((select count(*)::int from public.gym_demo_slots where id = 'd2300000-0000-4000-8000-000000000002'), 0, 'athlete cannot see another coach private slot');
select throws_ok($$select public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000001', 'd2300000-0000-4000-8000-000000000001', 'd2400000-0000-4000-8000-000000000001', 'slot-one')$$,
  '42501', 'permission denied for function gym_demo_book_slot', 'authenticated user cannot book through server-only function');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000002', true);
select is((select count(*)::int from public.gym_demo_slots where id = 'd2300000-0000-4000-8000-000000000002'), 1, 'coach sees their own private slot');

reset role;
set local role service_role;
select set_config('request.jwt.claim.role', 'service_role', true);
select lives_ok($$select public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000001', 'd2300000-0000-4000-8000-000000000001', 'd2400000-0000-4000-8000-000000000001', 'slot-one')$$, 'server books an available fixture slot');
select is(public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000001', 'd2300000-0000-4000-8000-000000000001', 'd2400000-0000-4000-8000-000000000001', 'slot-one'),
  (select id from public.gym_demo_reservations where idempotency_key = 'd2400000-0000-4000-8000-000000000001'), 'same request replay returns the original reservation');
select is((select count(*)::int from public.gym_demo_reservations where idempotency_key = 'd2400000-0000-4000-8000-000000000001'), 1, 'same-key replay creates no duplicate reservation');
select throws_ok($$select public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000001', 'd2300000-0000-4000-8000-000000000001', 'd2400000-0000-4000-8000-000000000001', 'different-request')$$,
  '22023', 'idempotency key reused with different request', 'same key with different payload is rejected');
select throws_ok($$select public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000003', 'd2300000-0000-4000-8000-000000000001', 'd2400000-0000-4000-8000-000000000002', 'athlete-c')$$,
  'P0001', 'slot unavailable', 'second athlete cannot double-book a held slot');

select is(public.gym_demo_transition_reservation((select id from public.gym_demo_reservations where idempotency_key = 'd2400000-0000-4000-8000-000000000001'), 'cancelled'), true,
  'server cancellation performs a state transition');
select is((select state from public.gym_demo_slots where id = 'd2300000-0000-4000-8000-000000000001'), 'available', 'cancellation releases the slot atomically');
select lives_ok($$select public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000003', 'd2300000-0000-4000-8000-000000000001', 'd2400000-0000-4000-8000-000000000003', 'athlete-c')$$,
  'another athlete can book a released slot');
select is(public.gym_demo_transition_reservation((select id from public.gym_demo_reservations where idempotency_key = 'd2400000-0000-4000-8000-000000000003'), 'accepted'), true,
  'server can accept a requested demonstration reservation');
select is(public.gym_demo_transition_reservation((select id from public.gym_demo_reservations where idempotency_key = 'd2400000-0000-4000-8000-000000000003'), 'accepted'), false,
  'repeating the same final transition is idempotent');
select throws_ok($$select public.gym_demo_transition_reservation((select id from public.gym_demo_reservations where idempotency_key = 'd2400000-0000-4000-8000-000000000003'), 'cancelled')$$,
  'P0001', 'reservation is already final', 'accepted reservation cannot be silently reversed');

select * from finish();
rollback;
