import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1440]) {
  test(`compte coach lisible, complet et header conservé à ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/compte?mode=coach");
    await page.locator("#account-email").fill("coach@example.com");
    await page.locator("#account-password").fill("demo-password");
    await page.getByRole("button", { name: "Se connecter", exact: true }).click();
    const dashboard = page.locator('[data-account-dashboard="coach"]');
    await expect(dashboard).toBeVisible();
    await expect(page.locator("#gym-account")).toHaveAttribute("data-gym-design", "pitch-v1");
    await expect(page.locator("#gym-account > header a")).toHaveText([
      "GetYourMentor", "Football", "Basketball", "Fitness", "Sports de combat", "Je suis coach", "Mon compte",
    ]);
    expect(await page.locator("#gym-account > header a").evaluateAll((links) => links.map((a) => a.getAttribute("href")))).toEqual([
      "/", "/recherche?sport=football", "/recherche?sport=basketball", "/recherche?sport=metiers-de-la-forme", "/recherche?sport=sports-de-combat", "/compte?mode=coach", "/compte",
    ]);
    // The previous flex collision reduced these cards to 99 px at a 390 px viewport.
    const card = page.locator("#coach-planning");
    expect((await card.boundingBox())!.width).toBeGreaterThan(width <= 390 ? 230 : 400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const contrast = await page.locator('.coach-home-sidebar a[href="#coach-planning"]').evaluate((element) => {
      const luminance = (color: string) => {
        const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((v) => { const s = v / 255; return s <= .04045 ? s / 12.92 : Math.pow((s + .055) / 1.055, 2.4); });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      };
      const style = getComputedStyle(element);
      const a = luminance(style.color); const b = luminance(style.backgroundColor);
      return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    const planningLink = page.locator('.coach-home-sidebar a[href="#coach-planning"]');
    await planningLink.focus(); await expect(planningLink).toBeFocused(); await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#coach-planning$/);
    await expect(card).toBeInViewport();
    await expect(page.locator("[data-coach-profile-editor]")).toBeAttached();
    const badge = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true });
    if (await badge.isVisible()) await badge.click();
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `playwright-artifacts/refonte-lot1-2026-10-15/account-${width}-${info.project.name}.png` });
    expect((await page.request.post("/api/auth/sign-out")).status()).toBe(200);
    await page.goto("/compte?mode=coach");
    await expect(page.locator("#account-email")).toBeVisible();
  });
}
