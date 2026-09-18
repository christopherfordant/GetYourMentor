import type { Reservation } from "@/lib/domain";
import { sendReservationConfirmation } from "@/lib/notifications";
import { refundStripePayment } from "@/lib/payments";
import { assertDemoFallbackAllowed } from "@/lib/runtime";

const memoryReservations: Reservation[] = [];

function supabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return { url: url.replace(/\/$/, ""), key };
  assertDemoFallbackAllowed("Supabase Reservations");
  return null;
}

export class ReservationSlotConflictError extends Error {
  constructor() {
    super("Un des créneaux est déjà demandé ou réservé");
    this.name = "ReservationSlotConflictError";
  }
}

async function claimReservationSlots(config: { url: string; key: string }, reservationId: string, coachId: string, slots: string[]) {
  if (!slots.length) return;
  const response = await fetch(`${config.url}/rest/v1/gym_reservation_slot_claims`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(slots.map((slot) => ({ reservation_id: reservationId, coach_id: coachId, slot }))),
  });
  if (response.status === 409) throw new ReservationSlotConflictError();
  if (!response.ok) throw new Error(`Supabase reservation slot error (${response.status})`);
}

async function releaseReservationSlots(config: { url: string; key: string }, reservationId: string, slots?: string[]) {
  const slotFilter = slots?.length ? `&slot=in.(${slots.map((slot) => encodeURIComponent(slot)).join(",")})` : "";
  const response = await fetch(`${config.url}/rest/v1/gym_reservation_slot_claims?reservation_id=eq.${encodeURIComponent(reservationId)}${slotFilter}`, {
    method: "DELETE",
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
  });
  if (!response.ok) throw new Error(`Supabase reservation slot error (${response.status})`);
}

export async function hasSlotConflict(coachId: string, slots: string[], excludeId?: string) {
  const config = supabaseConfig();
  if (!config) {
    return memoryReservations.some(
      (reservation) =>
        reservation.coachId === coachId &&
        reservation.id !== excludeId &&
        ["requested", "accepted", "paid"].includes(reservation.status) &&
        reservation.slots.some((slot) => slots.includes(slot)),
    );
  }

  const response = await fetch(
    `${config.url}/rest/v1/gym_reservations?coach_id=eq.${encodeURIComponent(coachId)}&status=in.(requested,accepted,paid)&select=id,slots${excludeId ? `&id=neq.${encodeURIComponent(excludeId)}` : ""}`,
    { headers: { apikey: config.key, Authorization: `Bearer ${config.key}` }, cache: "no-store" },
  );
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  const rows = await response.json();
  return rows.some((row: { slots?: unknown }) => Array.isArray(row.slots) && row.slots.some((slot) => slots.includes(String(slot))));
}

export async function createReservation(reservation: Reservation) {
  const config = supabaseConfig();
  if (!config) {
    memoryReservations.push(reservation);
    return reservation;
  }

  const response = await fetch(`${config.url}/rest/v1/gym_reservations`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      id: reservation.id,
      owner_email: reservation.ownerEmail ?? null,
      coach_id: reservation.coachId,
      coach_name: reservation.coachName,
      sport: reservation.sport,
      city: reservation.city,
      service: reservation.service,
      duration: reservation.duration,
      price: reservation.price,
      slots: reservation.slots,
      status: reservation.status,
      created_at: reservation.createdAt,
      appointment_at: reservation.appointmentAt,
    }),
  });

  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  const [saved] = await response.json();
  const savedReservation = {
    ...reservation,
    id: saved.id ?? reservation.id,
    createdAt: saved.created_at ?? reservation.createdAt,
  };
  try {
    await claimReservationSlots(config, savedReservation.id, savedReservation.coachId, savedReservation.slots);
  } catch (error) {
    await fetch(`${config.url}/rest/v1/gym_reservations?id=eq.${encodeURIComponent(savedReservation.id)}`, {
      method: "DELETE",
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
    }).catch(() => undefined);
    throw error;
  }
  return savedReservation;
}

