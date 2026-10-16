import { expect, test } from "@playwright/test";
import { parsePublishedSession } from "../lib/domain/published-session";

test("publication : dates, durée, lieu, capacité explicite et compatibilité structures", () => {
  const valid = { title: "Séance fictive", location: "Terrain fictif", duration: "60 minutes", slots: [new Date(Date.now()+300*86400000).toISOString()], capacity: 4 };
  expect(parsePublishedSession(valid, true)).toMatchObject({ capacity: 4 });
  for (const patch of [{ slots: ["2028-02-30T10:00:00Z"] }, { slots: ["2020-01-01T10:00:00Z"] }, { duration: "0 min" }, { duration: "481 minutes" }, { capacity: 1 }, { capacity: 51 }, { capacity: "4" }, { location: " " }, { slots: [...valid.slots, new Date(Date.now()+301*86400000).toISOString()] }]) expect(parsePublishedSession({ ...valid, ...patch }, true)).toBeNull();
  expect(parsePublishedSession({ ...valid, capacity: 1, location: undefined })).not.toBeNull();
});

test("séances coach : propriété serveur, validation du profil et séparation des structures", async ({ request }, info) => {
  const auth = async (role: string) => { const r = await request.post("/api/auth/sign-in", { data: { email: `${role}@example.com`, password: "demo-password", role } }); return { Cookie: r.headers()["set-cookie"].split(";")[0], "x-forwarded-for": info.project.name.includes("mobile") ? "192.0.2.32" : "192.0.2.31" }; };
  const body = { title: "Contrôle fictif", location: "Terrain fictif", duration: "45 minutes", slots: [new Date(Date.now()+310*86400000).toISOString()], capacity: 4 };
  const coach = await auth("coach"), club = await auth("club"), athlete = await auth("sportif"), admin = await auth("admin");
  for (const headers of [club, athlete, admin, { Cookie: "" }]) expect((await request.post("/api/coaches/sessions", { headers, data: body })).status()).toBe(401);
  expect((await request.get("/api/coaches/sessions?mine=1", { headers: club })).status()).toBe(401);
  expect((await request.post("/api/coaches/sessions", { headers: coach, data: { ...body, coachId: "madison-seck" } })).status()).toBe(403);
  expect((await request.post("/api/coaches/sessions", { headers: coach, data: { ...body, slots: ["invalid"] } })).status()).toBe(400);
  const r = await request.post("/api/coaches/sessions", { headers: coach, data: { ...body, ownerEmail: "other@example.com", sport: "invented", price: 0 } });
  expect(r.status()).toBe(201); const offer = (await r.json()).data;
  expect(offer).toMatchObject({ source: "coach", coachId: "steven-fordant", sport: "basketball", capacity: 4 }); expect(offer.ownerEmail).toBeUndefined();
  const structures = (await (await request.get("/api/structures/offers")).json()).data;
  expect(structures.some((o: { id: string }) => o.id === offer.id)).toBe(false);
  const before = (await (await request.get("/api/affiliations", { headers: coach })).json()).data;
  expect(before.some((a: { id: string }) => a.id === "fixture-club-steven")).toBe(true);
  const email = `unverified-${Date.now()}@example.com`;
  const signup = await request.post("/api/auth/sign-up", { data: { email, role: "coach", password: "demo-password", firstName: `Unverified${Date.now()}`, lastName: "Fictif", phone: "0600000000", termsAccepted: true } });
  expect(signup.status()).toBe(201); const unknown = { Cookie: signup.headers()["set-cookie"].split(";")[0] };
  expect((await request.post("/api/coaches/sessions", { headers: unknown, data: body })).status()).toBe(409);
  expect((await (await request.get("/api/coaches/sessions?mine=1", { headers: unknown })).json()).data).toEqual([]);
});

