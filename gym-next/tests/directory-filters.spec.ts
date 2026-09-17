import { expect, test } from "@playwright/test";

test("les filtres de sélection réduisent les résultats coachs", async ({ page }) => {
  await page.goto("/coachs?sport=basketball&city=Marseille");
  await expect(page.locator("[data-coach-results] .coach-result-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Filtres", exact: true }).click();
  await page.locator("[data-directory-filter-panel] select").nth(0).selectOption("femme");
  await expect(page.locator("[data-coach-results] .coach-result-card")).toHaveCount(1);
  await page.locator("[data-directory-filter-panel] label").filter({ hasText: "Disponibilité" }).locator("select").selectOption("morning");
  await expect(page.locator("[data-coach-results] .coach-result-card")).toHaveCount(1);
  await page.locator("[data-directory-filter-panel] input[type=checkbox]").check();
  await expect(page.locator("[data-coach-results] .coach-result-card")).toHaveCount(1);
});
