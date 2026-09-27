import type { Reservation } from "@/lib/domain";
import { refundPercentForAppointment, validateReservationSlots } from "@/lib/domain/booking-rules";
import {
  claimReservationSlots as claimReservationSlotsRepository,
  releaseReservationSlots as releaseReservationSlotsRepository,
  ReservationSlotConflictError as RepositoryReservationSlotConflictError,
} from "@/lib/repositories/reservation-slot-repository";
import {
  createPersistedReservation,
  getPersistedReservation,
  hasReservationSlotConflict,
  listPersistedReservations,
  memoryReservations,
  reservationPersistenceConfig,
  updatePersistedReservation,
} from "@/lib/repositories/reservation-repository";
import { sendReservationConfirmation } from "@/lib/notifications";
import { refundStripePayment } from "@/lib/payments";

function supabaseConfig() {
  return reservationPersistenceConfig();
}

export class ReservationSlotConflictError extends Error {
  constructor() {
    super("Un des créneaux est déjà demandé ou réservé");
    this.name = "ReservationSlotConflictError";
  }
}

async function claimReservationSlots(config: { url: string; key: string }, reservationId: string, coachId: string, slots: string[]) {
  try {
    await claimReservationSlotsRepository(config, reservationId, coachId, slots);
  } catch (error) {
    if (error instanceof RepositoryReservationSlotConflictError) throw new ReservationSlotConflictError();
    throw error;
  }
}

async function releaseReservationSlots(config: { url: string; key: string }, reservationId: string, slots?: string[]) {
  await releaseReservationSlotsRepository(config, reservationId, slots);
}

export async function hasSlotConflict(coachId: string, slots: string[], excludeId?: string) {
  return hasReservationSlotConflict(coachId, slots, excludeId);
}

export async function createReservation(reservation: Reservation) {
  return createPersistedReservation(reservation);
}

export async function listReservations(options: { coachId?: string; ownerEmail?: string } = {}) {
  return listPersistedReservations(options);
}

export async function getReservation(id: string) {
  return getPersistedReservation(id);
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
  const saved = await updatePersistedReservation(id, {
    status,
    accepted_at: acceptedAt ?? null,
    reservation_code: reservationCode ?? null,
  }, "requested");
  if (!saved) return null;
  if (status !== "accepted") await releaseReservationSlots(config, id);
  return saved;
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

  // Le filtre expectedStatus rend le webhook Stripe idempotent côté repository.
  const saved = await updatePersistedReservation(id, {
    status: "paid",
    owner_email: next.ownerEmail ?? null,
    stripe_payment_intent_id: next.stripePaymentIntentId ?? null,
  }, "accepted");
  if (!saved) {
    const latest = await getReservation(id);
    if (latest?.status === "paid") return latest;
    throw new Error("La réservation n’est plus payable dans son état actuel");
  }
  const paidReservation = {
    ...next,
    ownerEmail: saved.ownerEmail ?? next.ownerEmail,
    status: "paid" as const,
    stripePaymentIntentId: next.stripePaymentIntentId,
  };
  const confirmation = await sendReservationConfirmation(paidReservation).catch(() => ({ status: "skipped" as const }));
  return { ...paidReservation, confirmationStatus: confirmation.status };
}

export function refundPercentFor(appointmentAt: string, now = new Date()) {
  return refundPercentForAppointment(appointmentAt, now);
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

  const saved = await updatePersistedReservation(id, {
    status: "cancelled",
    cancelled_at: next.cancelledAt,
    refund_percent: refundPercent,
    refund_amount: next.refundAmount,
    stripe_refund_id: stripeRefundId ?? null,
    refund_status: next.refundStatus,
  });
  if (!saved) return null;
  await releaseReservationSlots(config, id);
  return { ...saved, stripeRefundId };
}

export async function rescheduleReservation(id: string, ownerEmail: string, slots: string[]) {
  const current = await getReservation(id);
  if (!current) return null;
  if (current.ownerEmail && current.ownerEmail !== ownerEmail) throw new Error("Cette réservation appartient à un autre compte");
  if (!current.ownerEmail) throw new Error("La réservation n'est pas rattachée à un compte sportif");
  if (!["accepted", "paid"].includes(current.status)) throw new Error("Cette réservation ne peut pas être déplacée dans son état actuel");
  const validatedSlots = validateReservationSlots(slots);
  if (!validatedSlots.valid) throw new Error("Un à trois créneaux sont requis");
  if (await hasSlotConflict(current.coachId, validatedSlots.slots, id)) throw new Error("Un des nouveaux créneaux est déjà demandé ou réservé");

  const next = { ...current, slots: validatedSlots.slots, appointmentAt: validatedSlots.slots[0] };
  const config = supabaseConfig();
  if (!config) {
    const index = memoryReservations.findIndex((reservation) => reservation.id === id);
    memoryReservations[index] = next;
    return next;
  }

  const addedSlots = validatedSlots.slots.filter((slot) => !current.slots.includes(slot));
  await claimReservationSlots(config, id, current.coachId, addedSlots);
  const saved = await updatePersistedReservation(id, { slots: validatedSlots.slots, appointment_at: next.appointmentAt });
  if (!saved) {
    await releaseReservationSlots(config, id, addedSlots).catch(() => undefined);
    throw new Error("Supabase reservation error (reservation update failed)");
  }
  const releasedSlots = current.slots.filter((slot) => !validatedSlots.slots.includes(slot));
  if (releasedSlots.length) await releaseReservationSlots(config, id, releasedSlots);
  return saved;
}
