-- pgTAP draft for a disposable local Supabase database only.
-- Not executed in this delivery. Never run against preprod or production.
begin;

-- Fixed synthetic identities make cross-tenant assertions repeatable.
insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('d1000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'demo-athlete-a@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'demo-coach-b@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'demo-athlete-c@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb)
on conflict (id) do nothing;

insert into public.gym_demo_sessions (id, owner_user_id, role)
values
  ('d1100000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'sportif'),
  ('d1100000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000002', 'coach'),
  ('d1100000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000003', 'sportif')
on conflict (id) do nothing;

insert into public.gym_demo_coaches (id, owner_session_id, is_fixture, display_name, sport, service_label, display_price_cents)
values
  ('d1200000-0000-4000-8000-000000000001', null, true, 'Coach fictif commun', 'Tennis', 'Séance de démonstration', 4000),
  ('d1200000-0000-4000-8000-000000000002', 'd1100000-0000-4000-8000-000000000002', false, 'Coach test B', 'Natation', 'Séance de test', 4000)
on conflict (id) do nothing;

insert into public.gym_demo_reservations
  (id, athlete_session_id, coach_id, coach_name_snapshot, sport_snapshot, service_snapshot, appointment_at, display_price_cents)
values
  ('d1300000-0000-4000-8000-000000000001', 'd1100000-0000-4000-8000-000000000001', 'd1200000-0000-4000-8000-000000000002', 'Coach test B', 'Natation', 'Séance de test', now() + interval '1 day', 4000),
  ('d1300000-0000-4000-8000-000000000002', 'd1100000-0000-4000-8000-000000000003', 'd1200000-0000-4000-8000-000000000001', 'Coach fictif commun', 'Tennis', 'Séance de démonstration', now() + interval '1 day', 4000)
on conflict (id) do nothing;

select plan(34);

select has_table('public', 'gym_demo_sessions', 'demo sessions table exists');
select has_table('public', 'gym_demo_coaches', 'demo coaches table exists');
select has_table('public', 'gym_demo_reservations', 'demo reservations table exists');
select has_table('public', 'gym_demo_telegram_links', 'telegram links table exists');
select policies_are('public', 'gym_demo_sessions', array['gym_demo_sessions_select_owner','gym_demo_sessions_insert_owner','gym_demo_sessions_delete_owner']);
select policies_are('public', 'gym_demo_coaches', array['gym_demo_coaches_read_fixture_or_owner','gym_demo_coaches_insert_owner','gym_demo_coaches_update_owner','gym_demo_coaches_delete_owner']);
select policies_are('public', 'gym_demo_reservations', array['gym_demo_reservations_read_participants']);
select policies_are('public', 'gym_demo_telegram_links', array[]::text[]);
select ok(has_table_privilege('anon', 'public.gym_demo_sessions', 'select'), 'anon has only the SQL privilege needed by the fixture policy predicate');
select ok(has_table_privilege('anon', 'public.gym_demo_coaches', 'select'), 'anon can read only fixture coaches through RLS');
select ok(not has_table_privilege('authenticated', 'public.gym_demo_reservations', 'insert,update,delete'), 'client cannot write reservation/payment state directly');
select ok(not has_table_privilege('authenticated', 'public.gym_demo_telegram_links', 'select'), 'client cannot read encrypted Telegram destination');
select ok(has_table_privilege('service_role', 'public.gym_demo_reservations', 'select,insert,update,delete'), 'server role has reservation operations');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select is((select count(*)::int from public.gym_demo_coaches), 1, 'visitor sees the shared fixture, not private coach profiles');
select is((select count(*)::int from public.gym_demo_sessions), 0, 'visitor cannot see sessions because no anon RLS policy exists');
select is((select count(*)::int from public.gym_demo_reservations), 0, 'visitor cannot see reservations');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'd1000000-0000-4000-8000-000000000001', true);
select is((select count(*)::int from public.gym_demo_sessions), 1, 'athlete sees only their session');
select is((select count(*)::int from public.gym_demo_reservations), 1, 'athlete sees their own reservation');
select is((select count(*)::int from public.gym_demo_reservations where id = 'd1300000-0000-4000-8000-000000000002'), 0, 'athlete cannot see another athlete reservation');
select is((with deleted as (delete from public.gym_demo_sessions where id = 'd1100000-0000-4000-8000-000000000002' returning id) select count(*)::int from deleted), 0, 'athlete cannot delete another users session');
select is((with deleted as (delete from public.gym_demo_coaches where id = 'd1200000-0000-4000-8000-000000000001' returning id) select count(*)::int from deleted), 0, 'athlete cannot delete a shared fixture');

