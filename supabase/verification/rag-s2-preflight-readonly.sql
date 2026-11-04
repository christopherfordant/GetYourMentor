begin read only;
set local statement_timeout = '5s';
select jsonb_build_object(
'vector', (select jsonb_build_object('version',e.extversion,'schema',n.nspname) from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='vector'),
's2Exists', exists(select 1 from pg_namespace where nspname='gym_rag_s2'),
'memoryTables', (select jsonb_agg(jsonb_build_object('table',c.relname,'rls',c.relrowsecurity)) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='gym_memory' and c.relkind='r'),
'embeddingType', (select format_type(a.atttypid,a.atttypmod) from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='gym_memory' and c.relname='document_chunks' and a.attname='embedding' and not a.attisdropped),
'privileges', (select jsonb_agg(jsonb_build_object('role',r.rolname,'bypassRls',r.rolbypassrls,'publicCreate',has_schema_privilege(r.rolname,'public','CREATE'),'memoryUsage',has_schema_privilege(r.rolname,'gym_memory','USAGE'),'chunksSelect',has_table_privilege(r.rolname,'gym_memory.document_chunks','SELECT'))) from pg_roles r where r.rolname in ('anon','authenticated','service_role'))
) as s2_preflight;
rollback;
