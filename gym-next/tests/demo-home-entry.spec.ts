import { expect, test } from "@playwright/test";
import { getDemoSessionConfig } from "../lib/demo-recruiter-session";

test("l’accueil propose le parcours recruteur uniquement lorsque la démo est configurée", async ({ page }) => {
  await page.goto("/");
  const entry = page.getByRole("complementary", { name: "Testez le parcours sportif." });

  if (getDemoSessionConfig(process.env)) {
    await expect(entry).toBeVisible();
    await expect(entry.getByRole("heading", { name: "Testez le parcours sportif." })).toBeVisible();
    await expect(entry.getByRole("link", { name: "Essayer le parcours" })).toHaveAttribute("href", "/demo");
    await expect(entry).toContainText("coach fictif");
    await expect(entry).toContainText("Aucune carte bancaire ni paiement réel.");
  } else {
    await expect(entry).toHaveCount(0);
  }
});
