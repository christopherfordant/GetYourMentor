import { expect, test } from "@playwright/test";

async function openHome(page: import("@playwright/test").Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);
  const refuse = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true });
  if (await refuse.isVisible()) await refuse.click();
}

test("les actions des profils ouvrent les vrais parcours sans créer de données", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", request => { if (request.method() === "POST") writes.push(request.url()); });
  await openHome(page);
  await page.locator('[data-action="find-session"]').click();
  await expect(page).toHaveURL(/\/recherche\?sport=football$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("football");
  await openHome(page);
  await page.getByRole("tab", { name: "Coach", exact: true }).click();
  await page.locator('[data-action="coach-account"]').click();
  await expect(page).toHaveURL(/\/compte\?mode=coach$/);
  await expect(page.locator('[data-account-login]')).toBeVisible();
  await openHome(page);
  await page.getByRole("tab", { name: "Structure", exact: true }).click();
  await page.locator('[data-action="club-account"]').click();
  await expect(page).toHaveURL(/\/compte\?mode=club$/);
  await expect(page.locator('[data-account-login]')).toBeVisible();
  await openHome(page);
  await page.getByRole("tab", { name: "Structure", exact: true }).click();
  await page.locator('[data-action="club-signup"]').click();
  await expect(page).toHaveURL(/\/inscription-club$/);
  await expect(page.locator('input[name="clubName"]')).toBeVisible();
  expect(writes).toEqual([]);
});

test("offres à venir et suivi expliquent leurs limites avec une alternative réelle", async ({ page }) => {
  await openHome(page);
  for (const key of ["coach", "club", "suivi"]) {
    await page.locator(`[data-detail="${key}"]`).filter({ visible: true }).first().click();
    const dialog = page.locator("#details");
    await expect(dialog).toBeVisible();
    await expect(page.locator("#detail-text")).toContainText(/pas encore disponible/);
    const action = page.locator("[data-detail-action]");
    const href = await action.getAttribute("href");
    await action.click();
    await expect(page).toHaveURL(new RegExp(`${href?.replace(/[?]/g, "\\?")}$`));
    await expect(page.locator("main")).toBeVisible();
    await openHome(page);
  }
});

test("consentement accessible et documents explicitement provisoires", async ({ page }) => {
  for (const slug of ["cgu", "cgv", "confidentialite", "mentions-legales", "cookies", "accessibilite"]) {
    const response = await page.goto(`/legal/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toContainText("Informations provisoires");
    await expect(page.locator("main")).not.toContainText(/porteur du projet|responsable juridique|doivent être rédigées/);
  }
  const refuse = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true });
  if (await refuse.isVisible()) await refuse.click();
  const preferences = page.getByRole("button", { name: "Préférences cookies", exact: true });
  await preferences.click();
  await expect(page.locator(".cookie-consent-banner")).toBeVisible();
  for (const slug of ["introuvable", "toString", "__proto__"]) {
    const response = await page.goto(`/legal/${slug}`);
    expect(response?.status()).toBe(404);
  }
});
