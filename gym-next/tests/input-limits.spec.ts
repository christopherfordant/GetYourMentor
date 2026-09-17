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
