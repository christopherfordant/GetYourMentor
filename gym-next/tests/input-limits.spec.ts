import { expect, test } from "@playwright/test";

test("les endpoints refusent un corps de requête excessif", async ({ request }) => {
  const data = JSON.stringify({ email: "a".repeat(17_000), password: "demo" });
  const response = await request.post("/api/auth/sign-in", {
    data,
    headers: {
      "content-type": "application/json",
      "content-length": String(Buffer.byteLength(data)),
    },
  });
  expect(response.status()).toBe(413);
});

test("le formulaire club borne aussi chaque champ multipart", async ({ request }) => {
  const response = await request.post("/api/clubs/leads", {
    multipart: {
      clubName: "a".repeat(513),
      managerName: "Camille Martin",
      email: "club@example.com",
    },
  });
  expect(response.status()).toBe(400);
});

test("le formulaire club refuse les types de fichiers non autorisés", async ({ request }) => {
  const response = await request.post("/api/clubs/leads", {
    multipart: {
      clubName: "Club test",
      managerName: "Camille Martin",
      email: "club@example.com",
      identity: { name: "identite.txt", mimeType: "text/plain", buffer: Buffer.from("identity") },
    },
  });
  expect(response.status()).toBe(400);
});

test("les inscriptions sont limitées par adresse client", async ({ request }) => {
  let lastStatus = 0;
  for (let attempt = 0; attempt < 61; attempt += 1) {
    const response = await request.post("/api/auth/sign-up", {
      data: {},
      headers: { "x-forwarded-for": "rate-limit-test-client" },
    });
    lastStatus = response.status();
  }
  expect(lastStatus).toBe(429);
});
