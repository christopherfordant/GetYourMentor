BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='20s';
DO $$ DECLARE t text; r text; rejected boolean; BEGIN
FOREACH t IN ARRAY ARRAY['gym_coaches','gym_reservations','gym_reservation_slot_claims','gym_reviews','gym_messages','gym_commission_settings','gym_telegram_state','gym_stripe_coach_accounts'] LOOP
 FOREACH r IN ARRAY ARRAY['anon','authenticated'] LOOP
 IF has_table_privilege(r,'public.'||t,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') THEN RAISE EXCEPTION 'Unexpected direct privilege: % %',r,t; END IF;
 END LOOP;
END LOOP;
INSERT INTO public.gym_coaches(id,name,sport) VALUES ('recipe-sql-rollback-20261104','DEMONSTRATION SQL ROLLBACK','fitness');
INSERT INTO public.gym_reservations(id,coach_id,coach_name,sport,city,service,duration,price,slots,financial_snapshot,stripe_payment_intent_id)
VALUES ('recipe-sql-rollback-20261104','recipe-sql-rollback-20261104','DEMONSTRATION SQL ROLLBACK','fitness','Recette','Seance test','60 min',20,'[]','{"grossCents":2000,"platformFeeCents":300,"coachAmountCents":1700,"currency":"eur"}','pi_SQLRollback20261104');
rejected:=false;
BEGIN UPDATE public.gym_reservations SET financial_snapshot='{}' WHERE id='recipe-sql-rollback-20261104';
EXCEPTION WHEN raise_exception THEN rejected:=true; END;
IF NOT rejected THEN RAISE EXCEPTION 'Financial snapshot mutation accepted'; END IF;
INSERT INTO public.gym_reservation_slot_claims(reservation_id,coach_id,slot) VALUES ('recipe-sql-rollback-20261104','recipe-sql-rollback-20261104','2030-01-01T10:00:00Z');
rejected:=false;
BEGIN INSERT INTO public.gym_reservation_slot_claims(reservation_id,coach_id,slot) VALUES ('recipe-sql-rollback-20261104','recipe-sql-rollback-20261104','2030-01-01T10:00:00Z');
EXCEPTION WHEN unique_violation THEN rejected:=true; END;
IF NOT rejected THEN RAISE EXCEPTION 'Duplicate slot accepted'; END IF;
rejected:=false;
BEGIN INSERT INTO public.gym_reservations(id,coach_id,coach_name,sport,city,service,duration,price,slots,stripe_payment_intent_id)
VALUES ('recipe-sql-rollback-duplicate','recipe-sql-rollback-20261104','DEMONSTRATION SQL ROLLBACK','fitness','Recette','Test','60 min',20,'[]','pi_SQLRollback20261104');
EXCEPTION WHEN unique_violation THEN rejected:=true; END;
IF NOT rejected THEN RAISE EXCEPTION 'Duplicate payment accepted'; END IF;
END $$;
SELECT 'database_contracts_passed' AS verification;
ROLLBACK;