select set_config('request.jwt.claim.sub', 'd1000000-0000-4000-8000-000000000002', true);
select is((select count(*)::int from public.gym_demo_coaches where id = 'd1200000-0000-4000-8000-000000000002'), 1, 'coach sees their own profile');
select is((select count(*)::int from public.gym_demo_reservations), 1, 'coach sees reservations linked to their own profile');
select is((select count(*)::int from public.gym_demo_reservations where id = 'd1300000-0000-4000-8000-000000000002'), 0, 'coach cannot see an unrelated fixture reservation');

reset role;
set local role service_role;
select is((select count(*)::int from public.gym_demo_reservations), 2, 'server role can read reservations for controlled processing');
insert into public.gym_demo_telegram_links (session_id, consented_at, chat_id_ciphertext, key_version)
values ('d1100000-0000-4000-8000-000000000002', now(), decode('00', 'hex'), 'test-key-v1');
select is((select count(*)::int from public.gym_demo_telegram_links where session_id = 'd1100000-0000-4000-8000-000000000002' and revoked_at is null), 1, 'server stores a Telegram link only after a consent timestamp exists');
update public.gym_demo_telegram_links set revoked_at = now() where session_id = 'd1100000-0000-4000-8000-000000000002';
select is((select count(*)::int from public.gym_demo_telegram_links where session_id = 'd1100000-0000-4000-8000-000000000002' and revoked_at is not null), 1, 'server can record Telegram consent revocation');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'd1000000-0000-4000-8000-000000000001', true);
select is((with deleted as (delete from public.gym_demo_sessions where id = 'd1100000-0000-4000-8000-000000000001' returning id) select count(*)::int from deleted), 1, 'athlete can delete their own demo session');
select is((select count(*)::int from public.gym_demo_sessions where id = 'd1100000-0000-4000-8000-000000000001'), 0, 'deleted session is no longer visible');
select is((select count(*)::int from public.gym_demo_reservations where id = 'd1300000-0000-4000-8000-000000000001'), 0, 'deleting athlete session removes its reservation');
select set_config('request.jwt.claim.sub', 'd1000000-0000-4000-8000-000000000003', true);
select is((select count(*)::int from public.gym_demo_sessions), 1, 'another athlete session survives a users deletion');
select is((select count(*)::int from public.gym_demo_reservations), 1, 'another athletes reservation survives a users deletion');

reset role;
select throws_ok($$insert into public.gym_demo_reservations (athlete_session_id, coach_id, coach_name_snapshot, sport_snapshot, service_snapshot, appointment_at, display_price_cents, approval_mode) values ('d1100000-0000-4000-8000-000000000001', 'd1200000-0000-4000-8000-000000000002', 'Coach test B', 'Natation', 'Séance de test', now(), 4000, 'real')$$, '23514', 'non-simulated coach approval is rejected');
select throws_ok($$insert into public.gym_demo_reservations (athlete_session_id, coach_id, coach_name_snapshot, sport_snapshot, service_snapshot, appointment_at, display_price_cents, payment_mode) values ('d1100000-0000-4000-8000-000000000001', 'd1200000-0000-4000-8000-000000000002', 'Coach test B', 'Natation', 'Séance de test', now(), 4000, 'live')$$, '23514', 'non-simulated payment is rejected');

select * from finish();
rollback;
