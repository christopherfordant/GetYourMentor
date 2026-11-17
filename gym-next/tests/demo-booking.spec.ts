import { test, expect } from "@playwright/test";
import { GET as catalogGET } from "@/app/api/demo/catalog/route";
import { POST as reservationPOST, GET as reservationGET } from "@/app/api/demo/reservations/route";
import { POST as paymentPOST } from "@/app/api/demo/payment/route";
import { sealDemoSession, DEMO_SESSION_COOKIE } from "@/lib/demo-recruiter-session";

const coach = { fixtureKey: "coach-demo-tennis", name: "Coach Démo — Tennis", sport: "Tennis", city: "Ville de démonstration", service: "Séance fictive de tennis", priceCents: 4000,
  slots: [{ key: "tennis-matin", dayOffset: 2, startsAtUtc: "10:00:00", durationMinutes: 60 }] };
const reservationId = "123e4567-e89b-42d3-a456-426614174000";
const reservation = { id: reservationId, coachName: coach.name, sport: "Tennis", service: coach.service,
  appointmentAt: "2026-11-16T10:00:00Z", status: "accepted", approvalMode: "simulated", priceCents: 4000,
  paymentStatus: "not_started", createdAt: "2026-11-14T09:00:00Z" };

const demoEnv = {
  GYM_DEMO_SESSION_ENABLED: "true", DEPLOY_ENV: "demo", SITE_ID: "86e0379e-4d1a-4cf0-936c-1439397354f4",
  NEXT_PUBLIC_APP_URL: "https://getyourmentor-demo-20261014.netlify.app",
  GYM_DEMO_SUPABASE_URL: "https://rqxoovriacgoriimpbwi.supabase.co", GYM_DEMO_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test-only",
  GYM_DEMO_SUPABASE_SECRET_KEY: "sb_secret_test-only", GYM_DEMO_SESSION_SECRET: "a-long-local-test-secret-never-used-outside-tests",
};
const session = { userId: "223e4567-e89b-42d3-a456-426614174000", sessionId: "323e4567-e89b-42d3-a456-426614174000",
  accessToken: "athlete-access-token", refreshToken: "athlete-refresh-token", expiresAt: Date.now() + 60 * 60 * 1000 };
const cookieHeader = `${DEMO_SESSION_COOKIE}=${sealDemoSession(session, demoEnv.GYM_DEMO_SESSION_SECRET)}`;

