import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

test("inventaire des pages publiques et des entrées de compte", async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const routes = ["/", "/recherche?sport=football", "/coachs?sport=football&city=Marseille", "/coach?sport=football&city=Marseille&coach=Steven%20Fordant", "/creneau?sport=football&city=Marseille&coach=Steven%20Fordant", "/recapitulatif?sport=football&city=Marseille&coach=Steven%20Fordant&slot=09h00", "/compte", "/compte?mode=coach", "/compte?mode=club", "/compte?mode=admin", "/paiement", "/inscription-club", "/legal/cgu", "/legal/cgv", "/legal/confidentialite", "/legal/mentions-legales", "/legal/cookies", "/legal/accessibilite", "/admin/knowledge", "/structures", "/demo"];
  const inventory = [];
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBeLessThan(500);
    const initialCookie = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true });
    if (await initialCookie.isVisible()) await initialCookie.click();
    const widths = [];
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      widths.push(await page.evaluate(() => ({ viewport: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth })));
    }
    inventory.push({ route, status: response?.status(), widths, ...(await page.evaluate(() => ({
      headings: [...document.querySelectorAll("h1")].map(e => e.textContent),
      controls: [...document.querySelectorAll("main button,main a,main input,main select,main textarea")].map(e => ({ tag: e.tagName, label: e.getAttribute("aria-label") ?? e.textContent?.trim().slice(0,100), href: e.getAttribute("href"), disabled: e.hasAttribute("disabled") })),
    }))) });
  }
  await mkdir("playwright-artifacts/visitor-copy", { recursive: true });
  await writeFile(`playwright-artifacts/visitor-copy/routes-${info.project.name}.json`, JSON.stringify(inventory, null, 2));
});
