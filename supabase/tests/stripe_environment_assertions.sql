-- LOCAL disposable PostgreSQL only. Synthetic fixtures; never run against Supabase.
BEGIN;
DO $$ BEGIN
 IF (SELECT count(*) FROM public.gym_stripe_environments)<>2 THEN RAISE EXCEPTION 'registry';END IF;
 IF (SELECT count(*) FROM public.gym_stripe_coach_bindings WHERE environment_id='legacy-test')<>1 THEN RAISE EXCEPTION 'copy';END IF;
 IF (SELECT stripe_environment_id FROM public.gym_reservations WHERE id='legacy')<>'legacy-test' THEN RAISE EXCEPTION 'backfill';END IF;
 IF (SELECT stripe_environment_id FROM public.gym_reservations WHERE id='fresh') IS NOT NULL THEN RAISE EXCEPTION 'unclaimed';END IF;
 IF (SELECT financial_snapshot FROM public.gym_reservations WHERE id='legacy')<>'{"gross":4000,"fee":600}'::jsonb THEN RAISE EXCEPTION 'snapshot';END IF;
 IF has_table_privilege('anon','public.gym_stripe_coach_bindings','SELECT') OR has_table_privilege('authenticated','public.gym_stripe_environments','SELECT') THEN RAISE EXCEPTION 'private';END IF;
 IF has_table_privilege('service_role','public.gym_stripe_coach_bindings','UPDATE') OR has_table_privilege('service_role','public.gym_stripe_coach_bindings','DELETE') OR has_table_privilege('service_role','public.gym_stripe_environments','INSERT') THEN RAISE EXCEPTION 'immutable grants';END IF;
 IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.gym_stripe_coach_bindings'::regclass) THEN RAISE EXCEPTION 'RLS';END IF;
END $$;
SET LOCAL ROLE service_role;
INSERT INTO public.gym_stripe_coach_bindings(environment_id,coach_id,stripe_account_id) VALUES('recipe-accounts-v2','coach-fixture','acct_sandboxfixture');
UPDATE public.gym_reservations SET stripe_environment_id='recipe-accounts-v2' WHERE id='fresh';
UPDATE public.gym_reservations SET stripe_connect_account_id='acct_sandboxfixture' WHERE id='fresh';
DO $$ BEGIN
 BEGIN UPDATE public.gym_reservations SET stripe_environment_id='recipe-accounts-v2' WHERE id='legacy'; RAISE EXCEPTION 'switch accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'Stripe environment is immutable' THEN RAISE;END IF;END;
 BEGIN UPDATE public.gym_reservations SET stripe_connect_account_id='acct_legacyfixture' WHERE id='fresh'; RAISE EXCEPTION 'mix accepted'; EXCEPTION WHEN foreign_key_violation THEN NULL;END;
 BEGIN INSERT INTO public.gym_reservations(id,coach_id,stripe_payment_intent_id) VALUES('bad','coach-fixture','pi_fixture');RAISE EXCEPTION 'unscoped accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'Stripe references require an environment' THEN RAISE;END IF;END;
 BEGIN INSERT INTO public.gym_stripe_coach_bindings(environment_id,coach_id,stripe_account_id) VALUES('recipe-accounts-v2','coach-fixture','acct_duplicate');RAISE EXCEPTION 'duplicate accepted'; EXCEPTION WHEN unique_violation THEN NULL;END;
 BEGIN INSERT INTO public.gym_stripe_coach_bindings(environment_id,coach_id,stripe_account_id) VALUES('unknown','coach-other','acct_unknown');RAISE EXCEPTION 'unknown accepted'; EXCEPTION WHEN foreign_key_violation THEN NULL;END;
END $$;
RESET ROLE;
ROLLBACK;
