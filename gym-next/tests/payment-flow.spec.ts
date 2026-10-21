import { expect, test } from "@playwright/test";

test("le paiement est verrouillé avant acceptation puis confirmé après", async ({ page, request }, info) => {
  const appointmentAt = new Date(Date.now() + (info.project.name.includes("mobile") ? 96 : 72) * 3_600_000).toISOString();
  const created = await request.post("/api/reservations", {
    data: {
      coachId: "steven-fordant",
      service: "Coaching basketball",
      duration: "1 heure",
      price: 35,
      slots: [appointmentAt],
      appointmentAt,
    },
  });
  expect(created.status()).toBe(201);
  const reservation = (await created.json()).data;

  const paymentUrl = `/paiement?coach=Steven%20Fordant&city=Marseille&service=Coaching%20basketball&duration=1%20heure&price=35&slot=18:00&reservationId=${reservation.id}&claimToken=${reservation.claimToken}`;
  await page.goto("/compte", { waitUntil: "networkidle" });
  await page.locator("#account-email").fill("sportif@example.com");
  await page.locator("#account-password").fill("demo-password");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.locator("[data-account-session]")).toBeVisible();
  await page.goto(paymentUrl, { waitUntil: "networkidle" });
  await expect(page.locator('[data-payment-status]')).toHaveText("En attente de validation par le coach.");
  await expect(page.getByRole("button", { name: "Paiement indisponible" })).toBeDisabled();

  const signIn = await request.post("/api/auth/sign-in", {
    data: { email: "coach@example.com", password: "demo-password", role: "coach" },
  });
  const sessionCookie = signIn.headers()["set-cookie"].split(";")[0];
  const accepted = await request.patch(`/api/reservations/${reservation.id}`, {
    data: { status: "accepted" },
    headers: { Cookie: sessionCookie },
  });
  expect(accepted.status()).toBe(200);

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Simuler le paiement" })).toBeEnabled();
  const paymentResponse = page.waitForResponse((response) => response.url().includes(`/api/reservations/${reservation.id}/payment`) && response.request().method() === "POST");
  await page.getByRole("button", { name: "Simuler le paiement" }).click();
  await expect((await paymentResponse).json()).resolves.toMatchObject({ data: { confirmationStatus: "queued" } });
  await expect(page.getByRole("button", { name: "Paiement simulé confirmé" })).toBeVisible();
  await expect(page.locator('[data-review-after-session]')).toContainText("après la fin prévue");
  await expect(page.locator('[data-review-form]')).toHaveCount(0);
  const athleteCookie = (await page.context().cookies()).find(cookie => cookie.name === "gym_session");
  expect(athleteCookie).toBeDefined();
  const earlyReview = await request.post("/api/reviews", { headers: { Cookie: `gym_session=${athleteCookie!.value}` }, data: { reservationId: reservation.id, rating: 5, comment: "Avis avant la séance refusé" } });
  expect(earlyReview.status()).toBe(409);

  await page.goto("/compte", { waitUntil: "networkidle" });
  await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);
  const refuseCookies = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true });
  if (await refuseCookies.isVisible()) await refuseCookies.click();
  const athleteReservation = page.locator(`[data-athlete-reservation="${reservation.id}"]`);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const columns = await page.locator("[data-athlete-dashboard]").evaluate(root => getComputedStyle(root).gridTemplateColumns.trim().split(/\s+/).length);
    expect(columns).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect(athleteReservation).toBeVisible();
    if (info.project.name === "desktop-chromium" && [390, 1440].includes(width)) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: `../docs/assets/offres-demo-2026-10-17/athlete-${width}.png`, fullPage: true });
    }
  }
  await expect(athleteReservation).toBeVisible();
  await athleteReservation.getByRole("button", { name: "Annuler la réservation", exact: true }).click();
  await expect(athleteReservation.locator("[data-athlete-reservation-status]")).toHaveText("Statut : cancelled");
  await expect(athleteReservation).toContainText("Remboursement simulé : 100%");
});
