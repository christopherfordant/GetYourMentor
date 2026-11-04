begin read only;
set local statement_timeout='5s';
select jsonb_build_object(
'vectorVersion',(select extversion from pg_extension where extname='vector'),
's2Exists',exists(select 1 from pg_namespace where nspname='gym_rag_s2'),
'rowCounts',jsonb_build_object('collections',(select count(*) from gym_rag_s2.collections),'sources',(select count(*) from gym_rag_s2.sources),'chunks',(select count(*) from gym_rag_s2.chunks)),
'rls',(select jsonb_agg(jsonb_build_object('table',c.relname,'enabled',c.relrowsecurity)) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='gym_rag_s2' and c.relkind='r'),
'embeddingType',(select format_type(a.atttypid,a.atttypmod) from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='gym_rag_s2' and c.relname='chunks' and a.attname='embedding' and not a.attisdropped),
'privileges',(select jsonb_agg(jsonb_build_object('role',r.rolname,'schemaUsage',has_schema_privilege(r.rolname,'gym_rag_s2','USAGE'),'chunksSelect',has_table_privilege(r.rolname,'gym_rag_s2.chunks','SELECT'),'collectionUpdate',has_table_privilege(r.rolname,'gym_rag_s2.collections','UPDATE'),'searchExecute',has_function_privilege(r.rolname,'gym_rag_s2.search_chunks(uuid,public.vector,integer)','EXECUTE'))) from pg_roles r where r.rolname in ('anon','authenticated','service_role')),
'searchSecurityDefiner',(select p.prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='gym_rag_s2' and p.proname='search_chunks'),
'preservedMetadataHash',(select md5(string_agg(n.nspname||'.'||c.relname||':'||c.oid::text||':'||c.relrowsecurity::text||':'||coalesce(c.relacl::text,'')||':'||a.attname||':'||format_type(a.atttypid,a.atttypmod), E'\n' order by n.nspname,c.relname,a.attnum)) from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped where n.nspname in ('public','gym_memory') and c.relkind='r')
) as recipe_state;
rollback;
