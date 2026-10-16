import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, role: string) {
  await page.goto(`/compte?mode=${role}`);
  const refuse = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true });
  if (await refuse.isVisible()) await refuse.click();
  await page.locator("#account-email").fill(`${role}@example.com`);
  await page.locator("#account-password").fill("demo-password");
  await page.locator("[data-account-login]").click();
  await expect(page.locator("[data-account-session]")).toBeVisible();
}

for (const role of ["sportif", "coach", "club", "admin"]) {
  test(`déconnexion UI ${role}, session fermée et URL non authentifiante`, async ({ page }, info) => {
    await login(page, role);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const controls = page.locator("[data-account-session]");
      await expect(controls.getByRole("button", { name: "Se déconnecter", exact: true })).toBeVisible();
      const bounds = await controls.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      if (width === 390) await page.screenshot({ path: `playwright-artifacts/strategie/session-${role}-${info.project.name}.png`, fullPage: true });
    }
    await Promise.all([
      page.waitForEvent("domcontentloaded"),
      page.getByRole("button", { name: "Se déconnecter", exact: true }).click(),
    ]);
    await expect(page.locator("#account-email")).toBeVisible();
    expect(await page.evaluate(() => fetch("/api/reservations").then(r => r.status))).toBe(401);
    await page.goto("/compte?mode=admin&connected=1&coachId=steven-fordant");
    await expect(page.locator("[data-account-session]")).toHaveCount(0);
    await expect(page.locator("#account-email")).toBeVisible();
    await page.goBack();
    await expect(page.locator("[data-account-session]")).toHaveCount(0);
  });
}

test("une erreur de déconnexion conserve le compte et permet de réessayer", async ({ page }) => {
  await login(page, "coach");
  await page.route("**/api/auth/sign-out", route => route.fulfill({ status: 503, body: "Indisponible" }));
  await page.getByRole("button", { name: "Se déconnecter", exact: true }).click();
  await expect(page.locator("[data-account-session] [role=alert]")).toContainText("Votre compte reste ouvert");
  await expect(page.getByRole("button", { name: "Se déconnecter", exact: true })).toBeEnabled();
  await page.unroute("**/api/auth/sign-out");
  await page.getByRole("button", { name: "Se déconnecter", exact: true }).click();
  await expect(page.locator("#account-email")).toBeVisible();
});

test("le rôle authentifié prime sur le rôle demandé dans l'URL", async ({ page }) => {
  await login(page, "sportif");
  await page.goto("/compte?mode=admin&connected=1&coachId=steven-fordant");
  await expect(page.locator("[data-account-session]")).toContainText("Sportif");
  await expect(page.locator("[data-admin-dashboard]")).toHaveCount(0);
});

test("la connexion utilise le rôle retourné par le serveur", async ({ page }) => {
  const email = `role-mismatch-${Date.now()}@example.com`;
  await page.goto("/compte");
  await page.evaluate(async email => {
    await fetch("/api/auth/sign-up", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: "password123", role: "sportif", firstName: "Test", lastName: "Role", phone: "0600000000", termsAccepted: true }) });
    await fetch("/api/auth/sign-out", { method: "POST" });
  }, email);
  await page.goto("/compte?mode=admin");
  await page.locator("#account-email").fill(email);
  await page.locator("#account-password").fill("password123");
  await page.locator("[data-account-login]").click();
  await expect(page.locator("[data-account-session]")).toContainText("Sportif");
  await expect(page.locator("[data-admin-dashboard]")).toHaveCount(0);
});

test("la déconnexion est répercutée dans un deuxième onglet", async ({ page, context }) => {
  await login(page, "coach");
  const other = await context.newPage();
  await other.goto("/compte?mode=coach");
  await expect(other.locator("[data-account-session]")).toBeVisible();
  await expect(other.locator("[data-account-session]")).toHaveAttribute("data-session-ready", "true");
  await page.getByRole("button", { name: "Se déconnecter", exact: true }).click();
  await expect(other.locator("#account-email")).toBeVisible();
  await other.close();
});

test("les entrées de navigation coach pointent sur des sections présentes", async ({ page }) => {
  await login(page, "coach");
  const missing = await page.locator(".coach-home-sidebar a[href^='#']").evaluateAll(links => links.filter(a => !document.getElementById((a as HTMLAnchorElement).hash.slice(1))).map(a => a.textContent));
  expect(missing).toEqual([]);
  await page.locator("a[href='#coach-help']").click();
  await expect(page.locator("#coach-help")).toBeInViewport();
});
