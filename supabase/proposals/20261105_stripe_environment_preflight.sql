-- READ ONLY preflight, run against verified recipe project only; save output privately.
SELECT version();
SELECT c.relname,c.relrowsecurity,pg_get_userbyid(c.relowner) owner,c.relacl
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relname IN ('gym_stripe_coach_accounts','gym_reservations');
SELECT table_name,column_name,data_type,is_nullable,column_default
 FROM information_schema.columns WHERE table_schema='public'
 AND table_name IN ('gym_stripe_coach_accounts','gym_reservations') ORDER BY table_name,ordinal_position;
SELECT conrelid::regclass,conname,pg_get_constraintdef(oid)
 FROM pg_constraint WHERE conrelid IN ('public.gym_stripe_coach_accounts'::regclass,'public.gym_reservations'::regclass);
SELECT tgrelid::regclass,tgname,pg_get_triggerdef(oid)
 FROM pg_trigger WHERE NOT tgisinternal AND tgrelid IN ('public.gym_stripe_coach_accounts'::regclass,'public.gym_reservations'::regclass);
SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check
 FROM pg_policies WHERE schemaname='public' AND tablename IN ('gym_stripe_coach_accounts','gym_reservations');
SELECT count(*) AS orphan_connect_references FROM public.gym_reservations r
 WHERE r.stripe_connect_account_id IS NOT NULL AND NOT EXISTS
 (SELECT 1 FROM public.gym_stripe_coach_accounts a WHERE a.coach_id=r.coach_id AND a.stripe_account_id=r.stripe_connect_account_id AND a.mode='test');
SELECT count(*) AS bindings_to_preserve FROM public.gym_stripe_coach_accounts;
SELECT DISTINCT p.oid::regprocedure,pg_get_functiondef(p.oid)
 FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid
 WHERE NOT t.tgisinternal AND t.tgrelid IN ('public.gym_stripe_coach_accounts'::regclass,'public.gym_reservations'::regclass);
