-- PROPOSAL ONLY. Stop all writers and take backup before authorized remote rollback.
BEGIN;
SET LOCAL lock_timeout = '5s';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.gym_stripe_coach_bindings WHERE environment_id <> 'legacy-test')
 OR EXISTS(SELECT 1 FROM public.gym_reservations WHERE stripe_environment_id IS NOT NULL AND stripe_environment_id <> 'legacy-test') THEN
  RAISE EXCEPTION 'Rollback refused: sandbox history exists; retain schema and use forward repair';
 END IF;
END $$;
DROP TRIGGER gym_stripe_environment_guard ON public.gym_reservations;
DROP FUNCTION public.gym_guard_stripe_environment();
ALTER TABLE public.gym_reservations DROP CONSTRAINT gym_reservation_connect_environment_fk;
ALTER TABLE public.gym_reservations DROP COLUMN stripe_environment_id;
DROP TABLE public.gym_stripe_coach_bindings;
DROP TABLE public.gym_stripe_environments;
COMMIT;
