-- RECIPE ONLY. Run after the reviewed proposal. Synthetic data, always rolled back.
begin;
do $$
declare ext_schema text;
begin
  select n.nspname into strict ext_schema from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace where e.extname = 'vector';
  perform set_config('search_path', 'pg_catalog,gym_rag_s2,' || quote_ident(ext_schema), true);
end $$;
do $$
declare
  a uuid := '91e3559a-3070-46da-a98d-f70b09374001';
  b uuid := '91e3559a-3070-46da-a98d-f70b09374002';
  v vector := (array[1::real] || array_fill(0::real, array[383]))::vector;
  n integer;
begin
  insert into gym_rag_s2.collections values
    (a,'synthetic-test',repeat('a',40),'fixture-v1',384),
    (b,'synthetic-test',repeat('b',40),'fixture-v1',384);
  insert into gym_rag_s2.sources values
    (a,'fixture',repeat('a',64),true),(b,'other',repeat('a',64),true);
  insert into gym_rag_s2.chunks values
    (a,'fixture',0,repeat('a',64),'Synthetic source A',v),
    (b,'other',0,repeat('a',64),'Synthetic source B',v);
  select count(*) into n from gym_rag_s2.search_chunks(a,v,8);
  if n <> 1 then raise exception 'Collection isolation failed'; end if;
  insert into gym_rag_s2.chunks
    select a,'fixture',i,repeat('a',64),'Synthetic extra chunk',v from generate_series(1,10) i;
  select count(*) into n from gym_rag_s2.search_chunks(a,v,999);
  if n <> 8 then raise exception 'Result budget exceeded'; end if;
  delete from gym_rag_s2.chunks where collection_id=a and chunk_index>0;
  begin
    insert into gym_rag_s2.chunks values (a,'fixture',1,repeat('a',64),'Wrong dimensions','[1,0]'::vector);
    raise exception 'Wrong dimensions accepted';
  exception when data_exception then null;
  end;
  begin
    perform * from gym_rag_s2.search_chunks(a,'[1,0]'::vector,8);
    raise exception 'Wrong query dimensions accepted';
  exception when raise_exception then
    if sqlerrm <> 'Expected a finite, normalised 384-dimensional query' then raise; end if;
  end;
  begin
    insert into gym_rag_s2.collections values
      ('91e3559a-3070-46da-a98d-f70b09374003','invalid',repeat('c',40),'fixture-v1',1536);
    raise exception 'Wrong model dimension accepted';
  exception when check_violation then null;
  end;
  begin
    perform * from gym_rag_s2.search_chunks(a,array_fill(0::real,array[384])::vector,8);
    raise exception 'Zero query accepted';
  exception when raise_exception then
    if sqlerrm <> 'Expected a finite, normalised 384-dimensional query' then raise; end if;
  end;
  update gym_rag_s2.sources set content_hash = repeat('b',64) where collection_id=a;
  select count(*) into n from gym_rag_s2.search_chunks(a,v,8);
  if n <> 0 then raise exception 'Stale source was retrieved'; end if;
  update gym_rag_s2.chunks set content_hash=repeat('b',64), chunk_text='Updated synthetic source' where collection_id=a;
  select count(*) into n from gym_rag_s2.search_chunks(a,v,8) where chunk_text='Updated synthetic source';
  if n <> 1 then raise exception 'Updated source missing'; end if;
  update gym_rag_s2.sources set enabled=false where collection_id=a;
  select count(*) into n from gym_rag_s2.search_chunks(a,v,8);
  if n <> 0 then raise exception 'Disabled source was retrieved'; end if;
  delete from gym_rag_s2.sources where collection_id=a;
  select count(*) into n from gym_rag_s2.chunks where collection_id=a;
  if n <> 0 then raise exception 'Cascade deletion failed'; end if;
  if has_schema_privilege('anon','gym_rag_s2','USAGE')
    or has_schema_privilege('authenticated','gym_rag_s2','USAGE') then
    raise exception 'Private schema exposed';
  end if;
  if has_function_privilege('anon','gym_rag_s2.search_chunks(uuid,vector,integer)','EXECUTE')
    or has_function_privilege('authenticated','gym_rag_s2.search_chunks(uuid,vector,integer)','EXECUTE') then
    raise exception 'Client search allowed';
  end if;
  raise notice 'Recipe assertions passed; synthetic vectors only, no embedding qualification';
end $$;

-- Real permission-denial calls, not just introspection of grants. Recipe owner only.
set local role anon;
do $$
begin
  begin
    perform * from gym_rag_s2.search_chunks(null, null, 8);
    raise exception 'Anonymous call unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
set local role authenticated;
do $$
begin
  begin
    perform * from gym_rag_s2.search_chunks(null, null, 8);
    raise exception 'Authenticated client call unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
set local role service_role;
do $$
declare n integer;
begin
  select count(*) into n from gym_rag_s2.search_chunks(
    '91e3559a-3070-46da-a98d-f70b09374002',
    (array[1::real] || array_fill(0::real, array[383]))::vector, 8);
  if n <> 1 then raise exception 'Server role search failed'; end if;
  begin
    update gym_rag_s2.collections set model_revision=repeat('c',40)
      where id='91e3559a-3070-46da-a98d-f70b09374002';
    raise exception 'Server role relabelled collection';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select 's2_persistent_recipe_passed' as checkpoint;
rollback;
