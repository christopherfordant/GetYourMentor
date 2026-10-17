import { expect, test } from "@playwright/test";

test("structure et coach : accord actif, deux initiateurs et isolation", async ({ request }, info) => {
  const ip = info.project.name.includes("mobile") ? "192.0.2.81" : "192.0.2.80";
  const login = async (role: string, email = `${role}@example.com`) => {
    const response = await request.post("/api/auth/sign-in", { data: { role, email, password: "demo-password" } });
    expect(response.status()).toBe(200); return { Cookie: response.headers()["set-cookie"].split(";")[0], "x-forwarded-for": ip };
  };
  const email = `club-message-${Date.now()}@example.com`;
  const signup = await request.post("/api/auth/sign-up", { data: { email, role: "club", password: "demo-password", firstName: "Club", lastName: "Fictif", phone: "0600000000", termsAccepted: true } });
  expect(signup.status()).toBe(201); const club = { Cookie: signup.headers()["set-cookie"].split(";")[0], "x-forwarded-for": ip };
  const coach = await login("coach"), athlete = await login("sportif"), other = await login("club", `other-${email}`);
  const first = { recipientName: "steven-fordant", body: "Question fictive structure", requestId: `club-${Date.now()}`, ownerRole: "sportif", authorRole: "coach" };
  expect((await request.post("/api/messages", { headers: club, data: first })).status()).toBe(403);
  const requested = await request.post("/api/affiliations", { headers: club, data: { coachId: "steven-fordant" } }); expect(requested.status()).toBe(200);
  const affiliation = (await requested.json()).data;
  expect((await request.post("/api/messages", { headers: club, data: first })).status()).toBe(403);
  expect((await request.patch("/api/affiliations", { headers: coach, data: { id: affiliation.id, action: "accept" } })).status()).toBe(200);
  const sent = await request.post("/api/messages", { headers: club, data: first }); expect(sent.status()).toBe(201); const message = (await sent.json()).data;
  expect(message).toMatchObject({ senderEmail: email, authorRole: "club", ownerRole: "club", coachId: "steven-fordant" });
  const repeat = await request.post("/api/messages", { headers: club, data: first }); expect(repeat.status()).toBe(201); expect((await repeat.json()).data.id).toBe(message.id);
  const response = await request.post("/api/messages", { headers: coach, data: { replyToId: message.id, body: "Réponse coach à structure" } }); expect(response.status()).toBe(201); expect((await response.json()).data.ownerRole).toBe("club");
  const initiated = await request.post("/api/messages", { headers: coach, data: { structureEmail: email, body: "Échange démarré par le coach", coachId: "madison-seck" } }); expect(initiated.status()).toBe(201); expect((await initiated.json()).data.coachId).toBe("steven-fordant");
  expect((await request.post("/api/messages", { headers: coach, data: { structureEmail: `unknown-${email}`, body: "Non affilié" } })).status()).toBe(403);
  for (const headers of [athlete, other]) {
    const inbox = await request.get("/api/messages", { headers }); expect(inbox.status()).toBe(200);
    expect((await inbox.json()).data.some((row: { id: string }) => row.id === message.id)).toBe(false);
    expect((await request.post("/api/messages", { headers, data: { replyToId: message.id, body: "Intrusion" } })).status()).toBe(403);
  }
  const inbox = await request.get("/api/messages", { headers: club }); expect((await inbox.json()).data.filter((row: { ownerRole?: string }) => row.ownerRole === "club").length).toBeGreaterThanOrEqual(3);
});

test("les comptes structure et coach démarrent et répondent via leurs contacts actifs", async ({ page, request }, info) => {
  const ip = info.project.name.includes("mobile") ? "192.0.2.83" : "192.0.2.82";
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });
  const login = async (role: string) => {
    const response = await request.post("/api/auth/sign-in", { data: { email: `${role}@example.com`, role, password: "demo-password" } }); expect(response.status()).toBe(200); return response.headers()["set-cookie"].split(";")[0];
  };
  const club = await login("club"), coach = await login("coach");
  async function account(cookie: string, role: string) {
    const [name,...value] = cookie.split("="); await page.context().addCookies([{ name, value: value.join("="), url: "http://127.0.0.1:3001" }]);
    await page.goto(`/compte?mode=${role}`);
    await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);
    const button = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true }); if (await button.isVisible()) await button.click();
    await expect(page.locator("[data-message-inbox]")).toHaveAttribute("aria-busy", "false");
  }
  await account(club, "club"); const inbox = page.locator("[data-message-inbox]");
  await expect(inbox.getByRole("combobox", { name: "Contacter un coach affilié" }).locator('option[value="steven-fordant"]')).toHaveCount(1);
  await inbox.getByRole("combobox", { name: "Contacter un coach affilié" }).selectOption("steven-fordant");
  await inbox.getByRole("textbox", { name: "Votre réponse", exact: true }).fill(`Message structure UI ${info.project.name}`);
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    if (info.project.name === "desktop-chromium" && [390,1440].includes(width)) await inbox.screenshot({ path: `../docs/assets/structures-messages-2026-10-17/club-${width}.png` });
  }
  await inbox.getByRole("button", { name: "Envoyer le message", exact: true }).click(); await expect(inbox.getByRole("status")).toContainText("Votre message a bien été envoyé.");
  await account(coach, "coach");
  const row = inbox.locator("article").filter({ hasText: `Message structure UI ${info.project.name}` });
  await expect(row).toBeVisible(); await row.getByRole("button", { name: "Répondre à ce message" }).click();
  await inbox.getByRole("button", { name: "Utiliser le modèle d’accueil" }).click();
  await expect(inbox.getByRole("textbox", { name: "Votre réponse", exact: true })).toHaveValue(/merci pour votre message/);
  await inbox.getByRole("button", { name: "Envoyer la réponse", exact: true }).click();
  await expect(inbox.getByRole("status")).toContainText("Votre réponse a bien été envoyée.");
  await account(club, "club"); await expect(inbox).toContainText("merci pour votre message");
});
