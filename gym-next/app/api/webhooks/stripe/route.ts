import {assertReservationEnvironment} from '@/lib/stripe-environment';
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getReservation, payReservation } from "@/lib/reservations";
import { eurosToCents } from "@/lib/domain/commission";
import { bodyExceedsLimit } from "@/lib/request-guards";
import { notifyTelegram } from '@/lib/telegram';
import { stripeTestConfig } from '@/lib/stripe-test-config';
import {verifyConnectSettlement,connectEnabled} from '@/lib/stripe-connect';
import {updatePersistedReservation} from '@/lib/repositories/reservation-repository';

function validSignature(rawBody: string, signature: string, secret: string) {
  const fields = signature.split(",").map((part) => part.trim().split("=", 2));
  const timestampText = fields.find(([key]) => key === "t")?.[1];
  if (!timestampText || !/^\d+$/.test(timestampText)) return false;
  const timestamp = Number(timestampText);
  if (!Number.isSafeInteger(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestampText}.${rawBody}`).digest();
  return fields.some(([key, value]) => {
    if (key !== "v1" || !/^[a-f0-9]{64}$/i.test(value ?? "")) return false;
    const received = Buffer.from(value, "hex");
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}

export async function POST(request: Request) {
  try { if (process.env.PAYMENT_PROVIDER === 'stripe') stripeTestConfig(); } catch { return NextResponse.json({error:'Stripe de test non configuré'}, {status:503}); }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (bodyExceedsLimit(request, 1024 * 1024)) return NextResponse.json({ error: "Webhook trop volumineux" }, { status: 413 });
  if (!secret || !signature) return NextResponse.json({ error: "Webhook Stripe non configuré" }, { status: 503 });
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > 1024 * 1024) return NextResponse.json({ error: "Webhook trop volumineux" }, { status: 413 });
  if (!validSignature(rawBody, signature, secret)) return NextResponse.json({ error: "Signature Stripe invalide" }, { status: 400 });

  let event: { id?: string; type?: string; data?: { object?: { id?: string; mode?: string; status?: string; payment_status?: string; currency?: string; amount_total?: number; payment_intent?: string; customer_details?: { email?: string }; customer_email?: string; metadata?: { reservation_id?: string } } } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ error: "Payload Stripe invalide" }, { status: 400 });
  }
  if (!event || typeof event !== "object" || typeof event.id !== "string" || typeof event.type !== "string") return NextResponse.json({ error: "Événement Stripe invalide" }, { status: 400 });
  if ((event as {livemode?:unknown}).livemode !== false) return NextResponse.json({error:'Événement hors environnement de test refusé'}, {status:400});
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) return NextResponse.json({ received: true, processed: false });
  const checkout = event.data?.object;
  if (!checkout || typeof checkout !== "object") return NextResponse.json({ error: "Session absente" }, { status: 400 });
  // Completed may precede settlement for asynchronous payment methods.
  if (checkout.payment_status === "unpaid") return NextResponse.json({ received: true, processed: false, status: "pending" });
  if (checkout.payment_status !== "paid" || checkout.mode !== "payment" || checkout.status !== "complete"
    || typeof checkout.id !== "string" || typeof checkout.payment_intent !== "string"
    || typeof checkout.metadata?.reservation_id !== "string" || checkout.metadata.reservation_id.length > 128) return NextResponse.json({ error: "Session non payable ou incomplète" }, { status: 400 });
  let phase="reservation-read";
  try {
    const reservation = await getReservation(checkout.metadata.reservation_id);
    if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 409 });
    phase='environment';
    if(process.env.PAYMENT_PROVIDER==='stripe')await assertReservationEnvironment(reservation);
    const expectedAmount = reservation.financials?.grossCents ?? eurosToCents(reservation.price);
    if (checkout.currency !== "eur" || !Number.isSafeInteger(checkout.amount_total) || checkout.amount_total !== expectedAmount
      || (process.env.PAYMENT_PROVIDER === "stripe" && !reservation.stripeCheckoutSessionId)
      || (reservation.stripeCheckoutSessionId && reservation.stripeCheckoutSessionId !== checkout.id)
      || (reservation.stripePaymentIntentId && reservation.stripePaymentIntentId !== checkout.payment_intent)) return NextResponse.json({ error: "Paiement incohérent avec la réservation" }, { status: 409 });
    const email = checkout.customer_details?.email ?? checkout.customer_email;
    if (typeof email !== "string" || (reservation.ownerEmail && reservation.ownerEmail !== email)) return NextResponse.json({ error: "Titulaire du paiement incohérent" }, { status: 409 });
    if(reservation.status === "paid") await notifyTelegram(reservation, "paid");
    if (reservation.status === "paid" || (reservation.status === "cancelled" && reservation.stripePaymentIntentId === checkout.payment_intent)) return NextResponse.json({ received: true, processed: false });
    if (reservation.status !== "accepted") return NextResponse.json({ error: "Réservation non payable" }, { status: 409 });
    if(connectEnabled()&&!reservation.stripeConnectAccountId)return NextResponse.json({error:'Bénéficiaire Connect absent'},{status:409});
    if(reservation.stripeConnectAccountId){
      phase="connect-settlement";
      const references=await verifyConnectSettlement(reservation,checkout.payment_intent);
      phase='connect-persistence';
      if(!await updatePersistedReservation(reservation.id,references,'accepted'))throw Error('Persistance Connect en attente');
    }
    phase="paid-persistence";
    const saved = await payReservation(reservation.id, email, checkout.payment_intent);
    if (!saved) throw new Error("Persistance indisponible");
    return NextResponse.json({ received: true, processed: true });
  } catch(error) {
    if(process.env.GYM_REAL_TEST_SERVICES==='true'&&process.env.DEPLOY_ENV==='recipe'){
      const status=error instanceof Error?error.message.match(/^Supabase reservation error \((\d{3})\)$/)?.[1]:undefined;
      console.warn('stripe-recipe-webhook-failed',{phase,...(status?{persistenceStatus:status}:{})});
    }
    // Preserve Stripe retries on transient persistence failures, without logging secrets.
    return NextResponse.json({ error: "Confirmation en attente, réessai nécessaire" }, { status: 503 });
  }
}
