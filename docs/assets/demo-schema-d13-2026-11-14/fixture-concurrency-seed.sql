insert into auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data) values
('d3200000-0000-4000-8000-000000000001','authenticated','authenticated','d13-race-a@example.invalid','',now(),'{}','{}'),
('d3200000-0000-4000-8000-000000000002','authenticated','authenticated','d13-race-b@example.invalid','',now(),'{}','{}') on conflict (id) do nothing;
insert into public.gym_demo_sessions(id,owner_user_id,role) values
('d3210000-0000-4000-8000-000000000001','d3200000-0000-4000-8000-000000000001','sportif'),
('d3210000-0000-4000-8000-000000000002','d3200000-0000-4000-8000-000000000002','sportif') on conflict (id) do nothing;