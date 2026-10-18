import { createMessage, listMessages, type Message } from "../lib/messages";
import { test, expect, type APIRequestContext } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { MAX_MESSAGE_FILE_BYTES, MAX_MESSAGE_REQUEST_BYTES } from "../lib/message-attachment-contract";
import { boundedMessageJson, parseMessageFile, getMessageFile, putMessageFile, deleteUnusedMessageFile } from "../lib/message-attachment-server";
const txt = Buffer.from("Fichier synthétique UTF-8 : séance et objectifs.\n");
const attachment = (name = "programme-demo.txt", bytes = txt) => ({ name, type: "text/plain", base64: bytes.toString("base64") });
async function login(request: APIRequestContext, role: string, email: string) {
 const signed = await request.post("/api/auth/sign-in", { data: { role, email, password: "demo-password" } });
 expect(signed.status()).toBe(200); return { Cookie: signed.headers()["set-cookie"].split(";")[0] };
}

test("actual stream limit, UTF-8 validation, separate byte storage, missing/corrupt data and write failure", async () => {
 const previous = process.env.GETYOURMENTOR_ALLOW_DEMO, nodeEnv = process.env.NODE_ENV;
 process.env.GETYOURMENTOR_ALLOW_DEMO = "true"; Reflect.set(process.env, "NODE_ENV", "test");
 try {
   const request = new Request("http://127.0.0.1/", { method: "POST", body: new ReadableStream({ start(c) { c.enqueue(new Uint8Array(MAX_MESSAGE_REQUEST_BYTES + 1)); c.close(); } }), duplex: "half" } as RequestInit);
   await expect(boundedMessageJson(request)).rejects.toMatchObject({ status: 413 });
   expect(parseMessageFile(attachment("limit.txt", Buffer.alloc(MAX_MESSAGE_FILE_BYTES, 97))).meta.size).toBe(MAX_MESSAGE_FILE_BYTES);
   const file = parseMessageFile(attachment());
   await expect(getMessageFile(file.meta)).rejects.toMatchObject({ status: 404 });
   await putMessageFile(file.meta, file.bytes);
   expect(Buffer.from(await getMessageFile(file.meta))).toEqual(txt);
   await expect(getMessageFile({ ...file.meta, sha256: "0".repeat(64) })).rejects.toMatchObject({ status: 503 });
   await deleteUnusedMessageFile(file.meta.id);
   await expect(getMessageFile(file.meta)).rejects.toMatchObject({ status: 404 });
   for (const input of [attachment("bad.pdf"), attachment("disguised.txt", Buffer.from("%PDF-1.4")), attachment("active.txt", Buffer.from("<script>alert(1)</script>")), attachment("../bad.txt"), attachment("a".repeat(121)+".txt"), attachment("bad.txt", Buffer.from([0xff])), attachment("zero.txt", Buffer.from([0])), attachment("empty.txt", Buffer.alloc(0)), attachment("big.txt", Buffer.alloc(MAX_MESSAGE_FILE_BYTES + 1)), { ...attachment(), type: "text/html" }]) expect(() => parseMessageFile(input)).toThrow();
   const draft: Message = { id: `message-unit-${Date.now()}`, senderEmail: "unit-file@example.com", recipientName: "Steven Fordant", coachId: "steven-fordant", authorRole: "sportif", body: "Message synthétique", requestId: `unit-${Date.now()}`, createdAt: new Date().toISOString() };
   const first = parseMessageFile(attachment()), second = parseMessageFile(attachment());
   const saves = await Promise.all([createMessage(draft, first), createMessage({ ...draft, id: draft.id+"-second" }, second)]);
   expect(saves[0].id).toBe(saves[1].id);
   const unused = saves[0].attachment!.id === first.meta.id ? second : first;
   await expect(getMessageFile(unused.meta)).rejects.toMatchObject({ status: 404 });
   const state = globalThis as typeof globalThis & { gymDemoMessageFiles: Map<string, Uint8Array> };
   const normalSet = state.gymDemoMessageFiles.set;
   state.gymDemoMessageFiles.set = () => { throw new Error("Synthetic storage failure"); };
   try {
     await expect(createMessage({ ...draft, id: "unit-failed", requestId: `failed-${Date.now()}` }, file)).rejects.toThrow("Synthetic storage failure");
     expect((await listMessages()).some(m => m.id === "unit-failed")).toBe(false);
   }
   finally { state.gymDemoMessageFiles.set = normalSet; }
   await expect(getMessageFile(file.meta)).rejects.toMatchObject({ status: 404 });
 } finally { if (previous === undefined) delete process.env.GETYOURMENTOR_ALLOW_DEMO; else process.env.GETYOURMENTOR_ALLOW_DEMO = previous; nodeEnv === undefined ? Reflect.deleteProperty(process.env, "NODE_ENV") : Reflect.set(process.env, "NODE_ENV", nodeEnv); }
});

