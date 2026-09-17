import type { Reservation } from "@/lib/domain";
import { assertDemoFallbackAllowed } from "@/lib/runtime";

type CheckoutResult = { checkoutUrl: string; sessionId: string };

function stripeConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const provider = process.env.PAYMENT_PROVIDER ?? "local";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  if (provider === "stripe" && secretKey) return { secretKey, appUrl: appUrl.replace(/\/$/, "") };
  assertDemoFallbackAllowed("Stripe");
  return null;
}

export async function createCheckoutSession(reservation: Reservation): Promise<CheckoutResult | null> {
  const config = stripeConfig();
  if (!config) return null;

  const returnParams = new URLSearchParams({
    reservationId: reservation.id,
    coach: reservation.coachName,
    city: reservation.city,
    service: reservation.service,
    duration: reservation.duration,
    price: String(reservation.price),
    slot: reservation.slots[0] ?? "",
    mentor: reservation.coachName,
  });
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${config.appUrl}/paiement?${returnParams.toString()}&payment=success`);
  form.set("cancel_url", `${config.appUrl}/paiement?${returnParams.toString()}&payment=cancelled`);
  form.set("customer_email", reservation.ownerEmail ?? "");
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "eur");
  form.set("line_items[0][price_data][unit_amount]", String(Math.round(reservation.price * 100)));
  form.set("line_items[0][price_data][product_data][name]", reservation.service);
  form.set("line_items[0][price_data][product_data][description]", `${reservation.coachName} — ${reservation.duration}`);
  form.set("metadata[reservation_id]", reservation.id);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.secretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!response.ok) throw new Error("Création de la session de paiement impossible");
  const payload = await response.json();
  if (typeof payload.url !== "string" || typeof payload.id !== "string") throw new Error("Session Stripe invalide");
  return { checkoutUrl: payload.url, sessionId: payload.id };
}
