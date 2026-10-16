import { expect, test } from "@playwright/test";
import { requestAffiliation, respondAffiliation, listAffiliations, memoryAffiliations } from "../lib/affiliations";

test("consentement : deux initiateurs, isolation, concurrence et réponses idempotentes", async () => {
  const env = { ...process.env }, before = memoryAffiliations.length;
  try {
    Object.assign(process.env, { NODE_ENV: "development", GETYOURMENTOR_ALLOW_DEMO: "true", DEPLOY_ENV: "local" });
    delete process.env.SUPABASE_URL; delete process.env.NEXT_PUBLIC_SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const club = { role: "club" as const, email: "consent@example.com" }, coach = { role: "coach" as const, email: "consent-coach@example.com", coachId: "consent-coach" };
    const pair = await Promise.all([requestAffiliation(club, club.email, coach.coachId), requestAffiliation(club, club.email, coach.coachId)]);
    expect(pair[0].id).toBe(pair[1].id); expect(pair[0].status).toBe("pending");
    expect(memoryAffiliations).toHaveLength(before + 1);
    await expect(respondAffiliation(club, pair[0].id, "accept")).rejects.toMatchObject({ status: 403 });
    await expect(respondAffiliation({ ...coach, coachId: "intruder" }, pair[0].id, "accept")).rejects.toMatchObject({ status: 403 });
    await expect(respondAffiliation({ role: "admin", email: "admin@example.com" }, pair[0].id, "accept")).rejects.toMatchObject({ status: 403 });
    const accepted = await respondAffiliation(coach, pair[0].id, "accept");
    expect(accepted).toMatchObject({ status: "accepted", structureConsent: true, coachConsent: true });
    expect(await respondAffiliation(coach, accepted.id, "accept")).toEqual(accepted);
    await expect(respondAffiliation(coach, accepted.id, "reject")).rejects.toMatchObject({ status: 409 });
    expect(await listAffiliations({ ...club, email: "stranger@example.com" })).toEqual([]);
    const reverse = await requestAffiliation(coach, "another@example.com", coach.coachId);
    expect(reverse).toMatchObject({ structureConsent: false, coachConsent: true });
    expect(await respondAffiliation({ ...club, email: "another@example.com" }, reverse.id, "reject")).toMatchObject({ status: "rejected", structureConsent: false });
    await expect(respondAffiliation({ ...club, email: "another@example.com" }, reverse.id, "accept")).rejects.toMatchObject({ status: 409 });
    const crossedClub = { ...club, email: "crossed@example.com" };
    const crossed = await Promise.all([requestAffiliation(crossedClub, crossedClub.email, coach.coachId), requestAffiliation(coach, crossedClub.email, coach.coachId)]);
    expect(crossed[0].id).toBe(crossed[1].id);
    expect(crossed[1]).toMatchObject({ status: "accepted", structureConsent: true, coachConsent: true });
    process.env.SUPABASE_URL = "https://example.invalid";
    await expect(listAffiliations(club)).rejects.toMatchObject({ status: 503 });
  } finally { process.env = env; memoryAffiliations.splice(before); }
});

