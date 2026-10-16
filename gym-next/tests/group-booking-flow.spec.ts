import { expect, test } from "@playwright/test";
test("coach fixe le total, sportif réserve 3 places, paiement et remboursement historiques", async ({ page, browser, request }, info) => {
  test.setTimeout(120000);
  const loginApi = async (role: string, email = `${role}@example.com`) => {
    const r = await request.post("/api/auth/sign-in", { data: { email, role, password: "demo-password" } }); expect(r.status()).toBe(200); return { Cookie: r.headers()["set-cookie"].split(";")[0] };
  };
  const coachHeaders = await loginApi("coach"); const clubHeaders = await loginApi("club"); const athleteHeaders = await loginApi("sportif");
  expect((await request.patch("/api/coaches/group-prices", { headers: athleteHeaders, data: { prices: [] } })).status()).toBe(401);
  expect((await request.patch("/api/coaches/group-prices", { headers: coachHeaders, data: { prices: [{ participantCount: 3, totalCents: -1 }] } })).status()).toBe(400);
  // Exercise the actual coach editor, not only the endpoint.
  await page.goto("/compte?mode=coach"); await page.locator("#account-email").fill("coach@example.com"); await page.locator("#account-password").fill("demo-password"); await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  const editor = page.locator("[data-group-prices]"); await editor.getByLabel("Nombre de participants", { exact: true }).fill("3"); await editor.getByLabel("Prix total du groupe (EUR)").fill("65"); await expect(editor.getByRole("button", { name: "Enregistrer le tarif de groupe" })).toBeEnabled(); await editor.getByRole("button", { name: "Enregistrer le tarif de groupe" }).click(); await expect(editor.getByRole("status")).toContainText("Tarif total enregistré");
  const slot = new Date(Date.now() + (150 + (info.project.name.includes("mobile") ? 1 : 0)) * 86400000).toISOString();
  const published = await request.post("/api/structures/offers", { headers: clubHeaders, data: { title: `Groupe fictif ${info.project.name}`, duration: "1 heure", capacity: 3, slots: [slot] } }); expect(published.status()).toBe(201); const offer = (await published.json()).data;
  const context = await browser.newContext(); const athlete = await context.newPage();
  let restore: { headers: Record<string,string>; bps: number; version: number } | undefined;
  try {
    await athlete.goto("http://127.0.0.1:3001/compte?mode=sportif"); await athlete.locator("#account-email").fill("sportif@example.com"); await athlete.locator("#account-password").fill("demo-password"); await athlete.getByRole("button", { name: "Se connecter", exact: true }).click(); await expect(athlete.locator("[data-account-session]")).toBeVisible(); await athlete.goto("http://127.0.0.1:3001/structures");
    const consent = athlete.getByRole("button", { name: "Continuer avec le nécessaire", exact: true }); if (await consent.isVisible()) await consent.click();
    const card = athlete.locator(`[data-structure-offer="${offer.id}"]`); await card.getByLabel("Nombre de participants, vous compris").fill("3");
    for (let index = 0; index < 2; index++) {
      const fields = card.locator("fieldset").nth(index); await fields.getByLabel("Prénom", { exact: true }).fill("Camille"); await fields.getByLabel("Nom", { exact: true }).fill(`Exemple ${index}`); await fields.getByLabel("Âge", { exact: true }).fill("22"); await fields.getByLabel("Email", { exact: true }).fill(`groupe-${index}@example.com`);
    }
    await expect(card.locator("[data-group-total]")).toContainText("65.00 EUR pour le groupe");
    for (const width of [320,390,768,1440]) { await athlete.setViewportSize({ width, height: 1000 }); expect(await athlete.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true); if (width === 390 || width === 1440) await card.screenshot({ path: `../docs/assets/group-booking/application-${width}-${info.project.name}.png`, scale: "css" }); }
    const created = athlete.waitForResponse(r => r.url().endsWith("/api/reservations") && r.request().method() === "POST"); await card.getByRole("button", { name: "Demander pour mon groupe" }).click(); const creation = await created; expect(creation.status()).toBe(201); const reservation = (await (await request.get("/api/reservations", { headers: athleteHeaders })).json()).data.find((r: { structureOfferId?: string }) => r.structureOfferId === offer.id);
    expect(reservation.price).toBe(65); expect(reservation.participantCount).toBe(3); expect(reservation.financials).toMatchObject({ grossCents: 6500, commissionBps: 1500 });
    const adminHeaders = await loginApi("admin");
    const original = (await (await request.get("/api/admin/commission", { headers: adminHeaders })).json()).data;
    const updated = await request.patch("/api/admin/commission", { headers: adminHeaders, data: { bps: 1234, version: original.version } }); expect(updated.status()).toBe(200);
    restore = { headers: adminHeaders, bps: original.bps, version: (await updated.json()).data.version };
    const coachData = (await (await request.get(`/api/reservations/${reservation.id}`, { headers: coachHeaders })).json()).data; expect(coachData.additionalParticipants.every((p: { email: string }) => p.email === "")).toBe(true);
    const structures = (await (await request.get("/api/structures/reservations", { headers: clubHeaders })).json()).data; const summary = structures.find((r: { id: string }) => r.id === reservation.id); expect(summary.participantCount).toBe(3); expect(summary.additionalParticipants).toBeUndefined();
    const other = await loginApi("sportif", "other-group@example.com"); expect((await request.get(`/api/reservations/${reservation.id}`, { headers: other })).status()).toBe(403);
    expect((await request.post("/api/reservations", { headers: other, data: { structureOfferId: offer.id, slots: [slot] } })).status()).toBe(409);
    expect((await request.patch(`/api/reservations/${reservation.id}`, { headers: coachHeaders, data: { status: "accepted" } })).status()).toBe(200);
    await request.patch("/api/coaches/group-prices", { headers: coachHeaders, data: { prices: [{ participantCount: 3, totalCents: 9900 }] } });
    expect((await request.post(`/api/reservations/${reservation.id}/payment`, { headers: athleteHeaders })).status()).toBe(200);
    const cancelled = (await (await request.post(`/api/reservations/${reservation.id}/cancel`, { headers: athleteHeaders })).json()).data;
    expect(cancelled.refundAmount).toBe(65); expect(cancelled.financials.grossCents).toBe(6500); expect(cancelled.refundedPlatformFeeCents).toBe(975);
    expect((await request.post("/api/reservations", { headers: other, data: { structureOfferId: offer.id, slots: [slot] } })).status()).toBe(201);
    const publicData = (await (await request.get("/api/reservations?coachId=steven-fordant", { headers: { Cookie: "" } })).json()).data; expect(JSON.stringify(publicData)).not.toContain("groupe-0@example.com");
  } finally { if (restore) await request.patch("/api/admin/commission", { headers: restore.headers, data: { bps: restore.bps, version: restore.version } }); await context.close(); }
});

