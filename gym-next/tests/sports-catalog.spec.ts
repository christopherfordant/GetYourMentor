import { expect, test } from "@playwright/test";

test("le catalogue visible respecte les quatre sports du MVP", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Football", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Basketball", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Fitness", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sports de combat", exact: true })).toBeVisible();
  await expect(page.getByText("Métiers de la forme", { exact: true })).toHaveCount(0);

  await page.goto("/recherche?sport=metiers-de-la-forme");
  await expect(page.locator("[data-sport-title]")).toContainText("coach fitness");

  const coaches = await page.request.get("/api/coaches?sport=metiers-de-la-forme");
  expect(coaches.ok()).toBeTruthy();
  const profiles = await coaches.json();
  expect(profiles.every((profile: { sport: string }) => profile.sport === "fitness")).toBeTruthy();
});
