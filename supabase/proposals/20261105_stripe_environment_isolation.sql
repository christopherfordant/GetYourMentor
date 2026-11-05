-- PROPOSAL ONLY: remote application requires explicit user authorization.
-- Target ONLY pqxqqbwesfrefzjoawmx. No RAG/Auth/financial snapshot changes.
BEGIN;
SET LOCAL lock_timeout = '5s';
CREATE TABLE public.gym_stripe_environments (
 id text PRIMARY KEY,
 platform_account_id text NOT NULL UNIQUE CHECK (platform_account_id ~ '^acct_[A-Za-z0-9]+$'),
 kind text NOT NULL CHECK (kind IN ('test_mode','sandbox')),
 mode text NOT NULL CHECK (mode = 'test'),
 created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.gym_stripe_environments(id,platform_account_id,kind,mode) VALUES
 ('legacy-test','acct_1UGhVXPwRppadkVH','test_mode','test'),
 ('recipe-accounts-v2','acct_1UYN06LfnWg4ERQJ','sandbox','test');
ALTER TABLE public.gym_stripe_environments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gym_stripe_environments FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.gym_stripe_environments TO service_role;
CREATE TABLE public.gym_stripe_coach_bindings (
 environment_id text NOT NULL REFERENCES public.gym_stripe_environments(id),
 coach_id text NOT NULL REFERENCES public.gym_coaches(id),
 stripe_account_id text NOT NULL CHECK (stripe_account_id ~ '^acct_[A-Za-z0-9]+$'),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(environment_id,coach_id),
 UNIQUE(environment_id,stripe_account_id),
 UNIQUE(environment_id,coach_id,stripe_account_id)
);
ALTER TABLE public.gym_stripe_coach_bindings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gym_stripe_coach_bindings FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT ON public.gym_stripe_coach_bindings TO service_role;
INSERT INTO public.gym_stripe_coach_bindings(environment_id,coach_id,stripe_account_id,created_at)
 SELECT 'legacy-test',coach_id,stripe_account_id,created_at FROM public.gym_stripe_coach_accounts WHERE mode='test';
ALTER TABLE public.gym_reservations ADD COLUMN stripe_environment_id text REFERENCES public.gym_stripe_environments(id);
UPDATE public.gym_reservations SET stripe_environment_id='legacy-test'
 WHERE stripe_checkout_session_id IS NOT NULL OR stripe_payment_intent_id IS NOT NULL
 OR stripe_connect_account_id IS NOT NULL OR stripe_transfer_id IS NOT NULL
 OR stripe_application_fee_id IS NOT NULL OR stripe_refund_id IS NOT NULL;
ALTER TABLE public.gym_reservations ADD CONSTRAINT gym_reservation_connect_environment_fk
 FOREIGN KEY(stripe_environment_id,coach_id,stripe_connect_account_id)
 REFERENCES public.gym_stripe_coach_bindings(environment_id,coach_id,stripe_account_id);
CREATE FUNCTION public.gym_guard_stripe_environment() RETURNS trigger LANGUAGE plpgsql
 SET search_path=pg_catalog,public AS $$
BEGIN
 IF TG_OP='UPDATE' AND OLD.stripe_environment_id IS NOT NULL
    AND NEW.stripe_environment_id IS DISTINCT FROM OLD.stripe_environment_id THEN
  RAISE EXCEPTION 'Stripe environment is immutable';
 END IF;
 IF NEW.stripe_environment_id IS NULL AND
   (NEW.stripe_checkout_session_id IS NOT NULL OR NEW.stripe_payment_intent_id IS NOT NULL
    OR NEW.stripe_connect_account_id IS NOT NULL OR NEW.stripe_transfer_id IS NOT NULL
    OR NEW.stripe_application_fee_id IS NOT NULL OR NEW.stripe_refund_id IS NOT NULL) THEN
  RAISE EXCEPTION 'Stripe references require an environment';
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.gym_guard_stripe_environment() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER gym_stripe_environment_guard BEFORE INSERT OR UPDATE ON public.gym_reservations
 FOR EACH ROW EXECUTE FUNCTION public.gym_guard_stripe_environment();
COMMIT;
