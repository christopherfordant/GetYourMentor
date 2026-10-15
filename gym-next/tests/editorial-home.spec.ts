import { expect, test } from "@playwright/test";

async function dismissCookies(page: import("@playwright/test").Page) {
  await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);
  const refuse = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true });
  if (await refuse.isVisible()) await refuse.click();
}

test("accueil éditorial fidèle et lisible aux neuf largeurs", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/"); await dismissCookies(page);
  await expect(page.locator("#gym-editorial")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ton objectif.Le bon mentor.");
  for (const width of [320,390,430,621,768,900,1024,1280,1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect(page.locator(".header-cta")).toBeVisible();
    for (const id of ["profils","espace","forfaits","suite","sources"]) await expect(page.locator(`#${id}`)).toBeAttached();
    if ([390,1440].includes(width)) {
      await page.evaluate(() => scrollTo(0,0));
      await page.screenshot({ path: `playwright-artifacts/editorial/home-${width}-${info.project.name}.png`, fullPage: true, animations: "disabled" });
    }
  }
});

test("les trois profils se sélectionnent au clic et au clavier", async ({ page }) => {
  await page.goto("/"); await dismissCookies(page);
  await page.locator('.role-select[data-role="coach"]').click();
  const coach = page.getByRole("tab", { name: "Coach", exact: true });
  await expect(coach).toHaveAttribute("aria-selected","true"); await expect(page.locator("#panel-coach")).toBeVisible();
  await coach.focus(); await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Structure", exact: true })).toBeFocused();
  await expect(page.locator("#panel-club")).toBeVisible();
  await page.keyboard.press("Home"); await expect(page.locator("#panel-sportif")).toBeVisible();
  await expect(page.locator("#panel-club")).toBeHidden();
});

test("aperçus natifs, Échap et retour du focus sans opération commerciale", async ({ page }) => {
  const writes: string[]=[]; page.on("request",r=>{if(r.method()==="POST")writes.push(r.url());});
  await page.goto("/"); await dismissCookies(page);
  for (const key of ["sportif","coach","club","reservation","suivi"]) {
    const trigger=page.locator(`[data-detail="${key}"]`).filter({visible:true}).first();
    await trigger.focus(); await trigger.click();
    await expect(page.locator("#details")).toBeVisible(); await expect(page.locator("#detail-text")).not.toBeEmpty();
    await page.keyboard.press("Escape"); await expect(page.locator("#details")).toBeHidden(); await expect(trigger).toBeFocused();
  }
  expect(writes).toEqual([]);
});

test("forfaits documentés, palette validée fixe et FAQ existante", async ({ page }) => {
  await page.goto("/"); await dismissCookies(page);
  await expect(page.locator("#forfaits")).toContainText("19,99"); await expect(page.locator("#forfaits")).toContainText("29,99");
  await expect(page.locator(".pricing-footnote")).toContainText("15 %"); await expect(page.locator(".pricing-footnote")).toContainText("ne sont pas appliqués");
  await expect(page.getByRole("button", { name: /Comparer avec le vert|Revenir au violet/ })).toHaveCount(0);
  await expect(page.locator("#palette")).toHaveCount(0);
  await expect(page.locator("#gym-editorial")).not.toHaveClass(/green/);
  const primary = page.locator("#gym-editorial .button.primary").first();
  await expect(primary).toHaveCSS("background-color", "rgb(135, 43, 191)");
  await page.reload(); await dismissCookies(page);
  await expect(primary).toHaveCSS("background-color", "rgb(135, 43, 191)");
  const language = page.getByRole("combobox", { name: "Langue", exact: true });
  await expect(language).toBeVisible(); await language.selectOption("en"); await expect(language).toHaveValue("en");
  const question=page.locator("#faq summary").first(); await question.focus(); await question.press("Enter");
  await expect(page.locator("#faq details").first()).toHaveAttribute("open", "");
});

test("cookies, compte et navigation mobile sans chevauchement", async ({ page }) => {
  await page.setViewportSize({ width:390,height:900 }); await page.goto("/");
  const nav=page.locator("#gym-editorial .mobile-nav"); const banner=page.locator(".cookie-consent-banner");
  await expect(banner).toBeVisible();
  await expect.poll(async()=>{const a=await banner.boundingBox();const b=await nav.boundingBox();return !!a&&!!b&&a.y+a.height<=b.y;}).toBe(true);
  await dismissCookies(page); const preferences=page.getByRole("button",{name:"Préférences cookies",exact:true});
  await preferences.scrollIntoViewIfNeeded();
  await expect(page.locator("[data-footer-utilities] .cookie-preferences-trigger")).toHaveCount(1);
  await expect.poll(async()=>{const a=await preferences.boundingBox();const b=await nav.boundingBox();return !!a&&!!b&&a.y+a.height<=b.y;}).toBe(true);
  await page.locator(".header-cta").click(); await expect(page).toHaveURL(/\/compte$/);
});
