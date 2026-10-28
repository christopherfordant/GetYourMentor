import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const routes = ['/', '/recherche', '/coachs?sport=football&city=Paris', '/coach?coach=steven-fordant', '/creneau?coach=steven-fordant', '/recapitulatif', '/paiement', '/compte', '/compte?mode=coach', '/compte?mode=club', '/inscription-club', '/seances', '/structures', '/offres', '/contenus', '/suivi', '/plan-du-site', '/legal/cgu', '/legal/cgv', '/legal/confidentialite', '/legal/cookies', '/legal/mentions-legales', '/legal/accessibilite', '/page-inexistante-factory'];
const evidence = path.resolve('..', 'docs/assets/factory-pages-2026-10-28');

async function checkFactory(page: Page, route: string) {
  await expect(page.locator('[data-platform-header]')).toHaveCount(1);
  await expect(page.locator('.gym-footer')).toHaveCount(1);
  await expect(page.locator('main')).toBeVisible();
  const result = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    const rgb = (value: string) => value.match(/\d+/g)?.slice(0, 3).map(Number) ?? [];
    const fields = [...document.querySelectorAll<HTMLElement>('main input:not([type=hidden]):not([type=checkbox]):not([type=radio]),main textarea,main select')]
      .filter(element => element.getBoundingClientRect().width > 0)
      .map(element => ({ tag: element.tagName, bg: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color }));
    const surfaces = [...document.querySelectorAll<HTMLElement>('.payment-shell,.payment-page,.payment-form,.legal-placeholder-card,#gym-account button.auth-secondary')]
      .filter(element => element.getBoundingClientRect().width > 0)
      .map(element => ({ element: element.className, background: getComputedStyle(element).backgroundColor }));
    const allowed = ['rgb(20, 20, 20)', 'rgb(28, 28, 28)', 'rgb(34, 34, 34)', 'rgb(48, 34, 27)', 'rgba(0, 0, 0, 0)'];
    return { background: style.backgroundColor, font: style.fontFamily, primary: style.getPropertyValue('--gym-primary').trim(), overflow: document.documentElement.scrollWidth - innerWidth, wrongSurfaces: surfaces.filter(surface => !allowed.includes(surface.background)), lightFields: fields.filter(field => { const values = rgb(field.bg); return values.length === 3 && values.every(value => value > 180); }) };
  });
  expect(result.background, route).toBe('rgb(20, 20, 20)');
  expect(result.primary, route).toBe('#ff5400');
  expect(result.font, route).toContain('system-ui');
  expect(result.overflow, route).toBeLessThanOrEqual(1);
  expect(result.lightFields, route).toEqual([]);
  expect(result.wrongSurfaces, route).toEqual([]);
}

for (const width of [320, 390, 768, 1440]) {
  test(`Factory on every public and access route at ${width}px`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(route.includes('page-inexistante') ? 404 : 200);
      await checkFactory(page, route);
      if ((width === 390 || width === 1440) && ['/compte', '/paiement', '/inscription-club', '/legal/cgu'].includes(route)) {
        await fs.mkdir(evidence, { recursive: true });
        await page.screenshot({ path: path.join(evidence, `${route.slice(1).replaceAll('/', '-')}-${width}.png`), fullPage: false });
      }
    }
  });
}

for (const role of ['sportif', 'coach', 'club']) {
  test(`Factory authenticated ${role} workspace on mobile and desktop`, async ({ page, context, request }) => {
    test.setTimeout(90_000);
    const response = await request.post('/api/auth/sign-in', { data: { email: `${role}@example.com`, password: 'demo-password', role } });
    expect(response.status()).toBe(200);
    const cookie = response.headers()['set-cookie'].split(';')[0];
    const separator = cookie.indexOf('=');
    // Only the test browser adapts a server-issued Secure cookie for loopback HTTP.
    // The application continues to issue its normal secure production cookie.
    await context.addCookies([{ name: cookie.slice(0, separator), value: cookie.slice(separator + 1), url: 'http://127.0.0.1:4319', httpOnly: true, sameSite: 'Lax' }]);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/compte');
      await expect(page.locator('#gym-account .account-session-controls')).toBeVisible();
      await checkFactory(page, `/compte ${role}`);
      await fs.mkdir(evidence, { recursive: true });
      await page.screenshot({ path: path.join(evidence, `compte-${role}-${width}.png`), fullPage: false });
    }
  });
}

test('cookie choices and keyboard focus remain usable in Factory', async ({ page }) => {
  await page.goto('/compte');
  const banner = page.locator('.cookie-consent-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toHaveCSS('background-color', 'rgb(28, 28, 28)');
  await page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true }).click();
  await expect(banner).not.toBeVisible();
  const preferences = page.getByRole('button', { name: 'Préférences cookies', exact: true });
  await preferences.scrollIntoViewIfNeeded();
  await preferences.focus();
  await expect(preferences).toBeFocused();
  await expect(preferences).toHaveCSS('background-color', 'rgb(28, 28, 28)');
  await page.keyboard.press('Enter');
  await expect(banner).toBeVisible();
});
