-- PROPOSAL ONLY. No remote authorization. Run preflight and backup first.
BEGIN;
SET LOCAL lock_timeout='3s';
SET LOCAL statement_timeout='15s';
CREATE ROLE gym_reconciliation_executor NOLOGIN NOBYPASSRLS;
CREATE ROLE gym_reconciliation_operator NOLOGIN NOBYPASSRLS;
CREATE ROLE gym_cancellation_decider NOLOGIN NOBYPASSRLS;
CREATE SCHEMA gym_reconciliation_private;
REVOKE ALL ON SCHEMA gym_reconciliation_private FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SCHEMA gym_reconciliation_private TO gym_reconciliation_operator,gym_cancellation_decider;
GRANT USAGE,CREATE ON SCHEMA gym_reconciliation_private TO gym_reconciliation_executor;
ALTER TABLE public.gym_reservations ADD COLUMN reconciliation_revision bigint NOT NULL DEFAULT 0;
CREATE TABLE gym_reconciliation_private.operators(
 principal name NOT NULL, environment_id text NOT NULL REFERENCES public.gym_stripe_environments(id),
 modes text[] NOT NULL, targets text[] NOT NULL, expires_at timestamptz NOT NULL, enabled boolean NOT NULL DEFAULT true,
 PRIMARY KEY(principal,environment_id), CHECK(cardinality(targets)<=100), CHECK(modes<@ARRAY['diagnose','resume','intent']::text[])
);
CREATE TABLE gym_reconciliation_private.cancellation_intents(
 reservation_id text PRIMARY KEY REFERENCES public.gym_reservations(id), body jsonb NOT NULL CHECK(jsonb_typeof(body)='object'), created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE gym_reconciliation_private.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_reconciliation_private.cancellation_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA gym_reconciliation_private FROM PUBLIC,anon,authenticated,service_role,gym_reconciliation_operator,gym_cancellation_decider;
GRANT SELECT ON gym_reconciliation_private.operators TO gym_reconciliation_executor;
GRANT SELECT,INSERT ON gym_reconciliation_private.cancellation_intents TO gym_reconciliation_executor;
CREATE POLICY executor_read_operators ON gym_reconciliation_private.operators FOR SELECT TO gym_reconciliation_executor USING(true);
CREATE POLICY executor_read_intents ON gym_reconciliation_private.cancellation_intents FOR SELECT TO gym_reconciliation_executor USING(true);
CREATE POLICY executor_insert_intents ON gym_reconciliation_private.cancellation_intents FOR INSERT TO gym_reconciliation_executor WITH CHECK(true);
GRANT SELECT ON public.gym_reservations,public.gym_stripe_environments,public.gym_stripe_coach_bindings TO gym_reconciliation_executor;
-- PostgreSQL requires UPDATE privilege for row locks; WITH CHECK false forbids mutations.
GRANT UPDATE(id) ON public.gym_stripe_environments TO gym_reconciliation_executor;
GRANT UPDATE(stripe_account_id) ON public.gym_stripe_coach_bindings TO gym_reconciliation_executor;
GRANT UPDATE(status,stripe_payment_intent_id,stripe_transfer_id,stripe_application_fee_id,stripe_refund_id,refund_status,refunded_platform_fee_cents) ON public.gym_reservations TO gym_reconciliation_executor;
CREATE POLICY reconciliation_read_reservations ON public.gym_reservations FOR SELECT TO gym_reconciliation_executor USING(true);
CREATE POLICY reconciliation_update_reservations ON public.gym_reservations FOR UPDATE TO gym_reconciliation_executor USING(true) WITH CHECK(true);
CREATE POLICY reconciliation_read_environments ON public.gym_stripe_environments FOR SELECT TO gym_reconciliation_executor USING(true);
CREATE POLICY reconciliation_read_bindings ON public.gym_stripe_coach_bindings FOR SELECT TO gym_reconciliation_executor USING(true);
CREATE POLICY reconciliation_lock_environments ON public.gym_stripe_environments FOR UPDATE TO gym_reconciliation_executor USING(true) WITH CHECK(false);
CREATE POLICY reconciliation_lock_bindings ON public.gym_stripe_coach_bindings FOR UPDATE TO gym_reconciliation_executor USING(true) WITH CHECK(false);
CREATE FUNCTION gym_reconciliation_private.revision_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN NEW.reconciliation_revision:=OLD.reconciliation_revision+1; RETURN NEW; END $$;
CREATE TRIGGER gym_reconciliation_revision BEFORE UPDATE ON public.gym_reservations FOR EACH ROW EXECUTE FUNCTION gym_reconciliation_private.revision_guard();

CREATE FUNCTION gym_reconciliation_private.authorize(p_env text,p_ids text[],p_mode text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,gym_reconciliation_private AS $$
DECLARE e public.gym_stripe_environments%ROWTYPE;
BEGIN
 IF p_ids IS NULL OR cardinality(p_ids)>100 OR p_mode NOT IN('diagnose','resume','intent') THEN RAISE EXCEPTION 'maintenance refused'; END IF;
 IF NOT pg_has_role(session_user,CASE WHEN p_mode='intent' THEN 'gym_cancellation_decider' ELSE 'gym_reconciliation_operator' END,'member') THEN RAISE EXCEPTION 'maintenance refused'; END IF;
 IF NOT EXISTS(SELECT 1 FROM gym_reconciliation_private.operators WHERE principal=session_user AND environment_id=p_env AND enabled AND expires_at>clock_timestamp() AND p_mode=ANY(modes) AND targets @> p_ids) THEN RAISE EXCEPTION 'maintenance refused'; END IF;
 SELECT * INTO STRICT e FROM public.gym_stripe_environments WHERE id=p_env AND mode='test';
 RETURN jsonb_build_object('id',e.id,'platform',e.platform_account_id);
END $$;
CREATE FUNCTION gym_reconciliation_private.envelope(r public.gym_reservations,i jsonb) RETURNS jsonb
LANGUAGE sql SET search_path=pg_catalog,gym_reconciliation_private AS $$
 SELECT jsonb_build_object('row',to_jsonb(r),'intent',i,
 'environment',(SELECT jsonb_build_object('id',e.id,'platform',e.platform_account_id,'mode',e.mode) FROM public.gym_stripe_environments e WHERE e.id=r.stripe_environment_id),
 'binding',(SELECT b.stripe_account_id FROM public.gym_stripe_coach_bindings b WHERE b.environment_id=r.stripe_environment_id AND b.coach_id=r.coach_id));
$$;
CREATE FUNCTION gym_reconciliation_private.snapshot(p_env text,p_id text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,gym_reconciliation_private AS $$
DECLARE r public.gym_reservations%ROWTYPE; i jsonb;
BEGIN
 PERFORM gym_reconciliation_private.authorize(p_env,ARRAY[p_id],'diagnose');
 SELECT * INTO r FROM public.gym_reservations WHERE id=p_id AND stripe_environment_id=p_env FOR SHARE;
 IF NOT FOUND THEN RETURN NULL; END IF;
 SELECT body INTO i FROM gym_reconciliation_private.cancellation_intents WHERE reservation_id=p_id;
 RETURN gym_reconciliation_private.envelope(r,i);
END $$;
CREATE FUNCTION gym_reconciliation_private.binding(p_env text,p_id text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,gym_reconciliation_private AS $$
DECLARE r public.gym_reservations%ROWTYPE; account text;
BEGIN
 PERFORM gym_reconciliation_private.authorize(p_env,ARRAY[p_id],'diagnose');
 SELECT * INTO STRICT r FROM public.gym_reservations WHERE id=p_id AND stripe_environment_id=p_env;
 SELECT stripe_account_id INTO account FROM public.gym_stripe_coach_bindings WHERE environment_id=p_env AND coach_id=r.coach_id;
 RETURN account;
END $$;
CREATE FUNCTION gym_reconciliation_private.cas(p_env text,p_id text,p_expected jsonb,p_patch jsonb) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,gym_reconciliation_private AS $$
DECLARE r public.gym_reservations%ROWTYPE; i jsonb;
BEGIN
 PERFORM gym_reconciliation_private.authorize(p_env,ARRAY[p_id],'resume');
 IF p_patch IS NULL OR jsonb_typeof(p_patch)<>'object' OR p_patch='{}'::jsonb OR EXISTS(SELECT 1 FROM jsonb_object_keys(p_patch) k WHERE k NOT IN('status','stripe_payment_intent_id','stripe_transfer_id','stripe_application_fee_id','stripe_refund_id','refund_status','refunded_platform_fee_cents')) THEN RAISE EXCEPTION 'patch refused'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_each(p_patch) AS e(k,v) WHERE NOT(k='stripe_application_fee_id' AND v='null'::jsonb) AND (v='null'::jsonb OR (k='refunded_platform_fee_cents' AND jsonb_typeof(v)<>'number') OR (k<>'refunded_platform_fee_cents' AND jsonb_typeof(v)<>'string'))) THEN RAISE EXCEPTION 'patch type refused'; END IF;
 SELECT * INTO r FROM public.gym_reservations WHERE id=p_id AND stripe_environment_id=p_env FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 SELECT body INTO i FROM gym_reconciliation_private.cancellation_intents WHERE reservation_id=p_id;
 PERFORM 1 FROM public.gym_stripe_environments WHERE id=p_env FOR SHARE;
 PERFORM 1 FROM public.gym_stripe_coach_bindings WHERE environment_id=p_env AND coach_id=r.coach_id FOR SHARE;
 IF gym_reconciliation_private.envelope(r,i) IS DISTINCT FROM p_expected THEN RETURN false; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.gym_stripe_coach_bindings WHERE environment_id=p_env AND coach_id=r.coach_id AND stripe_account_id=r.stripe_connect_account_id) THEN RAISE EXCEPTION 'binding refused'; END IF;
 IF p_patch ? 'status' AND NOT(r.status='accepted' AND p_patch->>'status'='paid') THEN RAISE EXCEPTION 'transition refused'; END IF;
 IF p_patch ? 'refund_status' AND (r.status<>'cancelled' OR p_patch->>'refund_status' NOT IN('pending','succeeded') OR (r.refund_status='succeeded' AND p_patch->>'refund_status'<>'succeeded')) THEN RAISE EXCEPTION 'refund transition refused'; END IF;
 IF (p_patch ? 'stripe_payment_intent_id' AND (p_patch->>'stripe_payment_intent_id' !~ '^pi_[A-Za-z0-9]+$' OR (r.stripe_payment_intent_id IS NOT NULL AND r.stripe_payment_intent_id IS DISTINCT FROM p_patch->>'stripe_payment_intent_id')))
 OR (p_patch ? 'stripe_transfer_id' AND (p_patch->>'stripe_transfer_id' !~ '^tr_[A-Za-z0-9]+$' OR (r.stripe_transfer_id IS NOT NULL AND r.stripe_transfer_id IS DISTINCT FROM p_patch->>'stripe_transfer_id')))
 OR (p_patch ? 'stripe_application_fee_id' AND (p_patch->>'stripe_application_fee_id' !~ '^fee_[A-Za-z0-9]+$' OR (r.stripe_application_fee_id IS NOT NULL AND r.stripe_application_fee_id IS DISTINCT FROM p_patch->>'stripe_application_fee_id')))
 OR (p_patch ? 'stripe_refund_id' AND (p_patch->>'stripe_refund_id' !~ '^re_[A-Za-z0-9]+$' OR (r.stripe_refund_id IS NOT NULL AND r.stripe_refund_id IS DISTINCT FROM p_patch->>'stripe_refund_id'))) THEN RAISE EXCEPTION 'reference refused'; END IF;
 IF p_patch ? 'refunded_platform_fee_cents' AND ((p_patch->>'refunded_platform_fee_cents')::bigint<0 OR (p_patch->>'refunded_platform_fee_cents')::bigint>(r.financial_snapshot->>'platformFeeCents')::bigint) THEN RAISE EXCEPTION 'fee refused'; END IF;
 UPDATE public.gym_reservations SET
 status=CASE WHEN p_patch ? 'status' THEN p_patch->>'status' ELSE status END,
 stripe_payment_intent_id=CASE WHEN p_patch ? 'stripe_payment_intent_id' THEN p_patch->>'stripe_payment_intent_id' ELSE stripe_payment_intent_id END,
 stripe_transfer_id=CASE WHEN p_patch ? 'stripe_transfer_id' THEN p_patch->>'stripe_transfer_id' ELSE stripe_transfer_id END,
 stripe_application_fee_id=CASE WHEN p_patch ? 'stripe_application_fee_id' THEN p_patch->>'stripe_application_fee_id' ELSE stripe_application_fee_id END,
 stripe_refund_id=CASE WHEN p_patch ? 'stripe_refund_id' THEN p_patch->>'stripe_refund_id' ELSE stripe_refund_id END,
 refund_status=CASE WHEN p_patch ? 'refund_status' THEN p_patch->>'refund_status' ELSE refund_status END,
 refunded_platform_fee_cents=CASE WHEN p_patch ? 'refunded_platform_fee_cents' THEN (p_patch->>'refunded_platform_fee_cents')::bigint ELSE refunded_platform_fee_cents END WHERE id=p_id;
 RETURN true;
END $$;
CREATE FUNCTION gym_reconciliation_private.record_intent(p_env text,p_id text,p_expected jsonb,p_intent jsonb) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,gym_reconciliation_private AS $$
DECLARE r public.gym_reservations%ROWTYPE; prior jsonb; percent integer; amount bigint; fee bigint; decided timestamptz; expected_key text;
BEGIN
 PERFORM gym_reconciliation_private.authorize(p_env,ARRAY[p_id],'intent');
 SELECT * INTO r FROM public.gym_reservations WHERE id=p_id AND stripe_environment_id=p_env FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 SELECT body INTO prior FROM gym_reconciliation_private.cancellation_intents WHERE reservation_id=p_id;
 PERFORM 1 FROM public.gym_stripe_environments WHERE id=p_env FOR SHARE;
 PERFORM 1 FROM public.gym_stripe_coach_bindings WHERE environment_id=p_env AND coach_id=r.coach_id FOR SHARE;
 IF gym_reconciliation_private.envelope(r,prior) IS DISTINCT FROM p_expected THEN RETURN false; END IF;
 decided:=(p_intent->>'decidedAt')::timestamptz;
 IF r.price IS NULL OR r.price<=0 OR r.stripe_payment_intent_id IS NULL OR r.stripe_payment_intent_id !~ '^pi_[A-Za-z0-9]+$' OR r.stripe_connect_account_id IS NULL OR NOT EXISTS(SELECT 1 FROM public.gym_stripe_coach_bindings WHERE environment_id=p_env AND coach_id=r.coach_id AND stripe_account_id=r.stripe_connect_account_id) OR (r.financial_snapshot->>'grossCents')::numeric IS DISTINCT FROM round(r.price*100) THEN RAISE EXCEPTION 'reservation references refused'; END IF;
 IF r.financial_snapshot IS NULL OR (r.financial_snapshot->>'grossCents')::numeric IS NULL OR (r.financial_snapshot->>'grossCents')::numeric<=0 OR (r.financial_snapshot->>'platformFeeCents')::numeric IS NULL OR (r.financial_snapshot->>'platformFeeCents')::numeric<0 OR (r.financial_snapshot->>'platformFeeCents')::numeric>(r.financial_snapshot->>'grossCents')::numeric THEN RAISE EXCEPTION 'financial snapshot refused'; END IF;
 IF decided IS NULL OR decided>clock_timestamp() OR r.appointment_at IS NULL THEN RAISE EXCEPTION 'decision refused'; END IF;
 percent:=CASE WHEN r.appointment_at-decided>interval '48 hours' THEN 100 WHEN r.appointment_at-decided>=interval '24 hours' THEN 50 ELSE 0 END;
 amount:=round(r.price*100*percent/100)::bigint;
 fee:=floor(((r.financial_snapshot->>'platformFeeCents')::numeric*amount+floor((r.financial_snapshot->>'grossCents')::numeric/2))/(r.financial_snapshot->>'grossCents')::numeric)::bigint;
 expected_key:=CASE WHEN p_env='legacy-test' THEN 'gym-refund-'||p_id||'-'||amount ELSE 'gym-refund-'||p_env||'-'||p_id||'-'||amount END;
 IF r.status NOT IN('paid','cancelled') OR amount<=0 OR p_intent->>'paymentIntentId' IS DISTINCT FROM r.stripe_payment_intent_id OR p_intent->>'accountId' IS DISTINCT FROM r.stripe_connect_account_id
 OR p_intent->>'environmentId' IS DISTINCT FROM p_env OR (p_intent->>'amountCents')::bigint IS DISTINCT FROM amount OR (p_intent->>'feeCents')::bigint IS DISTINCT FROM fee OR (p_intent->>'refundPercent')::integer IS DISTINCT FROM percent
 OR (p_intent->>'appointmentAt')::timestamptz IS DISTINCT FROM r.appointment_at OR p_intent->>'idempotencyKey' IS DISTINCT FROM expected_key THEN RAISE EXCEPTION 'intent refused'; END IF;
 IF prior IS NOT NULL THEN IF prior IS DISTINCT FROM p_intent THEN RAISE EXCEPTION 'immutable intent'; END IF; RETURN true; END IF;
 INSERT INTO gym_reconciliation_private.cancellation_intents(reservation_id,body) VALUES(p_id,p_intent);
 RETURN true;
END $$;
ALTER FUNCTION gym_reconciliation_private.authorize(text,text[],text) OWNER TO gym_reconciliation_executor;
ALTER FUNCTION gym_reconciliation_private.envelope(public.gym_reservations,jsonb) OWNER TO gym_reconciliation_executor;
ALTER FUNCTION gym_reconciliation_private.snapshot(text,text) OWNER TO gym_reconciliation_executor;
ALTER FUNCTION gym_reconciliation_private.binding(text,text) OWNER TO gym_reconciliation_executor;
ALTER FUNCTION gym_reconciliation_private.cas(text,text,jsonb,jsonb) OWNER TO gym_reconciliation_executor;
ALTER FUNCTION gym_reconciliation_private.record_intent(text,text,jsonb,jsonb) OWNER TO gym_reconciliation_executor;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA gym_reconciliation_private FROM PUBLIC,anon,authenticated,service_role,gym_reconciliation_operator,gym_cancellation_decider;
GRANT EXECUTE ON FUNCTION gym_reconciliation_private.authorize(text,text[],text),gym_reconciliation_private.snapshot(text,text),gym_reconciliation_private.binding(text,text) TO gym_reconciliation_operator,gym_cancellation_decider;
GRANT EXECUTE ON FUNCTION gym_reconciliation_private.cas(text,text,jsonb,jsonb) TO gym_reconciliation_operator;
GRANT EXECUTE ON FUNCTION gym_reconciliation_private.record_intent(text,text,jsonb,jsonb) TO gym_cancellation_decider;
COMMIT;
