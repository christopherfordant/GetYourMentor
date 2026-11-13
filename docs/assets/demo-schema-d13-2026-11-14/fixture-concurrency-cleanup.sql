delete from public.gym_demo_sessions where id in ('d3210000-0000-4000-8000-000000000001','d3210000-0000-4000-8000-000000000002');
delete from auth.users where id in ('d3200000-0000-4000-8000-000000000001','d3200000-0000-4000-8000-000000000002');
delete from public.gym_demo_slots s using public.gym_demo_coaches c where c.id=s.coach_id and c.fixture_key='coach-demo-tennis';
delete from public.gym_demo_coaches where fixture_key='coach-demo-tennis';