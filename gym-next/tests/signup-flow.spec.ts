import { expect, test } from "@playwright/test";

test("l'inscription crée une session sportif", async ({ page }) => {
  const email = `sportif-${Date.now()}@example.com`;

  await page.goto("/compte");
  await page.getByRole("button", { name: "Nouveau ? Inscription", exact: true }).click();
  const signupForm = page.locator('[data-account-create-form]');
  await signupForm.locator('input[name="firstName"]').fill("Alex");
  await signupForm.locator('input[name="lastName"]').fill("Martin");
  await signupForm.locator('input[name="phone"]').fill("0600000000");
  await signupForm.locator('input[name="email"]').fill(email);
  await signupForm.locator('input[name="emailConfirmation"]').fill(email);
  await signupForm.locator('input[name="password"]').fill("demo-pass-123");
  await signupForm.locator('input[name="passwordConfirmation"]').fill("demo-pass-123");
  await signupForm.locator('input[name="termsAccepted"]').check();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  const signupResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/auth/sign-up"));
  await page.getByRole("button", { name: "Un(e) sportif(ve)", exact: true }).click();
  const signupResponse = await signupResponsePromise;
  expect(signupResponse.status()).toBe(201);

  await expect(page.locator("[data-athlete-dashboard]")).toBeVisible();
});

test("l'inscription coach crée un profil coach dédié", async ({ page }) => {
  const email = `coach-${Date.now()}@example.com`;

  await page.goto("/compte");
  await page.getByRole("button", { name: "Nouveau ? Inscription", exact: true }).click();
  const signupForm = page.locator('[data-account-create-form]');
  await signupForm.locator('input[name="firstName"]').fill("Lina");
  await signupForm.locator('input[name="lastName"]').fill("Durand");
  await signupForm.locator('input[name="phone"]').fill("0600000001");
  await signupForm.locator('input[name="email"]').fill(email);
  await signupForm.locator('input[name="emailConfirmation"]').fill(email);
  await signupForm.locator('input[name="password"]').fill("coach-pass-123");
  await signupForm.locator('input[name="passwordConfirmation"]').fill("coach-pass-123");
  await signupForm.locator('input[name="termsAccepted"]').check();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  const signupResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/auth/sign-up"));
  await page.getByRole("button", { name: "Un(e) coach", exact: true }).click();
  const signupResponse = await signupResponsePromise;
  expect(signupResponse.status()).toBe(201);

  await expect(page.locator('[data-account-dashboard="coach"]')).toBeVisible();
  await expect(page.locator('[data-account-dashboard="coach"]')).toContainText("Lina Durand");
});
