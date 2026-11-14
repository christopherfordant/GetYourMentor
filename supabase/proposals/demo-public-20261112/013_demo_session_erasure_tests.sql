-- pgTAP contract tests. Synthetic rows are rolled back; local disposable DB only.
begin;

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('d4100000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'erase-a@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('d4100000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'erase-b@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('d4100000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'erase-coach@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('d4100000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'erase-default-ttl@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('d4100000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'erase-expired@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb)
on conflict (id) do nothing;

insert into public.gym_demo_sessions (id, owner_user_id, role, created_at, expires_at)
values
  ('d4110000-0000-4000-8000-000000000001', 'd4100000-0000-4000-8000-000000000001', 'sportif', now(), now() + interval '1 day'),
  ('d4110000-0000-4000-8000-000000000002', 'd4100000-0000-4000-8000-000000000002', 'sportif', now(), now() + interval '1 day'),
  ('d4110000-0000-4000-8000-000000000003', 'd4100000-0000-4000-8000-000000000003', 'coach', now() - interval '2 days', now() - interval '1 day'),
  ('d4110000-0000-4000-8000-000000000005', 'd4100000-0000-4000-8000-000000000005', 'sportif', now() - interval '2 days', now() - interval '1 day');
insert into public.gym_demo_sessions (id, owner_user_id, role)
values ('d4110000-0000-4000-8000-000000000004', 'd4100000-0000-4000-8000-000000000004', 'sportif');

insert into public.gym_demo_coaches (id, owner_session_id, is_fixture, display_name, sport, service_label, display_price_cents)
values
  ('d4120000-0000-4000-8000-000000000001', null, true, 'Coach fictif partagé D1.4', 'Tennis', 'Séance fictive', 4000),
  ('d4120000-0000-4000-8000-000000000002', 'd4110000-0000-4000-8000-000000000003', false, 'Coach privé synthétique', 'Natation', 'Séance fictive', 4000);

insert into public.gym_demo_slots (id, coach_id, starts_at, ends_at, state)
values
  ('d4140000-0000-4000-8000-000000000001', 'd4120000-0000-4000-8000-000000000001', now() + interval '2 days', now() + interval '2 days 1 hour', 'booked'),
  ('d4140000-0000-4000-8000-000000000002', 'd4120000-0000-4000-8000-000000000001', now() + interval '3 days', now() + interval '3 days 1 hour', 'booked');

insert into public.gym_demo_reservations
  (id, athlete_session_id, coach_id, coach_name_snapshot, sport_snapshot, service_snapshot, appointment_at,
   status, approval_mode, display_price_cents, payment_mode, payment_status, slot_id)
values
  ('d4130000-0000-4000-8000-000000000001', 'd4110000-0000-4000-8000-000000000001', 'd4120000-0000-4000-8000-000000000001', 'Coach fictif partagé D1.4', 'Tennis', 'Séance fictive', now() + interval '2 days', 'accepted', 'simulated', 4000, 'simulated', 'not_started', 'd4140000-0000-4000-8000-000000000001'),
  ('d4130000-0000-4000-8000-000000000002', 'd4110000-0000-4000-8000-000000000005', 'd4120000-0000-4000-8000-000000000001', 'Coach fictif partagé D1.4', 'Tennis', 'Séance fictive', now() + interval '3 days', 'accepted', 'simulated', 4000, 'simulated', 'not_started', 'd4140000-0000-4000-8000-000000000002');

insert into public.gym_demo_telegram_links (session_id, consented_at, chat_id_ciphertext, key_version)
values ('d4110000-0000-4000-8000-000000000001', now(), decode('00', 'hex'), 'test-key-v1');

select plan(21);
select ok(has_function_privilege('authenticated', 'public.gym_demo_delete_my_athlete_session(uuid)', 'execute'), 'authenticated role can request own athlete-session deletion');
select ok(not has_function_privilege('anon', 'public.gym_demo_delete_my_athlete_session(uuid)', 'execute'), 'anonymous role cannot invoke self-erasure');
select ok(has_function_privilege('service_role', 'public.gym_demo_purge_expired_athlete_sessions()', 'execute'), 'server role can run the TTL purge');
select ok(not has_function_privilege('authenticated', 'public.gym_demo_purge_expired_athlete_sessions()', 'execute'), 'browser role cannot run the TTL purge');

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', 'd4100000-0000-4000-8000-000000000002', true);
select is(public.gym_demo_delete_my_athlete_session('d4110000-0000-4000-8000-000000000001'), false, 'another athlete cannot erase a session they do not own');
select is((select count(*)::int from public.gym_demo_sessions where id = 'd4110000-0000-4000-8000-000000000001'), 0, 'cross-user attempt does not expose the target session');
select is((select count(*)::int from public.gym_demo_sessions where owner_user_id = 'd4100000-0000-4000-8000-000000000002'), 1, 'cross-user attempt leaves the caller session intact');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', 'd4100000-0000-4000-8000-000000000001', true);
select is(public.gym_demo_delete_my_athlete_session('d4110000-0000-4000-8000-000000000001'), true, 'athlete owner can erase their own active session');
select is(public.gym_demo_delete_my_athlete_session('d4110000-0000-4000-8000-000000000001'), false, 'repeating self-erasure is idempotent');
reset role;
select is((select count(*)::int from public.gym_demo_reservations where athlete_session_id = 'd4110000-0000-4000-8000-000000000001'), 0, 'deletion leaves no athlete reservation');
select is((select count(*)::int from public.gym_demo_telegram_links where session_id = 'd4110000-0000-4000-8000-000000000001'), 0, 'deletion removes notification consent references');
select is((select count(*)::int from public.gym_demo_coaches where id = 'd4120000-0000-4000-8000-000000000001' and is_fixture), 1, 'shared fake coach actor survives tester erasure');
select is((select state from public.gym_demo_slots where id = 'd4140000-0000-4000-8000-000000000001'), 'available', 'self-erasure releases the reusable future slot');

set local role service_role;
select set_config('request.jwt.claim.role', 'service_role', true);
select is(public.gym_demo_purge_expired_athlete_sessions(), 1, 'TTL purge removes expired athlete session data only');
select is(public.gym_demo_purge_expired_athlete_sessions(), 0, 'repeating the TTL purge is idempotent');
select is((select count(*)::int from public.gym_demo_sessions where id = 'd4110000-0000-4000-8000-000000000005'), 0, 'TTL purge removes expired athlete session');
select is((select count(*)::int from public.gym_demo_reservations where athlete_session_id = 'd4110000-0000-4000-8000-000000000005'), 0, 'TTL purge cascades expired reservations');
select is((select count(*)::int from public.gym_demo_sessions where id = 'd4110000-0000-4000-8000-000000000003'), 1, 'TTL purge does not remove coach sessions');
select is((select count(*)::int from public.gym_demo_coaches where id = 'd4120000-0000-4000-8000-000000000001' and is_fixture), 1, 'TTL purge preserves shared fake coach actor');
select is((select state from public.gym_demo_slots where id = 'd4140000-0000-4000-8000-000000000002'), 'available', 'TTL purge releases the expired reservation slot');
reset role;

select ok((select expires_at between statement_timestamp() + interval '23 hours 59 minutes' and statement_timestamp() + interval '24 hours 1 minute'
  from public.gym_demo_sessions where id = 'd4110000-0000-4000-8000-000000000004'), 'new demo session defaults to a 24-hour retention window');

select * from finish();
rollback;
