import { expect, test } from "@playwright/test";
import { memoryStructureOffers as serviceOffers, listStructureOffers } from "../lib/structure-offers";
import { memoryStructureOffers } from "../lib/repositories/structure-offer-memory";
import { createPersistedReservation, hasReservationSlotConflict, memoryReservations } from "../lib/repositories/reservation-repository";
import type { StructureOffer } from "../lib/domain/structure-offer";
import type { Reservation } from "../lib/domain";
import type { DemoState } from "../lib/repositories/demo-state";

const slot = "2035-06-15T10:00:00.000Z";
const offer = (capacity: number): StructureOffer => ({ id: "arc-offer", ownerEmail: "club@example.com", coachId: "arc-coach", title: "Fixture collective", duration: "1 heure", slots: [slot], capacity, createdAt: "2035-01-01T00:00:00.000Z" });
const booking = (id: string, count = 1): Reservation => ({ id, ownerEmail: `${id}@example.com`, coachId: "arc-coach", coachName: "Fixture", sport: "football", city: "Paris", service: "Fixture", duration: "1 heure", price: 40, slots: [slot], status: "requested", createdAt: "2035-01-01T00:00:00.000Z", structureOfferId: "arc-offer", participantCount: count });

test.describe("ARC cycle : contrats de stockage", () => {
  let env: NodeJS.ProcessEnv, fetchBefore: typeof fetch, offersBefore: number, reservationsBefore: number;
  test.beforeEach(() => {
    env = { ...process.env }; fetchBefore = globalThis.fetch;
    offersBefore = memoryStructureOffers.length; reservationsBefore = memoryReservations.length;
    for (const name of ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) delete process.env[name];
    Object.assign(process.env, { NODE_ENV: "development", GETYOURMENTOR_ALLOW_DEMO: "true", DEPLOY_ENV: "local" });
    globalThis.fetch = async () => { throw new Error("Network forbidden in local contract test"); };
  });
  test.afterEach(() => {
    process.env = env; globalThis.fetch = fetchBefore;
    memoryStructureOffers.splice(offersBefore); memoryReservations.splice(reservationsBefore);
  });

  test("la façade et le repository partagent la capacité et les créneaux", async () => {
    expect(serviceOffers).toBe(memoryStructureOffers);
    memoryStructureOffers.push(offer(2));
    expect((await listStructureOffers("club@example.com")).find(o => o.id === "arc-offer")).toBe(memoryStructureOffers.at(-1));
    await createPersistedReservation(booking("arc-first"));
    await createPersistedReservation(booking("arc-second"));
    await expect(createPersistedReservation(booking("arc-third"))).rejects.toThrow("créneaux");
    const overlap = { ...booking("arc-overlap"), structureOfferId: undefined, slots: ["2035-06-15T10:30:00.000Z"], duration: "30min" };
    await expect(createPersistedReservation(overlap)).rejects.toThrow("créneaux");
  });

  test("le chemin document démo utilise sa capacité plutôt que le tableau local", async () => {
    memoryStructureOffers.push(offer(1));
    const state = { reservations: [], structureOffers: [offer(3)] } as unknown as DemoState;
    const mutate = async <T,>(change: (s: DemoState) => T): Promise<T> => change(state);
    await createPersistedReservation(booking("arc-document", 3), undefined, mutate);
    await expect(createPersistedReservation(booking("arc-document-full"), undefined, mutate)).rejects.toThrow("créneaux");
    expect(state.reservations).toHaveLength(1);
    expect(memoryReservations).toHaveLength(reservationsBefore);
  });

  test("le chemin persisté ignore la capacité démo et refuse le groupe non pris en charge", async () => {
    Object.assign(process.env, { SUPABASE_URL: "https://storage.invalid", SUPABASE_SERVICE_ROLE_KEY: "fixture-only" });
    memoryStructureOffers.push(offer(100));
    let reads = 0;
    globalThis.fetch = async (input, init) => {
      const url = new URL(String(input));
      expect(url.origin).toBe("https://storage.invalid"); expect(init?.method ?? "GET").toBe("GET");
      reads++;
      return new Response(JSON.stringify([{ id: "persisted", coach_id: "arc-coach", slots: [slot], duration: "1 heure", status: "requested", structure_offer_id: "arc-offer", participant_count: 1 }]), { status: 200 });
    };
    expect(await hasReservationSlotConflict("arc-coach", [slot], undefined, "1 heure", "arc-offer")).toBe(true);
    await expect(createPersistedReservation(booking("arc-group", 2))).rejects.toThrow("limitées au stockage de démonstration");
    expect(reads).toBe(1); expect(memoryReservations).toHaveLength(reservationsBefore);
  });

  test("sans stockage configuré la production ne bascule pas en mémoire", async () => {
    Object.assign(process.env, { NODE_ENV: "production", GETYOURMENTOR_ALLOW_DEMO: "false", GETYOURMENTOR_ACCEPTANCE_MODE: "false" });
    await expect(createPersistedReservation(booking("arc-production"))).rejects.toThrow("production");
    await expect(listStructureOffers()).rejects.toThrow("production");
    expect(memoryReservations).toHaveLength(reservationsBefore);
  });
});
