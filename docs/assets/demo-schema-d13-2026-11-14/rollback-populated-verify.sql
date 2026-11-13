do $$ begin
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='gym_demo_coaches' and column_name='fixture_key') then raise exception 'rollback removed fixture key despite data'; end if;
 if (select count(*) from public.gym_demo_reservations r join public.gym_demo_coaches c on c.id=r.coach_id where c.fixture_key='coach-demo-tennis') <> 2 then raise exception 'rollback changed fixture reservations'; end if;
end $$;