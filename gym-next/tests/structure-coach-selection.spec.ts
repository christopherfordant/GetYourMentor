import { expect, test } from "@playwright/test";
import { createStructureOffer, memoryStructureOffers } from "../lib/structure-offers";

test("choix du coach : droits structure et compatibilité historique", async () => {
  const env = { ...process.env }, before = memoryStructureOffers.length;
  try {
    Object.assign(process.env, { NODE_ENV: "development", GETYOURMENTOR_ALLOW_DEMO: "true", DEPLOY_ENV: "local" });
    delete process.env.SUPABASE_URL; delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const slots = [new Date(Date.now() + 30 * 86400000).toISOString()];
    const old = await createStructureOffer("club@example.com", "Historique fictif", "1 heure", slots);
    expect(old.coachId).toBe("steven-fordant");
    await expect(createStructureOffer("club@example.com", "Interdit", "1 heure", slots, 4, "madison-seck")).rejects.toThrow("Coach non affilié");
    await expect(createStructureOffer("stranger@example.com", "Interdit", "1 heure", slots, 4, "steven-fordant")).rejects.toThrow();
    const explicit = await createStructureOffer("club@example.com", "Choix explicite", "1 heure", slots, 4, "steven-fordant");
    expect(explicit.coachId).toBe(old.coachId);
    expect(memoryStructureOffers.find(o => o.id === old.id)).toEqual(old);
    expect(memoryStructureOffers).toHaveLength(before + 2);
  } finally { process.env = env; memoryStructureOffers.splice(before); }
});
