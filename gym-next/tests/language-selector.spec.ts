import { expect, test } from "@playwright/test";

test("le sélecteur de langue propose le français et l’anglais", async ({ page }) => {
  await page.goto("/");
  const selector = page.getByLabel("Langue");
  await expect(selector).toHaveValue("fr");
  await selector.selectOption("en");
  await expect(selector).toHaveValue("en");
  await page.reload();
  await expect(page.getByLabel("Langue")).toHaveValue("en");
});
