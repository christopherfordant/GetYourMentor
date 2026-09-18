import { expect, test } from "@playwright/test";
import { detectInitialLanguage } from "../components/common/LanguageSelector";

test("le sélecteur de langue propose le français et l’anglais", async ({ page }) => {
  await page.goto("/");
  const selector = page.getByLabel("Langue");
  await expect(selector).toHaveValue("fr");
  await selector.selectOption("en");
  await expect(selector).toHaveValue("en");
  await page.reload();
  await expect(page.getByLabel("Langue")).toHaveValue("en");
});

test("la langue anglaise est détectée sans écraser un choix enregistré", () => {
  expect(detectInitialLanguage(null, "en-GB")).toBe("en");
  expect(detectInitialLanguage(null, "fr-FR")).toBe("fr");
  expect(detectInitialLanguage("fr", "en-GB")).toBe("fr");
  expect(detectInitialLanguage("en", "fr-FR")).toBe("en");
});
