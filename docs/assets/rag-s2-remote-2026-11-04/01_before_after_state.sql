begin read only;
set local statement_timeout='5s';
select jsonb_build_object(
'vectorVersion',(select extversion from pg_extension where extname='vector'),
's2Exists',exists(select 1 from pg_namespace where nspname='gym_rag_s2'),
'preservedMetadataHash',(select md5(string_agg(n.nspname||'.'||c.relname||':'||c.oid::text||':'||c.relrowsecurity::text||':'||coalesce(c.relacl::text,'')||':'||a.attname||':'||format_type(a.atttypid,a.atttypmod), E'\n' order by n.nspname,c.relname,a.attnum)) from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped where n.nspname in ('public','gym_memory') and c.relkind='r')
) as recipe_state;
rollback;
