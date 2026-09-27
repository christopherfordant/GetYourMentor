import type { Reservation } from "@/lib/domain";
import { assertDemoFallbackAllowed } from "@/lib/runtime";
import { claimReservationSlots, releaseReservationSlots, ReservationSlotConflictError } from "@/lib/repositories/reservation-slot-repository";
import { reservationFromRow, reservationToRow } from "@/lib/repositories/reservation-mapper";

export type ReservationPersistenceConfig = { url: string; key: string };
export const memoryReservations: Reservation[] = [];

export function reservationPersistenceConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return { url: url.replace(/\/$/, ""), key } satisfies ReservationPersistenceConfig;
  assertDemoFallbackAllowed("Supabase Reservations");
  return null;
}

function headers(config: ReservationPersistenceConfig, extra: Record<string, string> = {}) {
  return { apikey: config.key, Authorization: `Bearer ${config.key}`, ...extra };
}

export async function hasReservationSlotConflict(coachId: string, slots: string[], excludeId?: string) {
  const config = reservationPersistenceConfig();
  if (!config) {
    return memoryReservations.some((reservation) =>
      reservation.coachId === coachId &&
      reservation.id !== excludeId &&
      ["requested", "accepted", "paid"].includes(reservation.status) &&
      reservation.slots.some((slot) => slots.includes(slot)),
    );
  }
  const response = await fetch(
    `${config.url}/rest/v1/gym_reservations?coach_id=eq.${encodeURIComponent(coachId)}&status=in.(requested,accepted,paid)&select=id,slots${excludeId ? `&id=neq.${encodeURIComponent(excludeId)}` : ""}`,
    { headers: headers(config), cache: "no-store" },
  );
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  const rows = await response.json();
  return rows.some((row: { slots?: unknown }) => Array.isArray(row.slots) && row.slots.some((slot) => slots.includes(String(slot))));
}

export async function createPersistedReservation(reservation: Reservation) {
  const config = reservationPersistenceConfig();
  if (!config) {
    memoryReservations.push(reservation);
    return reservation;
  }
  const response = await fetch(`${config.url}/rest/v1/gym_reservations`, {
    method: "POST",
    headers: headers(config, { "Content-Type": "application/json", Prefer: "return=representation" }),
    body: JSON.stringify(reservationToRow(reservation)),
  });
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  const [saved] = await response.json();
  const savedReservation = { ...reservation, id: saved.id ?? reservation.id, createdAt: saved.created_at ?? reservation.createdAt };
  try {
    await claimReservationSlots(config, savedReservation.id, savedReservation.coachId, savedReservation.slots);
  } catch (error) {
    await deletePersistedReservation(savedReservation.id).catch(() => undefined);
    throw error;
  }
  return savedReservation;
}

export async function listPersistedReservations(options: { coachId?: string; ownerEmail?: string } = {}) {
  const config = reservationPersistenceConfig();
  if (!config) {
    return memoryReservations.filter((reservation) =>
      (!options.coachId || reservation.coachId === options.coachId) &&
      (!options.ownerEmail || reservation.ownerEmail === options.ownerEmail),
    );
  }
  const coachFilter = options.coachId ? `&coach_id=eq.${encodeURIComponent(options.coachId)}` : "";
  const ownerFilter = options.ownerEmail ? `&owner_email=eq.${encodeURIComponent(options.ownerEmail)}` : "";
  const response = await fetch(`${config.url}/rest/v1/gym_reservations?select=*&order=created_at.desc${coachFilter}${ownerFilter}`, {
    headers: headers(config),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  return (await response.json()).map((row: Record<string, unknown>) => reservationFromRow(row));
}

export async function getPersistedReservation(id: string) {
  const config = reservationPersistenceConfig();
  if (!config) return memoryReservations.find((reservation) => reservation.id === id) ?? null;
  const response = await fetch(`${config.url}/rest/v1/gym_reservations?id=eq.${encodeURIComponent(id)}&select=*`, {
    headers: headers(config),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  const [row] = await response.json();
  return row ? reservationFromRow(row) : null;
}

export async function updatePersistedReservation(
  id: string,
  patch: Record<string, unknown>,
  expectedStatus?: Reservation["status"],
) {
  const config = reservationPersistenceConfig();
  if (!config) {
    const index = memoryReservations.findIndex((reservation) => reservation.id === id);
    if (index < 0) return null;
    if (expectedStatus && memoryReservations[index].status !== expectedStatus) return null;
    memoryReservations[index] = { ...memoryReservations[index], ...patch } as Reservation;
    return memoryReservations[index];
  }
  const statusFilter = expectedStatus ? `&status=eq.${encodeURIComponent(expectedStatus)}` : "";
  const response = await fetch(`${config.url}/rest/v1/gym_reservations?id=eq.${encodeURIComponent(id)}${statusFilter}`, {
    method: "PATCH",
    headers: headers(config, { "Content-Type": "application/json", Prefer: "return=representation" }),
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
  const [row] = await response.json();
  return row ? reservationFromRow(row) : null;
}

export async function deletePersistedReservation(id: string) {
  const config = reservationPersistenceConfig();
  if (!config) {
    const index = memoryReservations.findIndex((reservation) => reservation.id === id);
    if (index >= 0) memoryReservations.splice(index, 1);
    return;
  }
  const response = await fetch(`${config.url}/rest/v1/gym_reservations?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headers(config),
  });
  if (!response.ok) throw new Error(`Supabase reservation error (${response.status})`);
}

export { releaseReservationSlots, ReservationSlotConflictError };
