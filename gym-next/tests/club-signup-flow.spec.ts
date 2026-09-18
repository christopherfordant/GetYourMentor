import { expect, test } from "@playwright/test";

test("une structure peut transmettre une demande d'affiliation", async ({ page }) => {
  await page.goto("/inscription-club");
  await page.locator('input[name="clubName"]').fill("Club Démonstration");
  await page.locator('input[name="managerName"]').fill("Camille Martin");
  await page.locator('input[name="email"]').fill(`club-${Date.now()}@example.com`);
  await page.locator('input[name="phone"]').fill("0600000000");
  await page.locator('input[name="addressLabel"]').fill("Marseille 8e");
  await page.locator('input[name="latitude"]').evaluate((input) => { (input as HTMLInputElement).value = "43.2500"; });
  await page.locator('input[name="longitude"]').evaluate((input) => { (input as HTMLInputElement).value = "5.3900"; });
  await page.locator('input[name="iban"]').fill("FR761234567890");
  await page.locator('input[name="logo"]').setInputFiles({ name: "logo-club.png", mimeType: "image/png", buffer: Buffer.from("logo") });
  await page.locator('input[name="identity"]').setInputFiles({ name: "identite.pdf", mimeType: "application/pdf", buffer: Buffer.from("identity") });

  const responsePromise = page.waitForResponse((response) => response.url().endsWith("/api/clubs/leads"));
  await page.getByRole("button", { name: "Affiliez des coachs", exact: true }).click();
  const response = await responsePromise;

  expect(response.status()).toBe(201);
  expect((await response.json()).data).toMatchObject({ addressLabel: "Marseille 8e", latitude: 43.25, longitude: 5.39, logoFileName: "logo-club.png", identityFileName: "identite.pdf", ibanLast4: "7890" });
  await expect(page.locator("[data-club-signup-status]")).toContainText("demande a bien été transmise");
});
