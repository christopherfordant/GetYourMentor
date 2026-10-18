import { expect, test, type APIRequestContext } from "@playwright/test";

async function signIn(request: APIRequestContext, role: string, email: string) {
  const response = await request.post("/api/auth/sign-in", { data: { role, email, password: "demo-password" } });
  expect(response.status()).toBe(200);
  return { Cookie: response.headers()["set-cookie"].split(";")[0] };
}

// Real local endpoints, synthetic data: these tests validate refusal, not uploading.
test("JSON attachment intent is explicitly refused without a partial message or consumed retry key", async ({ request }) => {
  const stamp = `${Date.now()}`;
  const headers = await signIn(request, "sportif", `attachment-${stamp}@example.com`);
  const initial = (await (await request.get("/api/messages", { headers })).json()).data;
  const input = { recipientName: "steven-fordant", body: "Message fictif avec fichier non envoyé", requestId: `attachment-${stamp}` };
  for (const field of ["attachment", "attachments", "file", "files"]) {
    for (const value of [null, [], { name: "fictif.pdf", type: "application/pdf", data: "JVBERi0=" }]) {
      const response = await request.post("/api/messages", { headers, data: { ...input, [field]: value } });
      expect(response.status()).toBe(415);
      expect(await response.json()).toMatchObject({ code: "MESSAGE_ATTACHMENTS_UNAVAILABLE" });
    }
  }
  const unchanged = await request.get("/api/messages", { headers });
  expect((await unchanged.json()).data).toEqual(initial);
  const oversized = await request.post("/api/messages", { headers, data: { ...input, attachment: { name: "fictif.pdf", data: "A".repeat(40000) } } });
  expect(oversized.status()).toBe(413);
  const plain = await request.post("/api/messages", { headers, data: input });
  expect(plain.status()).toBe(201);
  const saved = (await plain.json()).data;
  const repeated = await request.post("/api/messages", { headers, data: input });
  expect(repeated.status()).toBe(201);
  expect((await repeated.json()).data.id).toBe(saved.id);
  const rows = (await (await request.get("/api/messages", { headers })).json()).data;
  expect(rows.filter((row: { id: string }) => row.id === saved.id)).toHaveLength(1);
});

test("multipart upload is rejected; authorization still precedes format checks", async ({ request }) => {
  const stamp = `${Date.now()}`;
  const headers = await signIn(request, "sportif", `multipart-${stamp}@example.com`);
  const payload = { body: "Fichier synthétique", recipientName: "steven-fordant", file: { name: "fictif.txt", mimeType: "text/plain", buffer: Buffer.from("fichier synthétique") } };
  const rejected = await request.post("/api/messages", { headers, multipart: payload });
  expect(rejected.status()).toBe(415);
  expect(await rejected.json()).toMatchObject({ code: "MESSAGE_ATTACHMENTS_UNAVAILABLE" });
  expect((await (await request.get("/api/messages", { headers })).json()).data).toHaveLength(0);
  for (const forbidden of [{ Cookie: "" }, await signIn(request, "admin", "admin@example.com")]) {
    const result = await request.post("/api/messages", { headers: forbidden, multipart: payload });
    expect(result.status()).toBe(401);
  }
});

test("coach replies containing attachments never create a text-only reply", async ({ request }) => {
  const headers = await signIn(request, "sportif", `parent-${Date.now()}@example.com`);
  const parent = await request.post("/api/messages", { headers, data: { recipientName: "steven-fordant", body: "Question synthétique" } });
  expect(parent.status()).toBe(201);
  const id = (await parent.json()).data.id;
  const coach = await signIn(request, "coach", "coach@example.com");
  const response = await request.post("/api/messages", { headers: coach, data: { replyToId: id, body: "Réponse synthétique non envoyée", attachments: [{ name: "fictif.pdf" }] } });
  expect(response.status()).toBe(415);
  const read = await request.get("/api/messages", { headers });
  expect((await read.json()).data.map((row: { id: string }) => row.id)).toEqual([id]);
});