test("real upload/download bytes, isolated permissions, concurrent repetition and changed payload conflict", async ({ request }) => {
 const stamp = Date.now(); const athlete = await login(request, "sportif", `file-${stamp}@example.com`);
 const coach = await login(request, "coach", "coach@example.com");
 const input = { recipientName: "steven-fordant", body: "Message fictif et fichier", requestId: `file-${stamp}`, attachment: attachment() };
 const responses = await Promise.all([request.post("/api/messages", { headers: athlete, data: input }), request.post("/api/messages", { headers: athlete, data: input })]);
 for (const r of responses) expect(r.status()).toBe(201);
 const saved = (await responses[0].json()).data; expect((await responses[1].json()).data.id).toBe(saved.id);
 expect(saved.attachment).toMatchObject({ name: "programme-demo.txt", size: txt.length });
 expect(JSON.stringify(saved)).not.toContain(txt.toString("base64"));
 const url = `/api/messages/${saved.id}/attachment`;
 for (const headers of [athlete, coach]) { const response = await request.get(url, { headers }); expect(response.status()).toBe(200); expect(await response.body()).toEqual(txt); expect(response.headers()["cache-control"]).toBe("private, no-store"); expect(response.headers()["x-content-type-options"]).toBe("nosniff"); expect(response.headers()["content-disposition"]).toContain("attachment;"); }
 const other = await login(request, "sportif", `other-file-${stamp}@example.com`);
 const foreignSignup = await request.post("/api/auth/sign-up", { data: { role: "coach", email: `foreign-file-coach-${stamp}@example.com`, password: "demo-password", firstName: "Coach", lastName: `Fictif${stamp}`, phone: "0600000000", termsAccepted: true } });
 expect(foreignSignup.status()).toBe(201);
 const otherCoach = { Cookie: foreignSignup.headers()["set-cookie"].split(";")[0] };
 const club = await login(request, "club", `file-${stamp}@example.com`);
 for (const headers of [other, otherCoach, club, await login(request, "admin", "admin@example.com")]) expect((await request.get(url, { headers })).status()).toBe(404);
 for (const headers of [other, otherCoach, club]) {
   const foreignReply = await request.post("/api/messages", { headers, data: { replyToId: saved.id, requestId: `foreign-${stamp}`, body: "Intrusion synthétique refusée", attachment: attachment() } });
   expect(foreignReply.status()).toBe(403);
 }
 expect((await request.get(url, { headers: { Cookie: "" } })).status()).toBe(401);
 expect((await request.get("/api/messages/message-absent/attachment", { headers: athlete })).status()).toBe(404);
 for (const change of [{ attachment: attachment("autre.txt") }, { attachment: attachment("programme-demo.txt", Buffer.from("Autre texte")) }, { body: "Autre message" }]) expect((await request.post("/api/messages", { headers: athlete, data: { ...input, ...change } })).status()).toBe(409);
 const list = (await (await request.get("/api/messages", { headers: athlete })).json()).data;
 expect(list.filter((m: { requestId: string }) => m.requestId === input.requestId)).toHaveLength(1);
 for (const bad of [attachment("test.pdf"), attachment("../test.txt"), attachment("zero.txt", Buffer.alloc(0)), attachment("binary.txt", Buffer.from([0xff,0])), { ...attachment(), type: "text/html" }]) expect((await request.post("/api/messages", { headers: athlete, data: { ...input, requestId: `invalid-${Math.random()}`, attachment: bad } })).status()).toBe(415);
});

