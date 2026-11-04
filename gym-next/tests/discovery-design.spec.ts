import { expect, test } from "@playwright/test";

const routes = [
  ["recherche", "/recherche?sport=football"],
  ["annuaire", "/coachs?sport=football&city=Paris"],
  ["fiche", "/coach?sport=football&city=Paris&coach=Madison%20Seck"],
] as const;

for (const [name, url] of routes) {
  test(`${name}: composition, navigation et contrôles aux largeurs requises`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const target = name === "fiche" ? await (async () => {
      const response = await page.request.get("/api/coaches?sport=football&city=Paris");
      expect(response.ok()).toBe(true);
      const { data } = await response.json(); expect(data.length).toBeGreaterThan(0);
      return `/coach?${new URLSearchParams({ sport: "football", city: "Paris", coach: data[0].id })}`;
    })() : url;
    await page.goto(target);
    await expect(page.locator("#gym-discovery")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator("#gym-discovery > header");
    expect(await header.locator("a").evaluateAll(es => es.map(e => e.getAttribute("href")))).toEqual([
      "/", "/recherche?sport=football", "/recherche?sport=basketball", "/recherche?sport=metiers-de-la-forme", "/recherche?sport=sports-de-combat", "/compte?mode=coach", "/compte",
    ]);
    for (const width of [320, 390, 430, 621, 768, 900, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      if (width <= 760) {
        const toggle = header.locator(".de-menu-toggle");
        if (await toggle.getAttribute("aria-expanded") !== "true") await toggle.click();
      }
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await expect(header.getByRole("link", { name: "Mon compte", exact: true })).toBeVisible();
      await expect(header.getByRole("link", { name: "Je suis coach", exact: true })).toBeVisible();
      await expect(header.getByRole("link", { name: "GetYourMentor", exact: true })).toBeVisible();
      await expect(header).toHaveCSS("background-color", "rgb(28, 28, 28)");
      if ([390, 1440].includes(width)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `playwright-artifacts/discovery/after-${name}-${width}-${info.project.name}.png`, animations: "disabled" });
      }
    }
    await expect(page.locator('[data-site-language]:visible')).toContainText("Français");
    await page.setViewportSize({ width: 720, height: 900 });
    await header.locator(".de-menu-toggle").click(); // CSS viewport equivalent to 1440 px at 200% zoom.
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await header.getByRole("link", { name: "Je suis coach", exact: true }).evaluate(e => { e.textContent = "Accéder à mon espace professionnel de coaching"; });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

test("catalogue: tarifs et identité restent cohérents de l'annuaire à la fiche", async ({ page }) => {
  const response = await page.request.get("/api/coaches?sport=football&city=Paris");
  expect(response.ok()).toBe(true);
  const { data } = await response.json(); expect(data.length).toBeGreaterThan(0);
  const coach = data[0];
  await page.goto("/coachs?sport=football&city=Paris");
  const card = page.locator("[data-coach-card]").filter({ has: page.getByRole("heading", { name: coach.name, exact: true }) });
  await expect(card.locator("[data-coach-price]")).toContainText(`${coach.priceFrom} EUR`);
  await page.getByRole("combobox", { name: "Trier les coachs" }).selectOption("price-asc");
  await page.getByRole("button", { name: "Filtres", exact: true }).click();
  await expect(page.locator("[data-directory-filter-panel]")).toBeVisible();
  await page.getByLabel("Budget", { exact: true }).selectOption("under-40");
  await expect(card).toHaveCount(0);
  await page.getByLabel("Budget", { exact: true }).selectOption("all");
  await card.locator("[data-coach-link]").click();
  await expect(page.locator("[data-booking-name]")).toHaveText(coach.name);
  await expect(page.locator("[data-booking-address]")).toHaveText(coach.city);
  await expect(page.locator("[data-booking-price]")).toContainText(`${coach.priceFrom} EUR`);
  await expect(page.locator("[data-booking-score-copy]")).toHaveText(coach.reviewCount ? `${coach.reviewCount} avis` : "Pas encore d’avis");
  await expect(page.locator("[data-booking-score-large]")).toContainText(coach.reviewCount ? coach.rating.toFixed(1) : "Pas encore de note");
  await page.getByRole("tab", { name: "Planning", exact: true }).click();
  await expect(page.locator("[data-booking-confirm]")).toBeVisible();
  const href = await page.locator("[data-booking-confirm]").getAttribute("href");
  expect(new URL(href!, "http://localhost").searchParams.get("coach")).toBe(coach.id);
  await page.getByRole("tab", { name: "Contenus", exact: true }).click();
  await expect(page.locator("[data-content-lock-note]")).toContainText("Aucun abonnement actif");
  await page.locator("[data-content-unlock]").click();
  await expect(page.locator("[data-content-unlock]")).toHaveText("Prévisualisation de démo");
});
