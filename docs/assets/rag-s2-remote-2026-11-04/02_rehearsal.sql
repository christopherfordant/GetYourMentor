-- PROPOSAL ONLY: not an automatic migration. Apply only to an authorised recipe DB.
-- Existing gym_memory vector(1536) data and product tables are untouched.
begin;
do $$
declare vector_schema text;
begin
  select n.nspname into vector_schema from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace where e.extname = 'vector';
  if vector_schema is null then
    raise exception 'Enable pgvector in the recipe project first; no extension is installed implicitly';
  end if;
  perform set_config('search_path', 'pg_catalog,gym_rag_s2,' || quote_ident(vector_schema), true);
end $$;

create schema gym_rag_s2;
revoke all on schema gym_rag_s2 from public, anon, authenticated;
grant usage on schema gym_rag_s2 to service_role;

-- Each collection identifies the actual encoder artifact and preprocessing pipeline.
-- Qualification evidence is separate; never relabel an existing vector collection.
create table gym_rag_s2.collections (
  id uuid primary key,
  model_id text not null check (length(model_id) between 1 and 200),
  model_revision text not null check (model_revision ~ '^[a-f0-9]{40}$'),
  pipeline_revision text not null check (length(pipeline_revision) between 1 and 100),
  dimension integer not null check (dimension = 384),
  unique (model_id, model_revision, pipeline_revision)
);
create table gym_rag_s2.sources (
  collection_id uuid not null references gym_rag_s2.collections(id) on delete cascade,
  source_key text not null check (length(source_key) between 1 and 300),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  enabled boolean not null default false,
  primary key (collection_id, source_key)
);
create table gym_rag_s2.chunks (
  collection_id uuid not null,
  source_key text not null,
  chunk_index integer not null check (chunk_index >= 0),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  chunk_text text not null check (length(chunk_text) between 1 and 2000),
  embedding vector(384) not null,
  primary key (collection_id, source_key, chunk_index),
  foreign key (collection_id, source_key) references gym_rag_s2.sources on delete cascade,
  check (vector_norm(embedding) between 0.999 and 1.001)
);

alter table gym_rag_s2.collections enable row level security;
alter table gym_rag_s2.sources enable row level security;
alter table gym_rag_s2.chunks enable row level security;
revoke all on all tables in schema gym_rag_s2 from public, anon, authenticated, service_role;
grant select, insert, delete on gym_rag_s2.collections to service_role;
grant select, insert, update, delete on gym_rag_s2.sources, gym_rag_s2.chunks to service_role;

-- Exact search is deliberate for the small recipe corpus. No HNSW overhead yet.
-- Hash mismatch and disabled sources are excluded BEFORE candidate selection.
create function gym_rag_s2.search_chunks(
  requested_collection uuid, query_embedding vector(384), result_limit integer default 8
)
returns table (source_key text, chunk_index integer, chunk_text text, content_hash text, distance double precision)
language plpgsql stable security invoker
set search_path from current
as $$
begin
  if query_embedding is null or vector_dims(query_embedding) <> 384
    or not (vector_norm(query_embedding) between 0.999 and 1.001) then
    raise exception 'Expected a finite, normalised 384-dimensional query';
  end if;
  return query
    select c.source_key, c.chunk_index, c.chunk_text, c.content_hash,
      c.embedding <=> query_embedding
    from gym_rag_s2.chunks c join gym_rag_s2.sources s
      on s.collection_id = c.collection_id and s.source_key = c.source_key
    where c.collection_id = requested_collection and s.enabled
      and s.content_hash = c.content_hash
    order by c.embedding <=> query_embedding, c.source_key, c.chunk_index
    limit greatest(1, least(coalesce(result_limit, 8), 8));
end $$;
revoke all on function gym_rag_s2.search_chunks(uuid, vector, integer) from public, anon, authenticated;
grant execute on function gym_rag_s2.search_chunks(uuid, vector, integer) to service_role;

-- RECIPE ONLY. Run after the reviewed proposal. Synthetic data, always rolled back.

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
select 's2_rehearsal_passed' as checkpoint;
rollback;
