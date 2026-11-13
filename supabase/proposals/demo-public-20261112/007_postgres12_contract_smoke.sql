-- Compatibility smoke test for a disposable plain PostgreSQL 12 cluster.
-- Requires 001 + 004 and a minimal local auth schema/roles shim.
-- This is NOT a Supabase or pgTAP test. All synthetic rows roll back.
begin;
insert into auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data) values
 ('d2000000-0000-4000-8000-000000000001','authenticated','authenticated','athlete-a@example.invalid','',now(),'{}','{}'),
 ('d2000000-0000-4000-8000-000000000002','authenticated','authenticated','coach-b@example.invalid','',now(),'{}','{}'),
 ('d2000000-0000-4000-8000-000000000003','authenticated','authenticated','athlete-c@example.invalid','',now(),'{}','{}');
insert into public.gym_demo_sessions (id,owner_user_id,role) values
 ('d2100000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','sportif'),
 ('d2100000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000002','coach'),
 ('d2100000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000003','sportif');
insert into public.gym_demo_coaches (id,owner_session_id,is_fixture,display_name,sport,service_label,display_price_cents) values
 ('d2200000-0000-4000-8000-000000000001',null,true,'Coach fixture','Tennis','Séance démo',4000),
 ('d2200000-0000-4000-8000-000000000002','d2100000-0000-4000-8000-000000000002',false,'Coach private','Natation','Séance privée',5000);
insert into public.gym_demo_slots (id,coach_id,starts_at,ends_at) values
 ('d2300000-0000-4000-8000-000000000001','d2200000-0000-4000-8000-000000000001',now()+interval '2 days',now()+interval '2 days 1 hour'),
 ('d2300000-0000-4000-8000-000000000002','d2200000-0000-4000-8000-000000000002',now()+interval '3 days',now()+interval '3 days 1 hour');

do $$ begin
 if has_function_privilege('anon','public.gym_demo_book_slot(uuid,uuid,uuid,text)','execute') then raise exception 'anon has mutation execute'; end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.role','anon',true);
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if (select count(*) from public.gym_demo_slots) <> 1 then raise exception 'anon fixture visibility failed'; end if;
 if (select count(*) from public.gym_demo_slots where id='d2300000-0000-4000-8000-000000000002') <> 0 then raise exception 'anon saw private slot'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','d2000000-0000-4000-8000-000000000001',true);
do $$ begin
 if (select count(*) from public.gym_demo_slots where id='d2300000-0000-4000-8000-000000000001') <> 1 then raise exception 'athlete fixture visibility failed'; end if;
 if (select count(*) from public.gym_demo_slots where id='d2300000-0000-4000-8000-000000000002') <> 0 then raise exception 'athlete saw another coach slot'; end if;
 if has_function_privilege('authenticated','public.gym_demo_book_slot(uuid,uuid,uuid,text)','execute') then raise exception 'authenticated has mutation execute'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','d2000000-0000-4000-8000-000000000002',true);
do $$ begin
 if (select count(*) from public.gym_demo_slots where id='d2300000-0000-4000-8000-000000000002') <> 1 then raise exception 'coach own slot visibility failed'; end if;
end $$;
reset role;
set local role service_role;
select set_config('request.jwt.claim.role','service_role',true);
do $$
declare first_id uuid; replay_id uuid; other_id uuid; changed boolean; failure_message text;
begin
 first_id := public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000001','d2300000-0000-4000-8000-000000000001','d2400000-0000-4000-8000-000000000001','slot-one');
 replay_id := public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000001','d2300000-0000-4000-8000-000000000001','d2400000-0000-4000-8000-000000000001','slot-one');
 if first_id <> replay_id then raise exception 'same-key replay returned a different id'; end if;
 if (select count(*) from public.gym_demo_reservations where idempotency_key='d2400000-0000-4000-8000-000000000001') <> 1 then raise exception 'same-key replay duplicated reservation'; end if;
 begin
  perform public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000001','d2300000-0000-4000-8000-000000000001','d2400000-0000-4000-8000-000000000001','different-request');
  raise exception 'different payload unexpectedly accepted';
 exception when sqlstate '22023' then null;
 end;
 begin
  perform public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000003','d2300000-0000-4000-8000-000000000001','d2400000-0000-4000-8000-000000000002','athlete-c');
  raise exception 'double booking unexpectedly accepted';
 exception when sqlstate 'P0001' then
  get stacked diagnostics failure_message = message_text;
  if failure_message <> 'slot unavailable' then raise; end if;
 end;
 changed := public.gym_demo_transition_reservation(first_id,'cancelled');
 if not changed or (select state from public.gym_demo_slots where id='d2300000-0000-4000-8000-000000000001') <> 'available' then raise exception 'cancellation did not release slot'; end if;
 other_id := public.gym_demo_book_slot('d2100000-0000-4000-8000-000000000003','d2300000-0000-4000-8000-000000000001','d2400000-0000-4000-8000-000000000003','athlete-c');
 changed := public.gym_demo_transition_reservation(other_id,'accepted');
 if not changed or public.gym_demo_transition_reservation(other_id,'accepted') then raise exception 'transition replay contract failed'; end if;
 begin
  perform public.gym_demo_transition_reservation(other_id,'cancelled');
  raise exception 'final state unexpectedly reversed';
 exception when sqlstate 'P0001' then
  get stacked diagnostics failure_message = message_text;
  if failure_message <> 'reservation is already final' then raise; end if;
 end;
end $$;
rollback;