export async function listReservations(options: { coachId?: string; ownerEmail?: string } = {}) {
  const config = supabaseConfig();
  if (!config) {
    return memoryReservations.filter((reservation) =>
      (!options.coachId || reservation.coachId === options.coachId) &&
      (!options.ownerEmail || reservation.ownerEmail === options.ownerEmail),
    );
  }

  const coachFilter = options.coachId ? `&coach_id=eq.${encodeURIComponent(options.coachId)}` : "";
  const ownerFilter = options.ownerEmail ? `&owner_email=eq.${encodeURIComponent(options.ownerEmail)}` : "";
  const response = await fetch(`${config.url}/rest/v1/gym_reservations?select=*&order=created_at.desc${coachFilter}${ownerFilter}`, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);

  const rows = await response.json();
  return rows.map((row: Record<string, unknown>) => ({
    id: row.id,
    ownerEmail: row.owner_email,
    coachId: row.coach_id,
    coachName: row.coach_name,
    sport: row.sport,
    city: row.city,
    service: row.service,
    duration: row.duration,
    price: row.price,
    slots: row.slots,
    status: row.status,
    createdAt: row.created_at,
    reservationCode: row.reservation_code,
    acceptedAt: row.accepted_at,
    appointmentAt: row.appointment_at,
    refundPercent: row.refund_percent,
    refundAmount: row.refund_amount,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    stripeRefundId: row.stripe_refund_id,
    refundStatus: row.refund_status,
    cancelledAt: row.cancelled_at,
  }));
}

export async function getReservation(id: string) {
  const config = supabaseConfig();
  if (!config) return memoryReservations.find((reservation) => reservation.id === id) ?? null;

  const response = await fetch(`${config.url}/rest/v1/gym_reservations?id=eq.${encodeURIComponent(id)}&select=*`, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  const [row] = await response.json();
  if (!row) return null;
  return {
    id: row.id,
    ownerEmail: row.owner_email,
    coachId: row.coach_id,
    coachName: row.coach_name,
    sport: row.sport,
    city: row.city,
    service: row.service,
    duration: row.duration,
    price: row.price,
    slots: row.slots,
    status: row.status,
    createdAt: row.created_at,
    reservationCode: row.reservation_code,
    acceptedAt: row.accepted_at,
    appointmentAt: row.appointment_at,
    refundPercent: row.refund_percent,
    refundAmount: row.refund_amount,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    stripeRefundId: row.stripe_refund_id,
    refundStatus: row.refund_status,
    cancelledAt: row.cancelled_at,
  } as Reservation;
}

export async function transitionReservation(id: string, status: "accepted" | "rejected" | "cancelled") {
  const current = await getReservation(id);
  if (!current) return null;
  if (current.status !== "requested") throw new Error(`Transition impossible depuis ${current.status}`);

  const acceptedAt = status === "accepted" ? new Date().toISOString() : undefined;
  const reservationCode = status === "accepted" ? `GYM-${id.slice(-6).toUpperCase()}` : undefined;
  const next = { ...current, status, acceptedAt, reservationCode } as Reservation;
  const config = supabaseConfig();
  if (!config) {
    const index = memoryReservations.findIndex((reservation) => reservation.id === id);
    memoryReservations[index] = next;
    return next;
  }

  const response = await fetch(`${config.url}/rest/v1/gym_reservations?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ status, accepted_at: acceptedAt ?? null, reservation_code: reservationCode ?? null }),
  });
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  if (status !== "accepted") await releaseReservationSlots(config, id);
  return next;
}

export async function payReservation(id: string, ownerEmail?: string, stripePaymentIntentId?: string) {
  const current = await getReservation(id);
  if (!current) return null;
  if (current.status === "paid") return current;
  if (current.status !== "accepted") throw new Error("Le paiement est disponible après acceptation du coach");

  const next: Reservation = {
    ...current,
    status: "paid" as const,
    ownerEmail: current.ownerEmail ?? ownerEmail,
    stripePaymentIntentId: current.stripePaymentIntentId ?? stripePaymentIntentId,
  };
  const config = supabaseConfig();
  if (!config) {
    const index = memoryReservations.findIndex((reservation) => reservation.id === id);
    memoryReservations[index] = next;
    const confirmation = await sendReservationConfirmation(next).catch(() => ({ status: "skipped" as const }));
    return { ...next, confirmationStatus: confirmation.status };
  }

  // La condition status=accepted rend le webhook Stripe idempotent côté base :
  // deux livraisons concurrentes ne peuvent pas toutes deux déclencher l’email.
  const response = await fetch(`${config.url}/rest/v1/gym_reservations?id=eq.${encodeURIComponent(id)}&status=eq.accepted`, {
    method: "PATCH",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      status: "paid",
      owner_email: next.ownerEmail ?? null,
      stripe_payment_intent_id: next.stripePaymentIntentId ?? null,
    }),
  });
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  const [saved] = (await response.json()) as Array<{ id?: string; owner_email?: string | null; status?: string }>;
  if (!saved) {
    const latest = await getReservation(id);
    if (latest?.status === "paid") return latest;
    throw new Error("La réservation n’est plus payable dans son état actuel");
  }
  const paidReservation = {
    ...next,
    ownerEmail: saved.owner_email ?? next.ownerEmail,
    status: "paid" as const,
    stripePaymentIntentId: next.stripePaymentIntentId,
  };
  const confirmation = await sendReservationConfirmation(paidReservation).catch(() => ({ status: "skipped" as const }));
  return { ...paidReservation, confirmationStatus: confirmation.status };
}

export function refundPercentFor(appointmentAt: string, now = new Date()) {
  const hoursUntil = (new Date(appointmentAt).getTime() - now.getTime()) / 3_600_000;
  if (hoursUntil > 48) return 100;
  if (hoursUntil >= 24) return 50;
  return 0;
}

export async function cancelReservation(id: string, ownerEmail?: string) {
  const current = await getReservation(id);
  if (!current) return null;
  if (current.ownerEmail && ownerEmail && current.ownerEmail !== ownerEmail) throw new Error("Cette réservation appartient à un autre compte");
  if (!["requested", "accepted", "paid"].includes(current.status)) {
    throw new Error(`Annulation impossible depuis ${current.status}`);
  }

  const refundPercent = current.status === "paid" && current.appointmentAt ? refundPercentFor(current.appointmentAt) : 0;
  const next: Reservation = {
    ...current,
    ownerEmail: current.ownerEmail ?? ownerEmail,
    status: "cancelled" as const,
    cancelledAt: new Date().toISOString(),
    refundPercent,
    refundAmount: Number(((current.price * refundPercent) / 100).toFixed(2)),
    refundStatus: refundPercent > 0 ? ("pending" as const) : ("not_required" as const),
  };
  let stripeRefundId: string | undefined;
  if (current.status === "paid" && refundPercent > 0) {
    if (!current.stripePaymentIntentId && process.env.PAYMENT_PROVIDER === "stripe") {
      throw new Error("Remboursement impossible : identifiant de paiement Stripe absent");
    }
    const refund = current.stripePaymentIntentId
      ? await refundStripePayment({
          paymentIntentId: current.stripePaymentIntentId,
          amountCents: Math.round((next.refundAmount ?? 0) * 100),
          reservationId: id,
        })
      : null;
    if (refund) {
      stripeRefundId = refund.id;
      next.refundStatus = refund.status;
    } else {
      next.refundStatus = "succeeded";
    }
  }
  const config = supabaseConfig();
  if (!config) {
    const index = memoryReservations.findIndex((reservation) => reservation.id === id);
    memoryReservations[index] = { ...next, stripeRefundId };
    return memoryReservations[index];
  }

  const response = await fetch(`${config.url}/rest/v1/gym_reservations?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      status: "cancelled",
      cancelled_at: next.cancelledAt,
      refund_percent: refundPercent,
      refund_amount: next.refundAmount,
      stripe_refund_id: stripeRefundId ?? null,
      refund_status: next.refundStatus,
    }),
  });
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  await releaseReservationSlots(config, id);
  return { ...next, stripeRefundId };
}

