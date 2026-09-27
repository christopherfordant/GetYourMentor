import type { Reservation } from "@/lib/domain";

export type ReservationRow = Record<string, unknown>;

export function reservationFromRow(row: ReservationRow): Reservation {
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

export function reservationToRow(reservation: Reservation) {
  return {
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
  };
}
