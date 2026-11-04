import { validateReservationSlots } from "@/lib/domain/booking-rules";
import type { Reservation } from "@/lib/domain";
import { assertDemoFallbackAllowed } from "@/lib/runtime";
import { eurosToCents } from "@/lib/domain/commission";
import { updatePersistedReservation } from "@/lib/repositories/reservation-repository";
import { stripeTestConfig } from '@/lib/stripe-test-config';
import {connectEnabled,checkoutConnectFields} from '@/lib/stripe-connect';

type CheckoutResult = { checkoutUrl: string; sessionId: string };

type RefundResult = { id: string; status: "pending" | "succeeded" };

function stripeConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const provider = process.env.PAYMENT_PROVIDER ?? "local";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  if (provider === "stripe") return stripeTestConfig();
  assertDemoFallbackAllowed("Stripe");
  return null;
}

export async function createCheckoutSession(reservation: Reservation): Promise<CheckoutResult | null> {
  if (reservation.status !== "accepted") throw new Error("Le paiement est disponible après acceptation du coach");
  if (!validateReservationSlots(reservation.slots).valid) throw new Error("Ce créneau est passé ou invalide");
  const config = stripeConfig();
  if (!config) return null;

  const returnParams = new URLSearchParams({ reservationId: reservation.id });
  const amount = reservation.financials?.grossCents ?? eurosToCents(reservation.price);
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('Montant de paiement invalide');
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${config.appUrl}/paiement?${returnParams.toString()}&payment=success`);
  form.set("cancel_url", `${config.appUrl}/paiement?${returnParams.toString()}&payment=cancelled`);
  form.set("customer_email", reservation.ownerEmail ?? "");
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "eur");
  form.set("line_items[0][price_data][unit_amount]", String(amount));
  form.set("line_items[0][price_data][product_data][name]", reservation.service);
  form.set("line_items[0][price_data][product_data][description]", `${reservation.coachName} — ${reservation.duration}`);
  form.set("metadata[reservation_id]", reservation.id);
  const connect=connectEnabled()?await checkoutConnectFields(reservation):null;
  if(connect){
    form.set('payment_intent_data[application_fee_amount]',String(connect.feeCents));
    form.set('payment_intent_data[transfer_data][destination]',connect.accountId);
    form.set('payment_intent_data[metadata][reservation_id]',reservation.id);
    // Card-only sandbox avoids presenting delayed settlement as instant payout.
    form.set('payment_method_types[0]','card');
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.secretKey}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": connect?`gym-connect-checkout-${reservation.id}`:`gym-checkout-${reservation.id}` },
    body: form,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Création de la session de paiement impossible");
  const payload = await response.json();
  if (typeof payload.url !== "string" || typeof payload.id !== "string" || !payload.id.startsWith('cs_test_') || payload.livemode !== false || new URL(payload.url).origin !== 'https://checkout.stripe.com') throw new Error("Session Stripe de test invalide");
  const saved = await updatePersistedReservation(reservation.id, { stripe_checkout_session_id: payload.id, owner_email: reservation.ownerEmail ?? null,...(connect?{stripe_connect_account_id:connect.accountId}:{}) }, "accepted");
  if (!saved) throw new Error("La réservation n’est plus payable");
  return { checkoutUrl: payload.url, sessionId: payload.id };
}

export async function refundStripePayment(input: {
  paymentIntentId: string;
  amountCents: number;
  reservationId: string;
  connectAccountId?: string;
}): Promise<RefundResult | null> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const provider = process.env.PAYMENT_PROVIDER ?? "local";
  if (provider !== "stripe" || !secretKey) {
    assertDemoFallbackAllowed("Stripe");
    return null;
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("Montant de remboursement Stripe invalide");
  }
  stripeTestConfig();

  const form = new URLSearchParams({
    payment_intent: input.paymentIntentId,
    amount: String(input.amountCents),
  });
  if(input.connectAccountId){form.set('reverse_transfer','true');form.set('refund_application_fee','true');}
  const response = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `gym-refund-${input.reservationId}-${input.amountCents}`,
    },
    body: form,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Remboursement Stripe impossible");
  const payload = await response.json();
  if (typeof payload.id !== "string" || !["pending", "succeeded"].includes(payload.status)) {
    throw new Error("Réponse de remboursement Stripe invalide");
  }
  return { id: payload.id, status: payload.status };
}