test("coach publie, sportif réserve son groupe, prix historique et libération des places", async ({ request, browser }, info) => {
  test.setTimeout(120000);
  const auth = async (role: string, email = `${role}@example.com`) => { const r = await request.post("/api/auth/sign-in", { data: { email, password: "demo-password", role } }); return { Cookie: r.headers()["set-cookie"].split(";")[0] }; };
  const coach = await auth("coach"), athlete = await auth("sportif"), other = await auth("sportif", "other-collective@example.com");
  const previous = (await (await request.get("/api/coaches/steven-fordant", { headers: coach })).json()).data.groupPrices ?? [];
  const contexts = await Promise.all([browser.newContext({ viewport: { width: 390, height: 1000 } }), browser.newContext({ viewport: { width: 390, height: 1000 } })]);
  try {
    expect((await request.patch("/api/coaches/group-prices", { headers: coach, data: { prices: [{ participantCount: 3, totalCents: 7300 }, { participantCount: 2, totalCents: 5000 }] } })).status()).toBe(200);
    async function account(index: number, headers: typeof coach, mode: string) {
      const [name,...value] = headers.Cookie.split("="); await contexts[index].addCookies([{ name, value: value.join("="), url: "http://127.0.0.1:3001" }]);
      const page = await contexts[index].newPage(); await page.goto(`http://127.0.0.1:3001/compte?mode=${mode}`);
      const cookies = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true }); if (await cookies.isVisible()) await cookies.click(); return page;
    }
    const coachPage = await account(0, coach, "coach"); const editor = coachPage.locator("[data-coach-sessions]");
    await editor.getByLabel("Nom de la séance", { exact: true }).fill(`Collectif fictif ${info.project.name}`);
    await editor.getByLabel("Lieu de rendez-vous").fill("Terrain fictif — Marseille");
    await editor.getByLabel("Durée en minutes").fill("60");
    await editor.getByLabel("Créneau de la séance").fill(new Date(Date.now()+(info.project.name.includes("mobile") ? 321 : 320)*86400000).toISOString().slice(0,16));
    await editor.getByLabel("Places disponibles").fill("4");
    const publication = coachPage.waitForResponse(r => r.url().endsWith("/api/coaches/sessions") && r.request().method() === "POST");
    await editor.getByRole("button", { name: "Publier la séance", exact: true }).click();
    const published = await publication; expect(published.status()).toBe(201); const offer = (await published.json()).data;
    const athletePage = await account(1, athlete, "sportif"); await athletePage.goto("http://127.0.0.1:3001/coach?coach=steven-fordant#collective-sessions");
    const card = athletePage.locator(`[data-structure-offer="${offer.id}"]`); await expect(card).toContainText("Terrain fictif");
    await card.getByLabel("Nombre de participants, vous compris").fill("4"); await expect(card.getByRole("button", { name: "Demander pour mon groupe" })).toBeDisabled();
    await card.getByLabel("Nombre de participants, vous compris").fill("3");
    for (let i=0;i<2;i++) { const person = card.locator("fieldset").nth(i); await person.getByLabel("Prénom", { exact: true }).fill("Fictif"); await person.getByLabel("Nom", { exact: true }).fill(`Participant${i}`); await person.getByLabel("Âge").fill("25"); await person.getByLabel("Email", { exact: true }).fill(`collective-${i}@example.com`); }
    await expect(card.locator("[data-group-total]")).toContainText("73.00 EUR pour le groupe");
    for (const page of [coachPage, athletePage]) { const consent = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true }); if (await consent.isVisible()) await consent.click(); }
    for (const width of [320,390,768,1440]) {
      for (const page of [coachPage, athletePage]) { await page.setViewportSize({ width, height: 1000 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true); }
      if (width === 390 || width === 1440) { await editor.screenshot({ path: `../docs/assets/coach-collective/editor-${width}-${info.project.name}.png`, scale: "css" }); await card.screenshot({ path: `../docs/assets/coach-collective/booking-${width}-${info.project.name}.png`, scale: "css" }); }
    }
    const sent = athletePage.waitForResponse(r => r.url().endsWith("/api/reservations") && r.request().method() === "POST"); await card.getByRole("button", { name: "Demander pour mon groupe" }).click(); expect((await sent).status()).toBe(201);
    const reservation = (await (await request.get("/api/reservations", { headers: athlete })).json()).data.find((r: { structureOfferId: string }) => r.structureOfferId === offer.id);
    expect(reservation).toMatchObject({ coachId: "steven-fordant", participantCount: 3, price: 73, financials: { grossCents: 7300, commissionBps: 1500 } });
    const publicRows = async () => (await (await request.get("/api/coaches/sessions?coachId=steven-fordant", { headers: { Cookie: "" } })).json()).data;
    expect((await publicRows()).find((o: { id: string }) => o.id === offer.id).availability[0].remaining).toBe(1);
    const another = { structureOfferId: offer.id, slots: offer.slots, participantCount: 2, additionalParticipants: [{ firstName: "Fictif", lastName: "Autre", age: 25, email: "autre@example.com" }] };
    expect((await request.post("/api/reservations", { headers: other, data: another })).status()).toBe(409);
    expect((await request.patch(`/api/reservations/${reservation.id}`, { headers: coach, data: { status: "accepted" } })).status()).toBe(200);
    await request.patch("/api/coaches/group-prices", { headers: coach, data: { prices: [{ participantCount: 3, totalCents: 9900 }, { participantCount: 2, totalCents: 5000 }] } });
    expect((await request.post(`/api/reservations/${reservation.id}/payment`, { headers: athlete })).status()).toBe(200);
    const cancelled = await request.post(`/api/reservations/${reservation.id}/cancel`, { headers: athlete }); expect(cancelled.status()).toBe(200); expect((await cancelled.json()).data.refundAmount).toBe(73);
    expect((await publicRows()).find((o: { id: string }) => o.id === offer.id).availability[0].remaining).toBe(4);
    expect((await request.post("/api/reservations", { headers: other, data: another })).status()).toBe(201);
    expect(JSON.stringify(await publicRows())).not.toContain("collective-0@example.com");
  } finally { await request.patch("/api/coaches/group-prices", { headers: coach, data: { prices: previous } }); await Promise.all(contexts.map(c => c.close())); }
});

