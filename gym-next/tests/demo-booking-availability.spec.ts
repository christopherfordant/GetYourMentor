import { expect, test } from "@playwright/test";
import { listDemoFixtures } from "@/lib/demo-recruiter-booking";

const config = {
  supabaseUrl: "https://rqxoovriacgoriimpbwi.supabase.co",
  publishableKey: "sb_publishable_test-only",
  secretKey: "sb_secret_test-only",
  cookieSecret: "local-test-secret",
};

test("le catalogue masque un créneau déjà réservé par un autre testeur", async () => {
  const today = new Date();
  const bookedAt = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 2, 10));
  const fixtureCoachId = "523e4567-e89b-42d3-a456-426614174000";
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    requests.push({ url, init });
    if (url.includes("/gym_demo_fixture_catalog?")) return Response.json([{ fixture_key: "coach-demo-tennis",
      display_name: "Coach Démo — Tennis", sport: "Tennis", city_label: "Ville de démonstration",
      service_label: "Séance fictive de tennis", display_price_cents: 4000 }]);
    if (url.includes("/gym_demo_fixture_slot_templates?")) return Response.json([
      { fixture_key: "coach-demo-tennis", slot_key: "tennis-matin", day_offset: 2, starts_at_utc: "10:00:00", duration_minutes: 60 },
      { fixture_key: "coach-demo-tennis", slot_key: "tennis-apres-midi", day_offset: 3, starts_at_utc: "15:00:00", duration_minutes: 60 },
    ]);
    if (url.includes("/gym_demo_coaches?")) return Response.json([{ id: fixtureCoachId, fixture_key: "coach-demo-tennis" }]);
    if (url.includes("/gym_demo_slots?")) return Response.json([{ coach_id: fixtureCoachId,
      starts_at: bookedAt.toISOString(), state: "booked" }]);
    throw new Error(`unexpected endpoint ${url}`);
  };

  const fixtures = await listDemoFixtures(config, fetcher);

  expect(fixtures[0]?.slots.map((slot) => slot.key)).toEqual(["tennis-apres-midi"]);
  const availabilityReads = requests.filter(({ url }) => url.includes("/gym_demo_coaches?") || url.includes("/gym_demo_slots?"));
  expect(availabilityReads).toHaveLength(2);
  for (const call of availabilityReads) {
    const headers = new Headers(call.init?.headers);
    expect(headers.get("apikey")).toBe(config.publishableKey);
    expect(headers.get("Authorization")).toBeNull();
  }
});
