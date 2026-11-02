-- Prepared only: inspect deployed schema before applying. No data rewrite or RLS change.
BEGIN;
ALTER TABLE public.gym_coaches DROP CONSTRAINT IF EXISTS gym_coaches_sport_check;
ALTER TABLE public.gym_coaches ADD CONSTRAINT gym_coaches_sport_check CHECK (sport IN ('football', 'basketball', 'fitness', 'sports-de-combat', 'boxe', 'mma', 'pilates', 'coaching-sportif', 'crossfit', 'preparation-physique', 'musculation', 'hyrox', 'perte-de-poids', 'padel')) NOT VALID;
ALTER TABLE public.gym_coaches VALIDATE CONSTRAINT gym_coaches_sport_check;
ALTER TABLE public.gym_reservations DROP CONSTRAINT IF EXISTS gym_reservations_sport_check;
ALTER TABLE public.gym_reservations ADD CONSTRAINT gym_reservations_sport_check CHECK (sport IN ('football', 'basketball', 'fitness', 'sports-de-combat', 'boxe', 'mma', 'pilates', 'coaching-sportif', 'crossfit', 'preparation-physique', 'musculation', 'hyrox', 'perte-de-poids', 'padel')) NOT VALID;
ALTER TABLE public.gym_reservations VALIDATE CONSTRAINT gym_reservations_sport_check;
COMMIT;
