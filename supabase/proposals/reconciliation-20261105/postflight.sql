BEGIN READ ONLY;
SELECT n.nspname,p.proname,p.prosecdef,p.proconfig,pg_get_userbyid(p.proowner) AS owner,p.proacl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='gym_reconciliation_private' ORDER BY p.proname;
SELECT schemaname,tablename,policyname,roles,cmd FROM pg_policies WHERE schemaname='gym_reconciliation_private' OR policyname LIKE 'reconciliation_%';
SELECT rolname,rolcanlogin,rolsuper,rolbypassrls FROM pg_roles WHERE rolname LIKE 'gym_reconciliation_%' OR rolname='gym_cancellation_decider';
SELECT count(*) AS reservations,count(*) FILTER(WHERE reconciliation_revision<0) AS invalid_revision FROM public.gym_reservations;
SELECT count(*) AS permissions FROM gym_reconciliation_private.operators;
-- Must be zero immediately after migration, before separate provisioning.
SELECT count(*) AS intentions FROM gym_reconciliation_private.cancellation_intents;
ROLLBACK;