test("groupes de 2, 4 et 5 : tailles tarifées, données complètes et capacité maximale", async ({ request }, info) => {
  const auth = async (role: string, email = `${role}@example.com`) => { const r = await request.post("/api/auth/sign-in", { data: { role, email, password: "demo-password" } }); return { Cookie: r.headers()["set-cookie"].split(";")[0] }; };
  const coach = await auth("coach"), club = await auth("club"), athlete = await auth("sportif"), other = await auth("sportif", "capacity-other@example.com");
  const before = (await (await request.get("/api/coaches/steven-fordant", { headers: coach })).json()).data.groupPrices ?? [];
  try {
    expect((await request.patch("/api/coaches/group-prices", { headers: coach, data: { prices: [2,4,5].map(n => ({ participantCount: n, totalCents: n * 1000 + 1500 })) } })).status()).toBe(200);
    for (const count of [2,4,5]) {
      const slot = new Date(Date.now() + (190 + count * 2 + (info.project.name.includes("mobile") ? 1 : 0)) * 86400000).toISOString();
      const offer = (await (await request.post("/api/structures/offers", { headers: club, data: { title: "Capacité groupe démo", duration: "1 heure", capacity: count, slots: [slot] } })).json()).data;
      const additionalParticipants = Array.from({ length: count - 1 }, (_, i) => ({ firstName: "Participant", lastName: `Exemple ${i}`, age: 20 + i, email: `person-${i}@example.com` }));
      const body = { structureOfferId: offer.id, slots: [slot], participantCount: count, additionalParticipants, price: 0 };
      const responses = await Promise.all([request.post("/api/reservations", { headers: athlete, data: body }), request.post("/api/reservations", { headers: other, data: body })]);
      expect(responses.map(r => r.status()).sort()).toEqual([201,409]);
      const winner = responses.findIndex(r => r.status() === 201); const reservation = (await responses[winner].json()).data;
      expect(reservation.price).toBe(count * 10 + 15); expect(reservation.additionalParticipants).toHaveLength(count - 1);
      expect((await request.patch(`/api/reservations/${reservation.id}`, { headers: coach, data: { status: "rejected" } })).status()).toBe(200);
      expect((await request.post("/api/reservations", { headers: winner === 0 ? other : athlete, data: body })).status()).toBe(201);
    }
  } finally { await request.patch("/api/coaches/group-prices", { headers: coach, data: { prices: before } }); }
});
