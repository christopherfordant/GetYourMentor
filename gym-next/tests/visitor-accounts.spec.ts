import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

for (const role of ["sportif", "coach", "club"] as const) {
  test(`inventaire connecté ${role} : accès au compte et contrôles visibles`, async ({ page }, info) => {
    await page.goto(`/compte?mode=${role}`);
    await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);
    const refuse = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true });
    if (await refuse.isVisible()) await refuse.click();
    await page.locator("#account-email").fill(`${role === "sportif" ? "athlete" : role}@example.com`);
    await page.locator("#account-password").fill("demo-password");
    await page.locator("[data-account-login]").click();
    const dashboard = page.locator(role === "sportif" ? "[data-athlete-dashboard]" : `[data-account-dashboard="${role}"]`);
    await expect(dashboard).toBeVisible();
    const widths = [];
    await mkdir("playwright-artifacts/visitor-copy", { recursive: true });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      widths.push(await page.evaluate(() => ({ viewport: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth })));
      if ([390,1440].includes(width)) await page.screenshot({ path: `playwright-artifacts/visitor-copy/compte-${role}-${width}-${info.project.name}.png`, fullPage: true });
    }
    const controls = await dashboard.evaluate(e => ({ buttons: [...e.querySelectorAll("button")].filter(b => b.getClientRects().length).map(b => ({ label: b.textContent?.trim(), disabled: b.disabled })), links: [...e.querySelectorAll("a")].filter(a => a.getClientRects().length).map(a => ({ label: a.textContent?.trim(), href: a.getAttribute("href"), targetExists: !a.hash || !!document.getElementById(decodeURIComponent(a.hash.slice(1))) })) }));
    await writeFile(`playwright-artifacts/visitor-copy/compte-${role}-${info.project.name}.json`, JSON.stringify({ role, widths, ...controls }, null, 2));
  });
}