export async function rescheduleReservation(id: string, ownerEmail: string, slots: string[]) {
  const current = await getReservation(id);
  if (!current) return null;
  if (current.ownerEmail && current.ownerEmail !== ownerEmail) throw new Error("Cette réservation appartient à un autre compte");
  if (!current.ownerEmail) throw new Error("La réservation n'est pas rattachée à un compte sportif");
  if (!["accepted", "paid"].includes(current.status)) throw new Error("Cette réservation ne peut pas être déplacée dans son état actuel");
  if (slots.length < 1 || slots.length > 3) throw new Error("Un à trois créneaux sont requis");
  if (await hasSlotConflict(current.coachId, slots, id)) throw new Error("Un des nouveaux créneaux est déjà demandé ou réservé");

  const next = { ...current, slots, appointmentAt: slots[0] };
  const config = supabaseConfig();
  if (!config) {
    const index = memoryReservations.findIndex((reservation) => reservation.id === id);
    memoryReservations[index] = next;
    return next;
  }

  const addedSlots = slots.filter((slot) => !current.slots.includes(slot));
  await claimReservationSlots(config, id, current.coachId, addedSlots);
  const response = await fetch(`${config.url}/rest/v1/gym_reservations?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ slots, appointment_at: next.appointmentAt }),
  });
  if (!response.ok) {
    await releaseReservationSlots(config, id, addedSlots).catch(() => undefined);
    throw new Error(`Supabase reservation error (${response.status})`);
  }
  const releasedSlots = current.slots.filter((slot) => !slots.includes(slot));
  if (releasedSlots.length) await releaseReservationSlots(config, id, releasedSlots);
  return next;
}
