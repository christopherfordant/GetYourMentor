-- STOP WRITERS. Back up both private tables and schema first, even if empty.
-- Caller must explicitly SET gym_reconciliation.backup_confirmed='yes' in this session.
BEGIN;
SET LOCAL lock_timeout='3s';
DO $$ BEGIN IF current_setting('gym_reconciliation.backup_confirmed',true) IS DISTINCT FROM 'yes' THEN RAISE EXCEPTION 'backup confirmation required'; END IF; END $$;
LOCK TABLE public.gym_reservations IN ACCESS EXCLUSIVE MODE;
DROP TRIGGER gym_reconciliation_revision ON public.gym_reservations;
DROP POLICY reconciliation_read_reservations ON public.gym_reservations;
DROP POLICY reconciliation_update_reservations ON public.gym_reservations;
DROP POLICY reconciliation_read_environments ON public.gym_stripe_environments;
DROP POLICY reconciliation_read_bindings ON public.gym_stripe_coach_bindings;
DROP POLICY IF EXISTS reconciliation_lock_environments ON public.gym_stripe_environments;
DROP POLICY IF EXISTS reconciliation_lock_bindings ON public.gym_stripe_coach_bindings;
DROP FUNCTION gym_reconciliation_private.record_intent(text,text,jsonb,jsonb);
DROP FUNCTION gym_reconciliation_private.cas(text,text,jsonb,jsonb);
DROP FUNCTION gym_reconciliation_private.binding(text,text);
DROP FUNCTION gym_reconciliation_private.snapshot(text,text);
DROP FUNCTION gym_reconciliation_private.authorize(text,text[],text);
DROP FUNCTION gym_reconciliation_private.envelope(public.gym_reservations,jsonb);
DROP FUNCTION gym_reconciliation_private.revision_guard();
DROP TABLE gym_reconciliation_private.cancellation_intents;
DROP TABLE gym_reconciliation_private.operators;
REVOKE ALL ON public.gym_reservations,public.gym_stripe_environments,public.gym_stripe_coach_bindings FROM gym_reconciliation_executor;
REVOKE UPDATE(id) ON public.gym_stripe_environments FROM gym_reconciliation_executor;
REVOKE UPDATE(stripe_account_id) ON public.gym_stripe_coach_bindings FROM gym_reconciliation_executor;
REVOKE UPDATE(status,stripe_payment_intent_id,stripe_transfer_id,stripe_application_fee_id,stripe_refund_id,refund_status,refunded_platform_fee_cents) ON public.gym_reservations FROM gym_reconciliation_executor;
DROP SCHEMA gym_reconciliation_private;
ALTER TABLE public.gym_reservations DROP COLUMN reconciliation_revision;
-- Roles intentionally retained NOLOGIN: memberships may have been provisioned separately.
-- No business status/reference is reversed. Intentions require secured backup for recovery.
COMMIT;
