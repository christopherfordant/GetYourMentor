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

-- One fixed model space. 384 is a candidate contract, not a qualification claim.
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
revoke all on all tables in schema gym_rag_s2 from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema gym_rag_s2 to service_role;

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
commit;