async function withDemoEnvironment(callback: () => Promise<void>, fetcher: typeof fetch) {
  const previous = { ...process.env };
  const previousFetch = global.fetch;
  Object.assign(process.env, demoEnv);
  global.fetch = fetcher;
  try { await callback(); }
  finally {
    global.fetch = previousFetch;
    for (const key of Object.keys(demoEnv)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

function mockedSupabaseFetch(rpcBehavior: "success" | "conflict" = "success", calls: Array<{ url: string; init?: RequestInit }> = []): typeof fetch {
  return async (input, init) => {
    const url = String(input); calls.push({ url, init });
    if (url.endsWith("/auth/v1/user")) return Response.json({ id: session.userId, is_anonymous: true });
    if (url.includes("/rest/v1/gym_demo_sessions?")) return Response.json([{ id: session.sessionId }]);
    if (url.includes("/rest/v1/gym_demo_fixture_catalog?")) return Response.json([{ fixture_key: coach.fixtureKey, display_name: coach.name,
      sport: coach.sport, city_label: coach.city, service_label: coach.service, display_price_cents: coach.priceCents }]);
    if (url.includes("/rest/v1/gym_demo_fixture_slot_templates?")) return Response.json([{ fixture_key: coach.fixtureKey, slot_key: "tennis-matin",
      day_offset: 2, starts_at_utc: "10:00:00", duration_minutes: 60 }]);
    if (url.includes("/rest/v1/gym_demo_reservations?")) return Response.json([{ id: reservationId, coach_name_snapshot: coach.name,
      sport_snapshot: coach.sport, service_snapshot: coach.service, appointment_at: reservation.appointmentAt,
      status: "accepted", approval_mode: "simulated", display_price_cents: coach.priceCents, payment_status: "not_started", created_at: reservation.createdAt }]);
    if (url.endsWith("/rpc/gym_demo_book_and_accept_fixture")) return rpcBehavior === "success"
      ? Response.json(reservationId) : Response.json({ message: "demo slot unavailable" }, { status: 400 });
    if (url.endsWith("/rpc/gym_demo_confirm_simulated_payment")) return Response.json(true);
    throw new Error(`unexpected endpoint ${url}`);
  };
}

test("routes serveur n’exposent que les fixtures et isolent les mutations par session validée", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  await withDemoEnvironment(async () => {
    const catalog = await catalogGET();
    expect(await catalog.json()).toEqual({ coaches: [coach] });

    const own = await reservationGET(new Request("https://getyourmentor-demo-20261014.netlify.app/api/demo/reservations", {
      headers: { cookie: cookieHeader },
    }));
    expect(own.status).toBe(200);
    expect((await own.json() as { reservations: unknown[] }).reservations).toHaveLength(1);

    const booking = await reservationPOST(new Request("https://getyourmentor-demo-20261014.netlify.app/api/demo/reservations", {
      method: "POST", headers: { cookie: cookieHeader, origin: demoEnv.NEXT_PUBLIC_APP_URL, "content-type": "application/json" },
      body: JSON.stringify({ fixtureKey: coach.fixtureKey, slotKey: "tennis-matin", idempotencyKey: "423e4567-e89b-42d3-a456-426614174000" }),
    }));
    expect(booking.status).toBe(201);
    const bookingBody = await booking.json();
    expect(bookingBody).toEqual({ reservationId });
    const rpcCall = calls.find((call) => call.url.endsWith("/rpc/gym_demo_book_and_accept_fixture"));
    expect(new Headers(rpcCall?.init?.headers).get("apikey")).toBe(demoEnv.GYM_DEMO_SUPABASE_SECRET_KEY);
    expect(new Headers(rpcCall?.init?.headers).get("Authorization")).toBeNull();
    expect(JSON.stringify(bookingBody)).not.toContain(demoEnv.GYM_DEMO_SUPABASE_SECRET_KEY);

    const payment = await paymentPOST(new Request("https://getyourmentor-demo-20261014.netlify.app/api/demo/payment", {
      method: "POST", headers: { cookie: cookieHeader, origin: demoEnv.NEXT_PUBLIC_APP_URL, "content-type": "application/json" },
      body: JSON.stringify({ reservationId }),
    }));
    expect(payment.status).toBe(200);
    expect(await payment.json()).toEqual({ confirmed: true, realPayment: false });
    expect(calls.some((call) => /stripe|payment_intent/i.test(call.url))).toBe(false);
    expect(calls.some((call) => /telegram/i.test(call.url))).toBe(false);
  }, mockedSupabaseFetch("success", calls));
});

test("un créneau indisponible renvoie un conflit sans masquer la cause au sportif", async () => {
  await withDemoEnvironment(async () => {
    const response = await reservationPOST(new Request("https://getyourmentor-demo-20261014.netlify.app/api/demo/reservations", {
      method: "POST", headers: { cookie: cookieHeader, origin: demoEnv.NEXT_PUBLIC_APP_URL, "content-type": "application/json" },
      body: JSON.stringify({ fixtureKey: coach.fixtureKey, slotKey: "tennis-matin", idempotencyKey: "423e4567-e89b-42d3-a456-426614174000" }),
    }));
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ error: "Ce créneau vient d’être réservé. Choisissez-en un autre." });
  }, mockedSupabaseFetch("conflict"));
});

