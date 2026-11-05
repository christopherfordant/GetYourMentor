-- LOCAL disposable PostgreSQL only. Synthetic fixtures; never run against Supabase.
CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE TABLE public.gym_coaches(id text PRIMARY KEY);
INSERT INTO public.gym_coaches VALUES ('coach-fixture'),('coach-other');
CREATE TABLE public.gym_stripe_coach_accounts(coach_id text PRIMARY KEY REFERENCES public.gym_coaches, stripe_account_id text UNIQUE NOT NULL,mode text NOT NULL DEFAULT 'test',created_at timestamptz NOT NULL DEFAULT now());
INSERT INTO public.gym_stripe_coach_accounts(coach_id,stripe_account_id) VALUES('coach-fixture','acct_legacyfixture');
CREATE TABLE public.gym_reservations(id text PRIMARY KEY,coach_id text,financial_snapshot jsonb,stripe_checkout_session_id text,stripe_payment_intent_id text,stripe_connect_account_id text,stripe_transfer_id text,stripe_application_fee_id text,stripe_refund_id text);
INSERT INTO public.gym_reservations VALUES('legacy','coach-fixture','{"gross":4000,"fee":600}','cs_test_fixture',NULL,'acct_legacyfixture',NULL,NULL,NULL);
INSERT INTO public.gym_reservations(id,coach_id,financial_snapshot) VALUES('fresh','coach-fixture','{"gross":4000,"fee":600}');
ALTER TABLE public.gym_stripe_coach_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gym_stripe_coach_accounts FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT ON public.gym_stripe_coach_accounts TO service_role;
GRANT SELECT,INSERT,UPDATE ON public.gym_reservations TO service_role;
