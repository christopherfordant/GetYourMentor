-- READ ONLY. Archived schema is not a substitute for this future authorized check.
BEGIN READ ONLY;
SELECT version();
SELECT table_name,column_name,data_type,is_nullable FROM information_schema.columns
 WHERE table_schema='public' AND table_name IN('gym_reservations','gym_stripe_environments','gym_stripe_coach_bindings') ORDER BY table_name,ordinal_position;
SELECT c.relname,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relname IN('gym_reservations','gym_stripe_environments','gym_stripe_coach_bindings');
SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check FROM pg_policies
 WHERE schemaname='public' AND tablename IN('gym_reservations','gym_stripe_environments','gym_stripe_coach_bindings');
SELECT rolname,rolsuper,rolcreaterole,rolbypassrls FROM pg_roles WHERE rolname IN(current_user,'anon','authenticated','service_role','gym_reconciliation_executor','gym_reconciliation_operator','gym_cancellation_decider');
SELECT nspname FROM pg_namespace WHERE nspname='gym_reconciliation_private';
SELECT count(*) AS reservations,count(*) FILTER(WHERE stripe_environment_id IS NULL) AS without_environment FROM public.gym_reservations;
-- STOP on schema/role/name collisions, missing references, undocumented triggers,
-- unsupported role creation/ownership privileges or exposed private schema.
ROLLBACK;
