import { expect, test } from "@playwright/test";

test("réponses : identité serveur, isolation, répétition et réservation étrangère", async ({ request }) => {
  const signIn = async (role: string, email = `${role}@example.com`) => {
    const response = await request.post("/api/auth/sign-in", { data: { role, email, password: "demo-password" } });
    expect(response.status()).toBe(200); return { Cookie: response.headers()["set-cookie"].split(";")[0] };
  };
  const athlete = await signIn("sportif"), other = await signIn("sportif", "foreign-message@example.com"), coach = await signIn("coach"), club = await signIn("club"), admin = await signIn("admin");
  const signed = await request.post("/api/auth/sign-up", { data: { email: `foreign-coach-${Date.now()}@example.com`, password: "demo-password", role: "coach", firstName: "Autre", lastName: `Fictif${Date.now()}`, phone: "0600000000", termsAccepted: true } });
  expect(signed.status()).toBe(201); const otherCoach = { Cookie: signed.headers()["set-cookie"].split(";")[0] };
  const firstInput = { recipientName: "steven-fordant", body: "Question fictive pour échange", senderEmail: "forged@example.com", authorRole: "coach", coachId: "forged", requestId: `first-${Date.now()}` };
  const first = await request.post("/api/messages", { headers: athlete, data: firstInput });
  expect(first.status()).toBe(201); const original = (await first.json()).data;
  expect(original).toMatchObject({ senderEmail: "sportif@example.com", authorRole: "sportif", coachId: "steven-fordant" });
  const repeatFirst = await request.post("/api/messages", { headers: athlete, data: firstInput }); expect(repeatFirst.status()).toBe(201); expect((await repeatFirst.json()).data.id).toBe(original.id);
  for (const headers of [other, otherCoach]) {
    const response = await request.get("/api/messages?recipientName=Steven%20Fordant", { headers });
    expect(response.status()).toBe(200); expect((await response.json()).data.some((row: { id: string }) => row.id === original.id)).toBe(false);
    expect((await request.post("/api/messages", { headers, data: { replyToId: original.id, body: "Intrusion" } })).status()).toBe(403);
  }
  expect((await request.get("/api/messages", { headers: club })).status()).toBe(403);
  for (const headers of [club, admin, { Cookie: "" }]) expect((await request.post("/api/messages", { headers, data: { replyToId: original.id, body: "Intrusion" } })).status()).toBe(401);
  const reply = { replyToId: original.id, body: "Réponse fictive du coach", requestId: `repeat-${Date.now()}` };
  const answers = await Promise.all([request.post("/api/messages", { headers: coach, data: reply }), request.post("/api/messages", { headers: coach, data: reply })]);
  for (const answer of answers) expect(answer.status()).toBe(201);
  const [a,b] = await Promise.all(answers.map(answer => answer.json())); expect(a.data.id).toBe(b.data.id); expect(a.data.authorRole).toBe("coach");
  expect((await request.post("/api/messages", { headers: coach, data: { ...reply, body: "Autre contenu" } })).status()).toBe(409);
  const received = await request.get("/api/messages", { headers: athlete }); expect(received.headers()["cache-control"]).toBe("no-store");
  expect((await received.json()).data.filter((row: { id: string }) => row.id === a.data.id)).toHaveLength(1);
  expect((await request.post("/api/messages", { headers: athlete, data: { replyToId: a.data.id, body: "Merci" } })).status()).toBe(201);
  expect((await request.post("/api/messages", { headers: coach, data: { body: "Sans conversation" } })).status()).toBe(400);
  expect((await request.post("/api/messages", { headers: athlete, data: { recipientName: "steven-fordant", reservationId: "unknown-reservation", body: "Lien invalide" } })).status()).toBe(403);
  expect((await request.post("/api/messages", { headers: coach, data: { replyToId: original.id, body: " ", requestId: "invalid" } })).status()).toBe(400);
});

