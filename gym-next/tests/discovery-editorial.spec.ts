import { expect, test } from "@playwright/test";

async function refuseCookies(page: import("@playwright/test").Page) {
  await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);
  const button = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true });
  if (await button.isVisible()) await button.click();
}

test("les disciplines historiques et la ville passent de la recherche à l’annuaire étendu", async ({ page }) => {
  for (const sport of ["football", "basketball", "metiers-de-la-forme", "sports-de-combat"]) {
    await page.goto(`/recherche?sport=${sport}&city=Lyon`);
    const discipline = page.getByLabel("Quelle discipline ?", { exact: true });
    await expect(discipline).toHaveValue(sport);
    await expect(discipline.locator("option")).toHaveCount(14);
    await refuseCookies(page);
    await page.getByRole("button", { name: "Explorer les coachs" }).click();
    await expect(page).toHaveURL(new RegExp(`/coachs\\?sport=${sport}&city=Lyon$`));
    await expect(page.getByLabel("Zone d’entraînement", { exact: true })).toHaveValue("Lyon");
    await page.goBack();
    await expect(page.getByLabel("Où veux-tu t’entraîner ?", { exact: true })).toHaveValue("Lyon");
  }
});

test("filtres, tri et réinitialisation conservent le catalogue puis ouvrent le créneau", async ({ page }) => {
  const { data } = await (await page.request.get("/api/coaches?sport=football&city=Paris")).json();
  expect(data.length).toBeGreaterThan(0);
  await page.goto("/coachs?sport=football&city=Paris"); await refuseCookies(page);
  await page.getByRole("button", { name: "Filtres", exact: true }).click();
  const budget = page.getByLabel("Budget", { exact: true });
  await budget.selectOption("under-40");
  const expected = data.filter((coach: { priceFrom: number }) => coach.priceFrom < 40);
  await expect(page.locator("[data-coach-card]")).toHaveCount(expected.length);
  if (expected.length === 0) await expect(page.locator("[data-directory-empty]")).toBeVisible();
  await page.getByRole("button", { name: "Réinitialiser", exact: true }).click();
  await expect(page.locator("[data-coach-card]")).toHaveCount(data.length);
  await page.getByRole("combobox", { name: "Trier les coachs" }).selectOption("price-desc");
  const prices = await page.locator("[data-coach-price] strong").allTextContents();
  expect(prices.map(p => Number(p.replace(" EUR", "")))).toEqual(data.map((c: { priceFrom: number }) => c.priceFrom).sort((a: number,b: number) => b-a));
  await page.locator("[data-coach-link]").first().click();
  await expect(page.locator("[data-booking-name]")).toBeVisible();
  const profileUrl = new URL(page.url());
  await page.getByRole("tab", { name: "Planning", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Planning", exact: true })).toHaveAttribute("aria-selected", "true");
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect(page.locator("[data-booking-slot]").first()).toBeVisible();
  }
  await page.locator("[data-booking-confirm]").click();
  await expect(page).toHaveURL(/\/creneau\?/);
  const next = new URL(page.url());
  for (const param of ["sport","city","coach"]) expect(next.searchParams.get(param)).toBe(profileUrl.searchParams.get(param));
  await expect(page.locator("[data-multi-confirm]")).toBeVisible();
});

test("profil inconnu : chargement puis erreur avec retour vers les coachs", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release=resolve; });
  await page.route("**/api/coaches/missing-editorial-profile", async route => {
    await gate; await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({error:"Profil introuvable"}) });
  });
  await page.goto("/coach?sport=football&city=Lyon&coach=missing-editorial-profile", {waitUntil:"domcontentloaded"});
  try { await expect(page.getByRole("heading", {name:"Chargement du profil…"})).toBeVisible(); }
  finally { release(); }
  await expect(page.getByRole("heading", {name:"Profil coach indisponible"})).toBeVisible();
  await expect(page.locator("[data-coach-unavailable]")).toHaveAttribute("aria-busy","false");
  await expect(page.getByRole("link", {name:"Revenir aux coachs"})).toHaveAttribute("href","/coachs?sport=football&city=Lyon");
  await expect(page.locator("[data-booking-confirm]")).toHaveCount(0);
});

test("métadonnées, styles isolés et liens du pied de page", async ({ page }, info) => {
  const {data} = await (await page.request.get("/api/coaches?sport=football&city=Paris")).json();
  const coach = data[0]; expect(coach).toBeTruthy();
  const profileQuery = new URLSearchParams({sport:"football",city:coach.city,coach:coach.id});
  for (const [name,path] of [["recherche","/recherche?sport=football&city=Paris"], ["annuaire","/coachs?sport=football&city=Paris"], ["fiche",`/coach?${profileQuery}`]]) {
    await page.goto(path);
    await refuseCookies(page);
    if (name === "fiche") await expect(page.locator("[data-booking-name]")).toHaveText(coach.name);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content",/.+/);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    const url = new URL(canonical!); expect(url.pathname).toBe(new URL(path,"http://localhost").pathname);
    expect(url.searchParams.get("sport")).toBe("football");
    await expect(page.locator("#gym-discovery")).toHaveCSS("font-family", /system-ui/);
    await expect(page.locator("#gym-discovery h1")).toHaveCSS("font-family", /system-ui/);
    const legacy = await page.locator("style").evaluateAll(styles => styles.some(style => (style.textContent ?? "").includes("prototype-site")));
    expect(legacy).toBe(false);
    for (const [name,href] of [["Comment ça marche","/#espace"],["Tarifs","/#forfaits"],["FAQ","/#faq"]]) await expect(page.locator(".gym-footer").getByRole("link",{name,exact:true})).toHaveAttribute("href",href);
    for (const width of [1440,390]) {
      await page.setViewportSize({width,height:1000});
      await page.screenshot({path:`playwright-artifacts/discovery-editorial/${name}-${width}-${info.project.name}.png`,fullPage:true,animations:"disabled"});
    }
  }
});

test("cookies et retour en haut restent accessibles sans flotter sur les actions", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.setViewportSize({width:320,height:900});
  await page.goto("/recherche?sport=football"); await refuseCookies(page);
  const preferences = page.getByRole("button", {name:"Préférences cookies",exact:true});
  await expect(preferences).toHaveCSS("position","static");
  await preferences.scrollIntoViewIfNeeded(); await preferences.click();
  await expect(page.locator(".cookie-consent-banner")).toBeVisible();
  await refuseCookies(page);
  await preferences.scrollIntoViewIfNeeded();
  const top = page.getByRole("link", {name:"Remonter en haut de la page",exact:true});
  await expect(top).toHaveCSS("position","static");
  await top.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(25);
});

test("une discipline inconnue ne peut pas résoudre une propriété du prototype", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  for (const path of ["/recherche?sport=constructor", "/coachs?sport=constructor", "/coach?sport=constructor&coach=unknown-editorial-coach"]) {
    const response = await page.goto(path); expect(response?.ok()).toBe(true);
    await expect(page.locator("#gym-discovery")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
  }
  await expect(page.getByRole("heading",{name:"Profil coach indisponible"})).toBeVisible();
  expect(errors).toEqual([]);
});
