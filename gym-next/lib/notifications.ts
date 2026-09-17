import type { Reservation } from "@/lib/domain";
import { assertDemoFallbackAllowed } from "@/lib/runtime";

type ConfirmationResult = { status: "sent" | "queued" | "skipped"; id?: string };

const localConfirmations: Array<{ id: string; email: string; reservationId: string; createdAt: string }> = [];

function resendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (apiKey && from) return { apiKey, from };
  assertDemoFallbackAllowed("Resend");
  return null;
}

export async function sendReservationConfirmation(reservation: Reservation): Promise<ConfirmationResult> {
  if (!reservation.ownerEmail) return { status: "skipped" };
  const notificationId = `confirmation-${reservation.id}`;
  if (localConfirmations.some((item) => item.id === notificationId)) return { status: "queued", id: notificationId };

  const subject = `Réservation confirmée avec ${reservation.coachName}`;
  const text = [
    "Votre séance GetYourMentor est confirmée.",
    `Coach : ${reservation.coachName}`,
    `Prestation : ${reservation.service}`,
    `Créneau : ${reservation.slots.join(" · ")}`,
    `Code de réservation : ${reservation.reservationCode ?? "à venir"}`,
  ].join("\n");
  const config = resendConfig();
  if (config) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: config.from, to: [reservation.ownerEmail], subject, text }),
    });
    if (!response.ok) throw new Error(`Email de confirmation impossible (${response.status})`);
    const payload = await response.json().catch(() => ({}));
    localConfirmations.push({ id: notificationId, email: reservation.ownerEmail, reservationId: reservation.id, createdAt: new Date().toISOString() });
    return { status: "sent", id: payload.id ?? notificationId };
  }

  localConfirmations.push({ id: notificationId, email: reservation.ownerEmail, reservationId: reservation.id, createdAt: new Date().toISOString() });
  return { status: "queued", id: notificationId };
}

export function listLocalConfirmations() {
  return [...localConfirmations];
}
