-- PROPOSAL ONLY. Requires explicit authorization before remote execution.
-- Target: getyourmentor-preprod (pqxqqbwesfrefzjoawmx), not production.
-- Precondition: existing business schema and commission migrations reviewed.
BEGIN;
CREATE TABLE public.gym_stripe_coach_accounts (
 coach_id text PRIMARY KEY REFERENCES public.gym_coaches(id),
 stripe_account_id text NOT NULL UNIQUE CHECK (stripe_account_id ~ '^acct_[A-Za-z0-9]+$'),
 mode text NOT NULL DEFAULT 'test' CHECK (mode = 'test'),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gym_stripe_coach_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gym_stripe_coach_accounts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.gym_stripe_coach_accounts FROM service_role;
-- Immutable binding: server can create and read, never silently relabel a coach.
GRANT SELECT, INSERT ON public.gym_stripe_coach_accounts TO service_role;
ALTER TABLE public.gym_reservations ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;
ALTER TABLE public.gym_reservations ADD COLUMN IF NOT EXISTS stripe_connect_account_id text;
ALTER TABLE public.gym_reservations ADD COLUMN IF NOT EXISTS stripe_transfer_id text;
ALTER TABLE public.gym_reservations ADD COLUMN IF NOT EXISTS stripe_application_fee_id text;
COMMIT;
-- No account creation, business rows, seeds, grants on unrelated tables or RAG.
