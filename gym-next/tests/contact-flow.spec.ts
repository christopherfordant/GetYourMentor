import { expect, test } from "@playwright/test";

test("un sportif connecté peut contacter un coach", async ({ page, request }) => {
  const anonymous = await request.post("/api/messages", {
    data: { recipientName: "Steven Fordant", body: "Bonjour" },
  });
  expect(anonymous.status()).toBe(401);

  await page.goto("/compte", { waitUntil: "networkidle" });
  await page.locator("#account-email").fill("sportif@example.com");
  await page.locator("#account-password").fill("demo-password");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await page.goto("/coach?sport=basketball&city=Marseille&coach=Steven%20Fordant", { waitUntil: "networkidle" });
  await page.locator('[data-contact-form] textarea').fill("Bonjour, avez-vous un créneau cette semaine ?");
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(page.locator('[data-contact-success]')).toHaveText("Votre message a bien été envoyé.");
  await page.goto("/compte", { waitUntil: "networkidle" });
  await expect(page.locator("[data-message-inbox]")).toContainText("À Steven Fordant");
  await expect(page.locator("[data-message-inbox]")).toContainText("créneau cette semaine");
});
