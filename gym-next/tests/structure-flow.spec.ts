import { expect, test } from "@playwright/test";

test("structure → demande élève → acceptation coach → paiement → planning structure", async ({ page, browser }, info) => {
  test.setTimeout(120000);
  const baseURL = process.env.PW_DEMO_BASE_URL ?? "http://127.0.0.1:3001";
  async function login(target: typeof page, role: string) {
    await target.goto(`${baseURL}/compte?mode=${role}`); await target.locator("#account-email").fill(`${role}@example.com`); await target.locator("#account-password").fill("demo-password");
    await target.getByRole("button", { name: "Se connecter", exact: true }).click(); await expect(target.locator("[data-account-session]")).toBeVisible();
  }
  await login(page, "club");
  const title = `Séance structure ${info.project.name} ${Date.now()}`;
  const time = new Date(Date.now() + 14 * 86400000 + (info.project.name.includes("mobile") ? 3600000 : 0));
  await page.getByLabel("Nom de la séance", { exact: true }).fill(title);
  await page.getByLabel("Créneau de la séance", { exact: true }).fill(time.toISOString().slice(0, 16));
  const published = page.waitForResponse((r) => r.url().endsWith("/api/structures/offers") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Publier la séance", exact: true }).click();
  const offerResponse = await published; expect(offerResponse.status()).toBe(201); const offer = (await offerResponse.json()).data;
  expect(offer.ownerEmail).toBeUndefined(); expect(offer.coachId).toBe("steven-fordant");
  const athleteContext = await browser.newContext({ baseURL, viewport: info.project.use.viewport });
  const coachContext = await browser.newContext({ baseURL, viewport: info.project.use.viewport });
  try {
    const athlete = await athleteContext.newPage(); const coach = await coachContext.newPage();
    await login(athlete, "sportif"); await athlete.goto(`${baseURL}/structures`);
    const created = athlete.waitForResponse((r) => r.url().endsWith("/api/reservations") && r.request().method() === "POST");
    await athlete.locator(`[data-structure-offer="${offer.id}"]`).getByRole("button", { name: "Demander ce créneau" }).click();
    expect((await created).status()).toBe(201);
    await expect(athlete).toHaveURL(/\/compte/);
    const reservation = await athlete.evaluate(async (offerId) => (await (await fetch("/api/reservations")).json()).data.find((r: { structureOfferId?: string }) => r.structureOfferId === offerId), offer.id);
    expect(reservation.structureOfferId).toBe(offer.id); expect(reservation.price).toBeGreaterThan(0);
    await expect(athlete.locator(`[data-athlete-reservation="${reservation.id}"]`)).toContainText("requested");
    await login(coach, "coach");
    const row = coach.locator(`[data-coach-request="${reservation.id}"]`);
    await row.getByRole("button", { name: "Accepter", exact: true }).click(); await expect(row).toContainText("En attente du paiement");
    await athlete.reload(); await athlete.locator(`[data-athlete-reservation="${reservation.id}"]`).getByRole("link", { name: "Payer ma séance" }).click();
    await expect(athlete.getByRole("button", { name: "Payer et confirmer", exact: true })).toBeEnabled();
    await athlete.getByRole("button", { name: "Payer et confirmer", exact: true }).click(); await expect(athlete.locator("[data-payment-status]")).toHaveText("Paiement confirmé.");
    await coach.getByRole("button", { name: "Actualiser les demandes et paiements", exact: true }).click(); await expect(row).toContainText("Paiement élève confirmé");
    await page.getByRole("button", { name: "Actualiser le planning", exact: true }).click();
    await expect(page.locator(`[data-structure-reservation="${reservation.id}"]`)).toContainText("paid");
    const privateData = await page.evaluate(async () => (await (await fetch("/api/structures/reservations")).json()).data);
    expect(privateData.every((r: Record<string, unknown>) => !r.ownerEmail && !r.stripePaymentIntentId && !r.financials)).toBeTruthy();
    await page.screenshot({ path: `playwright-artifacts/account-ux-2026-10-15/structure-flow-${info.project.name}.png`, fullPage: true, scale: "css" });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
    await athlete.goto(`${baseURL}/compte?mode=sportif`);
    const cancelled = athlete.waitForResponse(r => r.url().endsWith(`/api/reservations/${reservation.id}/cancel`));
    await athlete.locator(`[data-athlete-reservation="${reservation.id}"]`).getByRole("button", { name: "Annuler la réservation" }).click();
    const refund = (await (await cancelled).json()).data;
    expect(refund.status).toBe("cancelled"); expect(refund.refundPercent).toBe(100);
    expect(refund.refundAmount).toBe(reservation.price); expect(refund.refundedPlatformFeeCents).toBe(reservation.financials.platformFeeCents);
    expect(refund.refundStatus).toBe("succeeded");
    await expect(athlete.locator(`[data-athlete-reservation="${reservation.id}"]`)).toContainText("Remboursement : 100%");
    await page.getByRole("button", { name: "Actualiser le planning", exact: true }).click();
    await expect(page.locator(`[data-structure-reservation="${reservation.id}"]`)).toContainText("cancelled");
    await coach.getByRole("button", { name: "Actualiser les demandes et paiements", exact: true }).click();
    await expect(row).toContainText("cancelled");
    await page.setViewportSize({ width: info.project.name.includes("mobile") ? 390 : 1440, height: 1000 });
    for (const target of [page, athlete]) {
      const consent = target.getByRole("button", { name: "Continuer avec le nécessaire", exact: true });
      if (await consent.isVisible()) await consent.click();
      await target.evaluate(() => window.scrollTo(0, 0));
      expect(await target.locator(".account-panel").evaluate(element => getComputedStyle(element).opacity)).toBe("1");
      expect(await target.locator(".account-panel").evaluate(element => getComputedStyle(element).filter)).toBe("none");
    }
    await expect(athlete.locator(`[data-athlete-reservation="${reservation.id}"]`)).toHaveCSS("display", "grid");
    await page.screenshot({ path: `../docs/assets/booking-consolidation/structure-${info.project.name}.png`, fullPage: true, scale: "css" });
    await athlete.screenshot({ path: `../docs/assets/booking-consolidation/remboursement-${info.project.name}.png`, fullPage: true, scale: "css" });
  } finally { await athleteContext.close(); await coachContext.close(); }
});

test("structure : affiliation, données et prix ne sont pas choisis par le navigateur", async ({ request }, info) => {
  const login = await request.post("/api/auth/sign-in", { data: { email: "club@example.com", password: "demo-password", role: "club" } });
  const clubHeaders = { Cookie: login.headers()["set-cookie"].split(";")[0] };
  const slots = [new Date(Date.now() + 30 * 86400000 + (info.project.name.includes("mobile") ? 3600000 : 0)).toISOString()];
  const published = await request.post("/api/structures/offers", { headers: clubHeaders, data: { title: "Séance de contrôle", duration: "1 heure", slots, coachId: "madison-seck", ownerEmail: "other@example.com", price: 0 } });
  expect(published.status()).toBe(201); const offer = (await published.json()).data; expect(offer.coachId).toBe("steven-fordant"); expect(offer.ownerEmail).toBeUndefined();
  const athlete = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", password: "demo-password", role: "sportif" } });
  const athleteHeaders = { Cookie: athlete.headers()["set-cookie"].split(";")[0] };
  expect((await request.get("/api/structures/reservations", { headers: athleteHeaders })).status()).toBe(401);
  expect((await request.post("/api/reservations", { headers: athleteHeaders, data: { structureOfferId: offer.id, slots, coachId: "madison-seck" } })).status()).toBe(403);
  expect((await request.post("/api/reservations", { headers: athleteHeaders, data: { structureOfferId: offer.id, slots: ["2028-01-01"] } })).status()).toBe(400);
  const stranger = await request.post("/api/auth/sign-up", { data: { email: `structure-${Date.now()}@example.com`, password: "demo-password", role: "club", firstName: "Fictif", lastName: "Test", phone: "0600000000", termsAccepted: true } });
  expect(stranger.status()).toBe(201); const strangerHeaders = { Cookie: stranger.headers()["set-cookie"].split(";")[0] };
  expect((await request.post("/api/structures/offers", { headers: strangerHeaders, data: { title: "Sans affiliation", duration: "1 heure", slots } })).status()).toBe(409);
  expect((await (await request.get("/api/structures/reservations", { headers: strangerHeaders })).json()).data).toEqual([]);
});
