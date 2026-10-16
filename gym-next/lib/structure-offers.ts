import { randomUUID } from "node:crypto";
import { assertDemoFallbackAllowed, isHostedDemo } from "@/lib/runtime";
import { mutateDemoState, readDemoState } from "@/lib/repositories/demo-state";
import { listReservations } from "@/lib/reservations";
import type { Reservation } from "@/lib/domain";

export type StructureOffer = { id: string; ownerEmail: string; coachId: string; title: string; duration: string; slots: string[]; capacity?: number; createdAt: string };
export const memoryStructureOffers: StructureOffer[] = [];
const memory = memoryStructureOffers;

// Demonstration association only: never grants ownership of other coaches.
export function associatedDemoCoach(email: string) { return email === "club@example.com" ? "steven-fordant" : null; }

export async function listStructureOffers(ownerEmail?: string) {
  assertDemoFallbackAllowed("Séances de structure (démonstration)");
  const offers = isHostedDemo() ? (await readDemoState()).structureOffers ?? [] : memory;
  return offers.filter((offer) => !ownerEmail || offer.ownerEmail === ownerEmail);
}

export async function getStructureOffer(id: string) { return (await listStructureOffers()).find((offer) => offer.id === id) ?? null; }

export async function createStructureOffer(email: string, title: string, duration: string, slots: string[], capacity = 1) {
  assertDemoFallbackAllowed("Séances de structure (démonstration)");
  const coachId = associatedDemoCoach(email);
  if (!coachId) throw new Error("Un coach doit être affilié à votre structure avant de proposer une séance.");
  const offer: StructureOffer = { id: `offer-${randomUUID()}`, ownerEmail: email, coachId, title, duration, slots, capacity, createdAt: new Date().toISOString() };
  if (isHostedDemo()) return mutateDemoState((state) => { (state.structureOffers ??= []).push(offer); return offer; });
  memory.push(offer); return offer;
}

export async function structureReservationSummaries(email: string) {
  const ids = new Set((await listStructureOffers(email)).map((offer) => offer.id));
  const reservations: Reservation[] = await listReservations();
  return reservations.filter((r) => r.structureOfferId && ids.has(r.structureOfferId)).map((r) => ({ id: r.id, structureOfferId: r.structureOfferId, coachName: r.coachName, participantCount: r.participantCount ?? 1, service: r.service, slots: r.slots, status: r.status, price: r.price, reservationCode: ["accepted", "paid"].includes(r.status) ? r.reservationCode : undefined }));
}

export function publicStructureOffer({ ownerEmail: _ownerEmail, ...offer }: StructureOffer) { return offer; }