async function openCoach(page: import("@playwright/test").Page, request: APIRequestContext) {
 const headers = await login(request, "coach", "coach@example.com"); const raw = headers.Cookie, i = raw.indexOf("=");
 await page.context().addCookies([{ name: raw.slice(0,i), value: raw.slice(i+1), url: "http://127.0.0.1:3001" }]);
 await page.goto("/compte?mode=coach");
 await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);
 const refuse = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true }); if (await refuse.isVisible()) await refuse.click();
 await expect(page.locator("[data-message-inbox]")).toHaveAttribute("aria-busy", "false");
}

test("UI send, genuine lost response recovery, private download, safe name rendering and responsive", async ({ page, request }, info) => {
 const athlete = await login(request, "sportif", `ui-file-${Date.now()}@example.com`);
 const parent = (await (await request.post("/api/messages", { headers: athlete, data: { recipientName: "steven-fordant", body: "Question fictive avec réponse attendue" } })).json()).data;
 await openCoach(page, request);
 const inbox = page.locator("[data-message-inbox]");
 await inbox.locator(`[data-message="${parent.id}"]`).getByRole("button", { name: "Répondre à ce message" }).click();
 const form = inbox.getByRole("form", { name: "Répondre au message" }), body = form.getByRole("textbox", { name: "Votre réponse", exact: true });
 await body.fill("Réponse fictive avec pièce jointe");
 const file = form.getByLabel("Fichier texte (.txt)", { exact: true });
 await file.setInputFiles({ name: "note-demo.txt", mimeType: "text/plain", buffer: txt });
 await expect(form.getByRole("button", { name: "Retirer le fichier" })).toBeVisible();
 await form.getByRole("button", { name: "Retirer le fichier" }).click();
 await expect(form.getByRole("button", { name: "Retirer le fichier" })).toHaveCount(0);
 await file.setInputFiles({ name: "note-demo.txt", mimeType: "text/plain", buffer: txt });
 await expect(form.getByRole("button", { name: "Retirer le fichier" })).toBeVisible();
 for (const width of [320,390,768,1440]) { await page.setViewportSize({ width, height: 2200 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true); if (info.project.name === "desktop-chromium" && [390,1440].includes(width)) await form.screenshot({ path: `../docs/assets/message-file-flow-2026-10-19/form-${width}.png` }); }
 let posts = 0, savedId = "";
 await page.route("**/api/messages", async route => { if (route.request().method() !== "POST") return route.continue(); posts++; const result = await route.fetch(); expect(result.status()).toBe(201); const saved = (await result.json()).data; savedId = saved.id; const check = await request.get(`/api/messages/${saved.id}/attachment`, { headers: athlete }); expect(await check.body()).toEqual(txt); await route.abort(); });
 const send = form.getByRole("button", { name: "Envoyer la réponse", exact: true });
 await send.focus(); await page.keyboard.press("Enter");
 await expect(inbox.getByRole("status")).toHaveText("Résultat de l’envoi non confirmé. Actualisez les messages avant toute nouvelle tentative.");
 await expect(body).toHaveValue("Réponse fictive avec pièce jointe"); await expect(body).toBeDisabled(); await expect(file).toBeDisabled(); expect(posts).toBe(1);
 await inbox.getByRole("button", { name: "Actualiser les messages" }).click();
 await expect(inbox).toHaveAttribute("aria-busy", "false");
 await expect(inbox.getByRole("status").filter({ hasText: "Votre réponse a bien été envoyée." })).toBeVisible();
 await expect(inbox.getByRole("status")).toHaveCount(1); expect(posts).toBe(1);
 const message = inbox.locator(`[data-message="${savedId}"]`);
 const download = message.getByRole("button", { name: "Télécharger la pièce jointe" });
 const event = page.waitForEvent("download"); await download.click(); const result = await event;
 expect(await readFile((await result.path())!)).toEqual(txt);
 await page.route("**/attachment", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Fichier absent" }) }));
 await download.click(); await expect(message.getByRole("alert")).toHaveText("Fichier indisponible. Réessayez ultérieurement.");
});


test("rejected format preserves draft; failed refresh cannot unlock uncertain send; explicit same-key retry", async ({ page, request }) => {
 const athlete = await login(request, "sportif", `retry-file-${Date.now()}@example.com`);
 const parent = (await (await request.post("/api/messages", { headers: athlete, data: { recipientName: "steven-fordant", body: "Demande fictive pour reprise" } })).json()).data;
 await openCoach(page, request);
 const inbox = page.locator("[data-message-inbox]"); await inbox.locator(`[data-message="${parent.id}"]`).getByRole("button", { name: "Répondre à ce message" }).click();
 const form = inbox.getByRole("form", { name: "Répondre au message" }), body = form.getByRole("textbox", { name: "Votre réponse", exact: true });
 await body.fill("Brouillon fictif conservé");
 const file = form.getByLabel("Fichier texte (.txt)", { exact: true }); await file.setInputFiles({ name: "reprise.txt", mimeType: "text/plain", buffer: txt });
 await expect(form.getByRole("button", { name: "Retirer le fichier" })).toBeVisible();
 let posts = 0, key = "", reads = 0;
 await page.route("**/api/messages**", async route => {
   if (new URL(route.request().url()).pathname !== "/api/messages") return route.continue();
   if (route.request().method() === "POST") {
     posts++; const data = route.request().postDataJSON();
     if (posts === 1) { key = data.requestId; return route.fulfill({ status: 415, contentType: "application/json", body: JSON.stringify({ error: "Format refusé pour ce test" }) }); }
     expect(data.requestId).toBe(key);
     if (posts === 2) return route.abort();
     return route.fulfill({ response: await route.fetch() });
   }
   reads++; if (reads === 1) return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Panne fictive" }) });
   return route.continue();
 });
 const send = form.getByRole("button", { name: "Envoyer la réponse", exact: true }); await send.click();
 await expect(inbox.getByRole("status")).toHaveText("Format refusé pour ce test"); await expect(body).toBeEnabled(); await expect(body).toHaveValue("Brouillon fictif conservé");
 await expect(form.getByRole("button", { name: "Retirer le fichier" })).toBeVisible();
 await send.click(); await expect(inbox.getByRole("status")).toHaveText("Résultat de l’envoi non confirmé. Actualisez les messages avant toute nouvelle tentative."); await expect(send).toBeDisabled();
 await inbox.getByRole("button", { name: "Actualiser les messages" }).click(); await expect(inbox.getByRole("alert")).toContainText("Messages indisponibles"); await expect(send).toBeDisabled(); await expect(body).toHaveValue("Brouillon fictif conservé");
 await inbox.getByRole("button", { name: "Actualiser les messages" }).click(); await expect(inbox.getByRole("status").filter({ hasText: "Envoi non retrouvé." })).toBeVisible(); await expect(send).toBeEnabled(); await expect(body).toBeDisabled();
 await send.click(); await expect(inbox.getByRole("status").filter({ hasText: "Votre réponse a bien été envoyée." })).toBeVisible(); expect(posts).toBe(3);
 const saved = (await (await request.get("/api/messages", { headers: athlete })).json()).data.filter((m: { requestId?: string }) => m.requestId === key);
 expect(saved).toHaveLength(1); expect(await (await request.get(`/api/messages/${saved[0].id}/attachment`, { headers: athlete })).body()).toEqual(txt);
});
