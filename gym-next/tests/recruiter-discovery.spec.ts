import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const profilePath = "/coach?coach=madison-seck&sport=football&city=Paris";
const proofDir = "../docs/assets/recruiter-2026-10-22";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("gym-cookie-consent-v1", "refused"));
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("profile waits for authoritative statistics and never shows fixture reviews", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/coaches/madison-seck", async route => { await gate; await route.continue(); });
  await page.goto(profilePath);
  try {
    await expect(page.getByRole("heading", { name: "Chargement du profil…" })).toBeVisible();
    await expect(page.locator("[data-booking-score-large]")).toHaveCount(0);
    await mkdir(proofDir, { recursive: true });
    await page.screenshot({ path: `${proofDir}/loading.png` });
  } finally { release(); }
  await expect(page.locator("[data-booking-score-large]")).toHaveText("Pas encore de note");
  await expect(page.locator("[data-booking-score-copy]")).toHaveText("Pas encore d’avis");
  await expect(page.locator("[data-booking-qualification]")).toContainText("Validation simulée");
  await expect(page.locator("[data-booking-diploma]")).toContainText("donnée fictive");
});

test("profile uses returned review statistics rather than presentation counters", async ({ page, request }) => {
  const response = await request.get("/api/coaches/madison-seck");
  expect(response.ok()).toBe(true);
  const payload = await response.json();
  await page.route("**/api/coaches/madison-seck", route => route.fulfill({ json: { data: { ...payload.data, rating: 3.5, reviewCount: 2 } } }));
  await page.goto(profilePath);
  await expect(page.locator("[data-booking-score-large]")).toHaveText("3.5 / 5");
  await expect(page.locator("[data-booking-score-copy]")).toHaveText("2 avis");
});

test("profile distinguishes service failure, retry and missing profile", async ({ page }) => {
  let failed = true;
  await page.route("**/api/coaches/madison-seck", route => failed ? route.fulfill({ status: 503, json: { error: "Test indisponibilité" } }) : route.continue());
  await page.goto(profilePath);
  await expect(page.getByRole("heading", { name: "Profil coach indisponible" })).toBeVisible();
  await expect(page.locator("[data-booking-score-large]")).toHaveCount(0);
  failed = false;
  await page.getByRole("button", { name: "Réessayer le profil" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-booking-name]")).toHaveText("Madison Seck");
  await page.goto("/coach?coach=absent-recruiter-test&sport=football&city=Paris");
  await expect(page.getByRole("heading", { name: "Profil coach introuvable" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Réessayer le profil" })).toHaveCount(0);
});

test("reviews distinguish loading, failure and empty result with keyboard retry", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let failed = true;
  await page.route("**/api/reviews?*", async route => {
    await gate;
    await route.fulfill(failed ? { status: 503, json: { error: "Test" } } : { json: { data: [] } });
  });
  await page.goto(profilePath);
  try { await expect(page.getByText("Chargement des avis…", { exact: true })).toBeVisible(); }
  finally { release(); }
  await expect(page.locator("[data-coach-reviews] [role=alert]")).toBeVisible();
  failed = false;
  await page.getByRole("button", { name: "Réessayer les avis" }).focus(); await page.keyboard.press("Enter");
  await expect(page.getByText("Pas encore d’avis enregistré.", { exact: true })).toBeVisible();
});

test("recruiter journey preserves coach, city and price without sending a request", async ({ page }) => {
  test.setTimeout(150_000);
  const mutations: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/") && !["GET", "HEAD"].includes(request.method())) mutations.push(request.method()); });
  await mkdir(proofDir, { recursive: true });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/recherche?sport=football&city=Paris");
    await expect(page.locator(".de-demo")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Explorer les coachs" }).focus(); await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/coachs\?.*sport=football.*city=Paris/);
    const card = page.locator("[data-coach-card]").filter({ has: page.getByRole("heading", { name: "Madison Seck", exact: true }) });
    await expect(card).toContainText("Pas encore de note");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const price = await card.locator("[data-coach-price] strong").innerText();
    const link = card.locator("[data-coach-link]"); await link.focus(); await page.keyboard.press("Enter");
    await expect(page.locator("[data-booking-name]")).toHaveText("Madison Seck");
    await expect(page.locator("[data-booking-address]")).toHaveText("Paris");
    await expect(page.locator("[data-booking-price]")).toContainText(price);
    await expect(page.getByText("Simule le paiement", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${proofDir}/profile-${width}.png` });
    const about = page.getByRole("tab", { name: "À propos", exact: true });
    await about.focus(); await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Planning", exact: true })).toBeFocused();
    await page.keyboard.press("Tab"); await expect(page.getByRole("tabpanel")).toBeFocused();
    await page.locator("[data-booking-confirm]").focus(); await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/creneau\?/);
    await expect(page.locator("[data-multi-name]")).toHaveText("Madison Seck");
    await expect(page.locator("[data-multi-address]")).toHaveText("Paris");
    await expect(page.locator("[data-multi-meta]")).toContainText("après son acceptation");
    await expect(page.getByText(/aucune séance réelle n’est réservée/)).toBeVisible();
    await expect(page.getByRole("region", { name: "Calendrier des horaires de démonstration" })).toHaveAttribute("aria-busy", "false");
    const slot = page.locator("[data-multi-slots-grid] button[data-slot]:enabled").first();
    await slot.focus(); await page.keyboard.press("Enter");
    await expect(slot).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("region", { name: "Récapitulatif avant envoi" })).toContainText("accord du coach requis avant paiement");
    await expect(page.getByRole("button", { name: "Envoyer ma demande", exact: true })).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${proofDir}/request-preparation-${width}.png` });
  }
  expect(mutations).toEqual([]);
});
