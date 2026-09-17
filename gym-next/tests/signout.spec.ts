import { expect, test } from "@playwright/test";

test("la déconnexion invalide la session active", async ({ request }) => {
  const signUp = await request.post("/api/auth/sign-up", {
    data: {
      email: `signout-${Date.now()}@example.com`,
      password: "password123",
      role: "sportif",
      firstName: "Test",
      lastName: "Signout",
      phone: "0600000000",
      termsAccepted: true,
    },
  });
  expect(signUp.status()).toBe(201);

  const signOut = await request.post("/api/auth/sign-out");
  expect(signOut.ok()).toBeTruthy();

  const messages = await request.get("/api/messages");
  expect(messages.status()).toBe(401);
});
