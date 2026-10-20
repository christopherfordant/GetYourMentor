import { expect, test } from "@playwright/test";

for (const width of [320, 390, 621, 768, 900, 1024, 1440]) {
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
    // Regressions: the revised contract explicitly excludes dark navigation.
    for (const selector of ["#gym-account > header", ".coach-home-sidebar", ".coach-home-sidebar a[href=\"#coach-planning\"]"]) {
      const channels = await page.locator(selector).evaluate(el => getComputedStyle(el).backgroundColor.match(/\d+/g)!.slice(0,3).map(Number));
      expect(Math.min(...channels)).toBeGreaterThan(200);
    }
    const editorSelect = page.locator("[data-coach-profile-editor] select").first();
    await expect(page.locator("[data-coach-profile-editor] label.auth-field").first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(editorSelect).toHaveCSS("border-top-width", "1px");
    await editorSelect.focus();
    await expect(editorSelect).toBeFocused();
    expect(await editorSelect.evaluate(el => el.tagName)).toBe("SELECT");
    await expect(page.locator("#gym-account > header .topbar-link")).toBeVisible();
    const language = page.locator('[data-site-language]:visible');
    await expect(language).toContainText("Français");
    expect(await language.evaluate(el=>!!el.closest("footer"))).toBe(width<768);
    // The previous flex collision reduced these cards to 99 px at a 390 px viewport.
    const card = page.locator("#coach-planning");
    expect((await card.boundingBox())!.width).toBeGreaterThan(width <= 390 ? 230 : 400);
    const overflow = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth, elements: [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0,10).map(e => ({tag:e.tagName, class:e.className, right:e.getBoundingClientRect().right})) }));
    expect(overflow.document, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width);
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
    await page.screenshot({ path: `playwright-artifacts/refonte-clair-2026-10-15/account-${width}-${info.project.name}.png` });
    expect((await page.request.post("/api/auth/sign-out")).status()).toBe(200);
    await page.goto("/compte?mode=coach");
    await expect(page.locator("#account-email")).toBeVisible();
  });
}