test("parcours /demo de bout en bout avec réservation et paiement simulés sur desktop et mobile", async ({ page }) => {
  let active = false;
  let booked = false;
  let paid = false;
  page.on("dialog", (dialog) => dialog.accept());
  await page.route("**/api/demo/**", async (route) => {
    const { pathname } = new URL(route.request().url());
    const method = route.request().method();
    if (pathname === "/api/demo/session" && method === "GET") return route.fulfill({ json: { active } });
    if (pathname === "/api/demo/session" && method === "POST") { active = true; return route.fulfill({ json: { active } }); }
    if (pathname === "/api/demo/session" && method === "DELETE") { active = false; booked = false; return route.fulfill({ json: { erased: true } }); }
    if (pathname === "/api/demo/catalog") return route.fulfill({ json: { coaches: [coach] } });
    if (pathname === "/api/demo/reservations" && method === "GET") return route.fulfill({ json: { reservations: booked ? [{ ...reservation, paymentStatus: paid ? "simulated_confirmed" : "not_started" }] : [] } });
    if (pathname === "/api/demo/reservations" && method === "POST") { booked = true; return route.fulfill({ status: 201, json: { reservationId } }); }
    if (pathname === "/api/demo/payment") { paid = true; return route.fulfill({ json: { confirmed: true, realPayment: false } }); }
    return route.fulfill({ status: 404, json: { error: "unexpected" } });
  });

  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: "Réserver une séance, étape par étape" })).toBeVisible();
  await expect(page.getByText("Aucun paiement réel.")).toBeVisible();
  await page.getByRole("button", { name: "Continuer avec le nécessaire" }).click();
  await page.getByRole("button", { name: "Commencer le parcours" }).click();
  await expect(page.getByRole("heading", { name: "Choisir un coach fictif" })).toBeVisible();
  await page.getByRole("button", { name: "Demander et accepter la réservation de démonstration" }).click();
  await expect(page.getByText("La réservation de démonstration a été acceptée automatiquement.")).toBeVisible();
  await page.getByRole("button", { name: "Confirmer le paiement simulé" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Paiement de démonstration confirmé." })).toBeVisible();
  await expect(page.getByText("Aucun paiement ni message externe")).toBeVisible();
  await expect(page.getByRole("button", { name: "Effacer mes données de démonstration" })).toBeVisible();
  const dimensions = await page.locator("body").evaluate((element) => ({ scroll: element.scrollWidth, client: element.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  await page.getByRole("button", { name: "Effacer mes données de démonstration" }).click();
  await expect(page.getByRole("button", { name: "Commencer le parcours" })).toBeVisible();
  await expect(page.getByText("Les profils fictifs partagés ont été conservés.")).toBeVisible();
});

test("API demo fails closed when demo Supabase is not configured", async () => {
  const keys = Object.keys(demoEnv);
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const previousFetch = global.fetch;
  for (const key of keys) delete process.env[key];
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; throw new Error("unexpected network call"); };
  try {
    const origin = "https://getyourmentor-demo-20261014.netlify.app";
    const catalog = await catalogGET();
    const mine = await reservationGET(new Request(`${origin}/api/demo/reservations`));
    const booking = await reservationPOST(new Request(`${origin}/api/demo/reservations`, {
      method: "POST", headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ fixtureKey: coach.fixtureKey, slotKey: "tennis-matin", idempotencyKey: "423e4567-e89b-42d3-a456-426614174000" }),
    }));
    const payment = await paymentPOST(new Request(`${origin}/api/demo/payment`, {
      method: "POST", headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ reservationId }),
    }));

    expect([catalog.status, mine.status, booking.status, payment.status]).toEqual([503, 503, 503, 503]);
    expect(fetchCalled).toBe(false);
  } finally {
    global.fetch = previousFetch;
    for (const key of keys) {
      const value = previous[key];
      if (typeof value === "string") process.env[key] = value;
      else delete process.env[key];
    }
  }
});

test("/demo explains that the parcours is unavailable when not configured", async ({ page }) => {
  await page.route("**/api/demo/session", async (route) => route.fulfill({
    status: 503,
    json: { error: "La démonstration n’est pas configurée sur cette cible" },
  }));

  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: "Parcours indisponible sur cet environnement" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Commencer le parcours" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Retour au site" })).toHaveAttribute("href", "/");
});