test("le coach répond dans son compte et le sportif retrouve la réponse", async ({ page, request }, info) => {
  const signIn = async (role: string) => {
    const response = await request.post("/api/auth/sign-in", { data: { email: `${role}@example.com`, role, password: "demo-password" } });
    expect(response.status()).toBe(200); return response.headers()["set-cookie"].split(";")[0];
  };
  const athlete = await signIn("sportif"), coach = await signIn("coach");
  const sent = await request.post("/api/messages", { headers: { Cookie: athlete }, data: { recipientName: "steven-fordant", body: `Question UI ${info.project.name}` } });
  expect(sent.status()).toBe(201); const original = (await sent.json()).data;
  async function account(cookie: string, role: string) {
    const [name,...value] = cookie.split("="); await page.context().addCookies([{ name, value: value.join("="), url: "http://127.0.0.1:3001" }]);
    await page.goto(`/compte?mode=${role}`);
    await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);
    const cookies = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true }); if (await cookies.isVisible()) await cookies.click();
    await expect(page.locator("[data-message-inbox]")).toHaveAttribute("aria-busy", "false");
  }
  await account(coach, "coach");
  const inbox = page.locator("[data-message-inbox]");
  await inbox.locator(`[data-message="${original.id}"]`).getByRole("button", { name: "Répondre à ce message" }).click();
  await inbox.getByRole("textbox", { name: "Votre réponse", exact: true }).fill(`Réponse UI ${info.project.name}`);
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const field = inbox.getByRole("textbox", { name: "Votre réponse", exact: true });
    await field.evaluate(element => { element.scrollIntoView({ block: "center" }); (element as HTMLElement).focus(); });
    await expect.poll(() => field.evaluate(element => { const box = element.getBoundingClientRect(); return element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)); })).toBe(true);
    if (info.project.name === "desktop-chromium" && [390,1440].includes(width)) await inbox.screenshot({ path: `../docs/assets/messages-demo-2026-10-17/coach-${width}.png` });
  }
  await inbox.getByRole("button", { name: "Envoyer la réponse", exact: true }).click();
  await expect(inbox.getByRole("status")).toHaveText("Votre réponse a bien été envoyée.");
  await account(athlete, "sportif");
  await expect(inbox).toContainText(`Réponse UI ${info.project.name}`);
  await expect(inbox).toContainText("Réponse de Steven Fordant");
  await inbox.getByLabel("Rechercher dans mes échanges").fill("aucun-resultat-fictif");
  await expect(inbox).toContainText("Aucun échange ne correspond");
});

test("un envoi interrompu libère le formulaire sans annoncer un succès", async ({ page, request }) => {
  const signed = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", role: "sportif", password: "demo-password" } });
  const [name,...value] = signed.headers()["set-cookie"].split(";")[0].split("="); await page.context().addCookies([{ name, value: value.join("="), url: "http://127.0.0.1:3001" }]);
  await page.route("**/api/messages", route => route.request().method() === "POST" ? route.abort("failed") : route.continue());
  await page.goto("/coach?coach=steven-fordant");
  const cookies = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true }); if (await cookies.isVisible()) await cookies.click();
  const contact = page.locator("[data-contact-form]");
  await contact.getByLabel("Votre message", { exact: true }).fill("Question fictive interrompue");
  await contact.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(contact.getByRole("alert")).toBeVisible();
  await expect(contact.getByRole("button", { name: "Envoyer le message" })).toBeEnabled();
  await expect(contact.locator("[data-contact-success]")).toHaveCount(0);
});

test("une panne de messagerie reste visible et peut être réessayée", async ({ page, request }) => {
  const response = await request.post("/api/auth/sign-in", { data: { email: "coach@example.com", role: "coach", password: "demo-password" } });
  const [name,...value] = response.headers()["set-cookie"].split(";")[0].split("="); await page.context().addCookies([{ name, value: value.join("="), url: "http://127.0.0.1:3001" }]);
  let failed = true;
  await page.route("**/api/messages*", route => route.fulfill({ status: failed ? 503 : 200, contentType: "application/json", body: JSON.stringify(failed ? { error: "Indisponible" } : { data: [], canReply: true }) }));
  await page.goto("/compte?mode=coach");
  const inbox = page.locator("[data-message-inbox]"); await expect(inbox.getByRole("alert")).toContainText("Messages indisponibles");
  await expect(inbox.locator("[data-message-empty]")).toHaveCount(0);
  failed = false; await inbox.getByRole("button", { name: "Actualiser les messages" }).click();
  await expect(inbox.locator("[data-message-empty]")).toBeVisible();
});
