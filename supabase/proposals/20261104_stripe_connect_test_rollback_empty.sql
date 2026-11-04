-- PROPOSAL ONLY. Never removes historical or test payment evidence.
BEGIN;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.gym_stripe_coach_accounts)
 OR EXISTS (SELECT 1 FROM public.gym_reservations WHERE stripe_connect_account_id IS NOT NULL
  OR stripe_transfer_id IS NOT NULL OR stripe_application_fee_id IS NOT NULL) THEN
  RAISE EXCEPTION 'Connect data present: preserve evidence and prepare a reviewed rollback';
 END IF;
END $$;
DROP TABLE public.gym_stripe_coach_accounts;
ALTER TABLE public.gym_reservations DROP COLUMN stripe_connect_account_id;
ALTER TABLE public.gym_reservations DROP COLUMN stripe_transfer_id;
ALTER TABLE public.gym_reservations DROP COLUMN stripe_application_fee_id;
-- Preserve checkout column: may predate this proposal or contain payment evidence.
COMMIT;
