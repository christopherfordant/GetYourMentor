-- MANUAL ONLY: reviewed rollback for the new EMPTY recipe schema.
-- No CASCADE, no product table or historical gym_memory modification.
begin;
do $$
declare ext_schema text;
begin
  select n.nspname into strict ext_schema from pg_extension e
    join pg_namespace n on n.oid=e.extnamespace where e.extname='vector';
  perform set_config('search_path','pg_catalog,gym_rag_s2,' || quote_ident(ext_schema),true);
  if exists(select 1 from gym_rag_s2.collections limit 1) then
    raise exception 'Rollback refused: collection data exists; inventory and approval required';
  end if;
end $$;
drop function gym_rag_s2.search_chunks(uuid,vector,integer);
drop table gym_rag_s2.chunks;
drop table gym_rag_s2.sources;
drop table gym_rag_s2.collections;
drop schema gym_rag_s2;
commit;
