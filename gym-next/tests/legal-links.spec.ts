import { expect, test } from "@playwright/test";

const legalPaths = [
  ["/legal/cgv", "Conditions générales de vente"],
  ["/legal/cgu", "Conditions générales d’utilisation"],
  ["/legal/confidentialite", "Politique de confidentialité"],
  ["/legal/mentions-legales", "Mentions légales"],
  ["/legal/cookies", "Gestion des cookies"],
  ["/legal/accessibilite", "Accessibilité"],
] as const;

test("les pages juridiques en attente sont explicites et non indexées", async ({ page }) => {
  for (const [path, title] of legalPaths) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveText(title);
    await expect(page.locator("body")).toContainText("à fournir et à valider avant toute ouverture publique");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

test("le footer de l’accueil ne renvoie plus vers les ancres de démonstration", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/legal/cgv"]').first()).toBeVisible();
  await expect(page.locator('a[href="#faq-title"]')).toHaveCount(0);
});
