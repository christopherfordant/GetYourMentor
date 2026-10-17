import { expect, test } from "@playwright/test";
import { canReviewReservation, withReviewStats } from "../lib/domain/review-rules";
import { createReview, listReviews } from "../lib/reviews";

test("avis : paiement, fin exacte, durée et dates non ambiguës", () => {
  const now = Date.parse("2026-10-17T12:00:00Z");
  const row = { status: "paid" as const, slots: ["2026-10-17T11:00:00Z"], duration: "1 heure" };
  expect(canReviewReservation(row, now)).toBe(true);
  expect(canReviewReservation(row, now - 1)).toBe(false);
  for (const patch of [{ status: "accepted" as const }, { status: "cancelled" as const }, { slots: ["11:00"] }, { slots: ["2026-02-30T10:00:00Z"] }, { duration: "invalid" }, { slots: [...row.slots, "2026-10-17T10:00:00Z"] }]) expect(canReviewReservation({ ...row, ...patch }, now)).toBe(false);
  expect(canReviewReservation({ ...row, slots: ["11:00"], appointmentAt: "2026-10-17T11:00:00Z" }, now)).toBe(true);
});

test("notes : seuls les avis enregistrés comptent, sans modifier les profils", () => {
  const coaches = [{ id: "a", rating: 4.9, reviewCount: 38 }, { id: "b", rating: 4.8, reviewCount: 24 }];
  const rows = [{ reservationId: "r1", rating: 4 }, { reservationId: "r2", coachId: "a", rating: 2 }, { reservationId: "r1", coachId: "a", rating: 5 }, { reservationId: "r3", coachId: "a", rating: 99 }];
  expect(withReviewStats(coaches, rows, [{ id: "r1", coachId: "a" }])).toEqual([{ id: "a", rating: 3, reviewCount: 2 }, { id: "b", rating: 0, reviewCount: 0 }]);
  expect(coaches[0].rating).toBe(4.9);
});

test("stockage local : un seul avis par réservation et lecture isolée", async () => {
  const previous = process.env.GETYOURMENTOR_ALLOW_DEMO;
  process.env.GETYOURMENTOR_ALLOW_DEMO = "true";
  try {
    const row = { id: `review-unit-${Date.now()}`, reservationId: `past-unit-${Date.now()}`, coachId: "steven-fordant", authorEmail: "unit-review@example.com", rating: 5, comment: "Avis fictif de test", createdAt: new Date().toISOString() };
    const attempts = await Promise.allSettled([createReview(row), createReview({ ...row, id: `${row.id}-other` })]);
    expect(attempts.filter(result => result.status === "fulfilled")).toHaveLength(1);
    expect((await listReviews(row.authorEmail)).filter(review => review.reservationId === row.reservationId)).toHaveLength(1);
    expect((await listReviews("foreign@example.com")).some(review => review.reservationId === row.reservationId)).toBe(false);
  } finally { if (previous === undefined) delete process.env.GETYOURMENTOR_ALLOW_DEMO; else process.env.GETYOURMENTOR_ALLOW_DEMO = previous; }
});

test("avis publics : projection sans identité et états de la fiche", async ({ page, request }, info) => {
  const response = await request.get("/api/reviews?coachId=steven-fordant"); expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(JSON.stringify((await response.json()).data)).not.toMatch(/authorEmail|reservationId|@example\.com/);
  const anonymous = await request.get("/api/reviews", { headers: { Cookie: "" } }); expect(anonymous.status()).toBe(401);
  await page.goto("/coach?coach=steven-fordant");
  await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);
  const cookies = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true }); if (await cookies.isVisible()) await cookies.click();
  const reviews = page.locator("[data-coach-reviews]");
  await expect(reviews).toContainText("Pas encore d’avis enregistré.");
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    if (info.project.name === "desktop-chromium" && [390,1440].includes(width)) await reviews.screenshot({ path: `../docs/assets/persistence-reviews-2026-10-17/reviews-${width}.png` });
  }
});
