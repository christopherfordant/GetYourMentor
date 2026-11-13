set role service_role;
select set_config('request.jwt.claim.role','service_role',false);
select pg_sleep(1);
select public.gym_demo_book_and_accept_fixture('d3210000-0000-4000-8000-000000000001','coach-demo-tennis','tennis-matin','d3220000-0000-4000-8000-000000000001');