test("collectif coach : demandes concurrentes, chevauchement et refus libérant les places", async ({ request }, info) => {
  const auth = async (role: string, email = `${role}@example.com`) => { const r = await request.post("/api/auth/sign-in", { data: { email, role, password: "demo-password" } }); return { Cookie: r.headers()["set-cookie"].split(";")[0] }; };
  const coach = await auth("coach"), a = await auth("sportif", "concurrent-a@example.com"), b = await auth("sportif", "concurrent-b@example.com"), c = await auth("sportif", "concurrent-c@example.com");
  const before = (await (await request.get("/api/coaches/steven-fordant", { headers: coach })).json()).data.groupPrices ?? [];
  try {
    await request.patch("/api/coaches/group-prices", { headers: coach, data: { prices: [{ participantCount: 2, totalCents: 5000 }] } });
    const slots = [new Date(Date.now()+(info.project.name.includes("mobile") ? 331 : 330)*86400000).toISOString()];
    const input = { title: "Concurrence fictive", duration: "1 heure", location: "Terrain fictif", slots, capacity: 4 };
    const publication = await request.post("/api/coaches/sessions", { headers: coach, data: input }); expect(publication.status()).toBe(201); const offer = (await publication.json()).data;
    const party = { structureOfferId: offer.id, slots, participantCount: 2, additionalParticipants: [{ firstName: "Fictif", lastName: "Concurrent", age: 25, email: "concurrent@example.com" }] };
    const simultaneous = await Promise.all([request.post("/api/reservations", { headers: a, data: party }), request.post("/api/reservations", { headers: b, data: party })]);
    expect(simultaneous.map(r=>r.status())).toEqual([201,201]);
    expect((await request.post("/api/reservations", { headers: c, data: party })).status()).toBe(409);
    const overlap = await request.post("/api/coaches/sessions", { headers: coach, data: { ...input, title: "Chevauchement fictif", capacity: 50 } }); expect(overlap.status()).toBe(201); const blocked = (await overlap.json()).data;
    expect((await request.post("/api/reservations", { headers: c, data: { ...party, structureOfferId: blocked.id } })).status()).toBe(409);
    const first = (await simultaneous[0].json()).data;
    expect((await request.patch(`/api/reservations/${first.id}`, { headers: coach, data: { status: "rejected" } })).status()).toBe(200);
    expect((await request.post("/api/reservations", { headers: c, data: party })).status()).toBe(201);
  } finally { await request.patch("/api/coaches/group-prices", { headers: coach, data: { prices: before } }); }
});