test("interfaces bilatérales : demande, deux accords, choix coach et réservation au bon tarif", async ({ request, browser }, info) => {
  test.setTimeout(120000);
  const suffix = `${Date.now()}${info.project.name.includes("mobile") ? "m" : "d"}`;
  async function signup(role: string, prefix: string) {
    const email = `${prefix}-${suffix}@example.com`;
    const res = await request.post("/api/auth/sign-up", { data: { role, email, password: "demo-password", firstName: `${prefix}${suffix}`, lastName: "Fictif", phone: "0600000000", city: "Marseille", termsAccepted: true } });
    expect(res.status()).toBe(201);
    return { email, headers: { Cookie: res.headers()["set-cookie"].split(";")[0], "x-forwarded-for": info.project.name.includes("mobile") ? "192.0.2.12" : "192.0.2.11" }, data: (await res.json()).data };
  }
  const club = await signup("club", "club"), second = await signup("club", "second"), coach = await signup("coach", "coach");
  const coachId = coach.data.coachId;
  expect(typeof coachId).toBe("string");
  const create = (headers: typeof club.headers, selected: string) => request.post("/api/structures/offers", { headers, data: { coachId: selected, title: "Séance consentement fictive", duration: "1 heure", capacity: 4, slots: [new Date(Date.now() + 250 * 86400000).toISOString()] } });
  expect((await create(club.headers, coachId)).status()).toBe(409);
  expect((await request.get("/api/affiliations", { headers: { Cookie: "" } })).status()).toBe(401);
  expect((await request.post("/api/affiliations", { headers: club.headers, data: { coachId: "unknown-coach" } })).status()).toBe(404);
  const contexts = await Promise.all([browser.newContext({ viewport: { width: 390, height: 1000 } }), browser.newContext({ viewport: { width: 390, height: 1000 } })]);
  try {
    async function account(index: number, user: typeof club, role: string) {
      const [name, ...parts] = user.headers.Cookie.split("=");
      await contexts[index].addCookies([{ name, value: parts.join("="), url: "http://127.0.0.1:3001" }]);
      const page = await contexts[index].newPage(); await page.goto(`/compte?mode=${role}`.replace(/^/, "http://127.0.0.1:3001"));
      await expect(page.locator("[data-affiliations]")).toBeVisible(); const cookies = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true }); if (await cookies.isVisible()) await cookies.click(); return page;
    }
    const clubPage = await account(0, club, "club"), coachPage = await account(1, coach, "coach");
    await clubPage.getByLabel("Coach à inviter").selectOption(coachId);
    await clubPage.getByRole("button", { name: "Demander une affiliation", exact: true }).click();
    await expect(clubPage.locator("[data-affiliations]")).toContainText("En attente de l’accord du destinataire");
    const rows = (await (await request.get("/api/affiliations", { headers: club.headers })).json()).data;
    const row = rows.find((r: { coachId: string }) => r.coachId === coachId);
    expect((await request.patch("/api/affiliations", { headers: club.headers, data: { id: row.id, action: "accept" } })).status()).toBe(403);
    expect((await request.patch("/api/affiliations", { headers: second.headers, data: { id: row.id, action: "accept" } })).status()).toBe(403);
    expect((await create(club.headers, coachId)).status()).toBe(409);
    await coachPage.getByRole("button", { name: "Actualiser les affiliations" }).click();
    await coachPage.locator(`[data-affiliation="${row.id}"]`).getByRole("button", { name: "Accepter l’affiliation" }).click();
    await expect(coachPage.locator(`[data-affiliation="${row.id}"]`)).toContainText("Active — accord des deux parties");
    await clubPage.reload(); await expect(clubPage.getByLabel("Coach responsable")).toHaveValue(coachId);
    const offer = await create(club.headers, coachId); expect(offer.status()).toBe(201);
    const offerData = (await offer.json()).data; expect(offerData.coachId).toBe(coachId);
    const prices = await request.patch("/api/coaches/group-prices", { headers: coach.headers, data: { prices: [{ participantCount: 2, totalCents: 7200 }] } }); expect(prices.status()).toBe(200);
    const athlete = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", password: "demo-password", role: "sportif" } });
    const admin = await request.post("/api/auth/sign-in", { data: { email: "admin@example.com", password: "demo-password", role: "admin" } });
    const adminHeaders = { Cookie: admin.headers()["set-cookie"].split(";")[0] };
    expect((await request.get("/api/affiliations", { headers: adminHeaders })).status()).toBe(200);
    expect((await request.patch("/api/affiliations", { headers: adminHeaders, data: { id: row.id, action: "accept" } })).status()).toBe(401);
    expect((await request.patch(`/api/admin/coaches/${coachId}`, { headers: adminHeaders, data: { verified: true } })).status()).toBe(200);
    const booking = await request.post("/api/reservations", { headers: { Cookie: athlete.headers()["set-cookie"].split(";")[0] }, data: { structureOfferId: offerData.id, slots: offerData.slots, participantCount: 2, additionalParticipants: [{ firstName: "Fictif", lastName: "Participant", age: 25, email: "participant@example.com" }] } });
    expect(booking.status()).toBe(201); expect((await booking.json()).data).toMatchObject({ coachId, price: 72 });
    // The coach can also initiate; the structure must explicitly accept.
    await coachPage.getByLabel("Email du compte structure").fill(second.email);
    await coachPage.getByRole("button", { name: "Demander une affiliation", exact: true }).click();
    await expect(coachPage.locator("[data-affiliations]")).toContainText("En attente de l’accord du destinataire");
    const otherRows = (await (await request.get("/api/affiliations", { headers: second.headers })).json()).data;
    expect(otherRows).toHaveLength(1); const reverse = otherRows[0];
    expect(reverse).toMatchObject({ requestedBy: "coach", structureConsent: false, coachConsent: true });
    await contexts[0].clearCookies();
    const [cookieName, ...cookieValue] = second.headers.Cookie.split("=");
    await contexts[0].addCookies([{ name: cookieName, value: cookieValue.join("="), url: "http://127.0.0.1:3001" }]);
    await clubPage.goto("http://127.0.0.1:3001/compte?mode=club");
    await clubPage.locator(`[data-affiliation="${reverse.id}"]`).getByRole("button", { name: "Accepter l’affiliation" }).click();
    await expect(clubPage.locator(`[data-affiliation="${reverse.id}"]`)).toContainText("Active — accord des deux parties");
    expect((await create(second.headers, coachId)).status()).toBe(201);
    for (const width of [320,390,768,1440]) {
      await clubPage.setViewportSize({ width, height: 1000 });
      expect(await clubPage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      if (width === 390 || width === 1440) await clubPage.locator("[data-affiliations]").screenshot({ path: `../docs/assets/affiliations-consent/club-${width}-${info.project.name}.png`, scale: "css" });
      await coachPage.setViewportSize({ width, height: 1000 });
      expect(await coachPage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      if (width === 390 || width === 1440) await coachPage.locator("[data-affiliations]").screenshot({ path: `../docs/assets/affiliations-consent/coach-${width}-${info.project.name}.png`, scale: "css" });
    }
  } finally { await Promise.all(contexts.map(c => c.close())); }
});
