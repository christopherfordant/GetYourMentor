import { test, expect } from '@playwright/test';
import { discoverySports } from '../lib/discovery-sports';

for (const width of [320, 390, 768, 1440]) {
  test(`shared header and right drawer across public routes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/recherche?sport=padel', '/coachs?sport=padel&city=Paris', '/compte', '/paiement', '/inscription-club']) {
      await page.goto(route);
      const header = page.locator('[data-platform-header]');
      await expect(header).toHaveCount(1);
      await expect(header.getByRole('link', { name: /Mon compte/ })).toBeVisible();
      await expect(header.getByRole('link', { name: 'Je suis coach', exact: true })).toHaveCount(0);
      if (width <= 760) await header.getByRole('button', { name: 'Sports', exact: true }).click();
      await expect(header.getByRole('navigation', { name: 'Sports', exact: true })).toBeVisible();
      await expect(header.getByRole('navigation', { name: 'Sports', exact: true }).getByRole('link')).toHaveCount(14);
      if (width <= 760) await header.getByRole('button', { name: 'Sports', exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (route === '/recherche?sport=padel') {
        await expect(page.locator('[data-sport-query]')).toHaveValue('padel');
        await expect(page.locator('[data-sport-illustration]')).toHaveCount(0);
      }
    }
    const reject = page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true });
    if (await reject.isVisible()) await reject.click();
    const trigger = page.getByRole('button', { name: 'Ouvrir les sections', exact: true });
    const before = await trigger.boundingBox();
    await trigger.click();
    const drawer = page.getByRole('dialog', { name: 'Explore les sections.' });
    await expect(drawer).toBeVisible();
    await drawer.evaluate(e => Promise.all(e.getAnimations().map(a => a.finished)));
    const box = await drawer.boundingBox();
    expect(box!.x).toBeLessThan(before!.x);
    expect(box!.width).toBeLessThanOrEqual(Math.min(360, width - 44));
    // The modal is docked to the physical viewport; body padding preserves layout.
    expect(Math.abs(box!.x + box!.width - width)).toBeLessThanOrEqual(2);
    const closeBox = await drawer.getByRole('button', { name: 'Fermer les sections', exact: true }).boundingBox();
    expect(closeBox!.x).toBeGreaterThanOrEqual(0);
    expect(closeBox!.width).toBeGreaterThanOrEqual(44);
    await expect(drawer.getByRole('navigation').getByRole('link')).toHaveCount(7);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await page.goto('/');
    const cookie = page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true });
    if (await cookie.isVisible()) await cookie.click();
    await page.getByRole('button', { name: 'Ouvrir les sections', exact: true }).click();
    await page.getByRole('dialog', { name: 'Explore les sections.' }).evaluate(e => Promise.all(e.getAnimations().map(a => a.finished)));
    await page.screenshot({ path: `../docs/assets/navigation-refonte-2026-10-28/menu-${width}.png`, fullPage: false });
  });
}

test('all approved disciplines have actual search and directory routes without borrowing football profiles', async ({ page, request }) => {
  for (const [slug, label] of discoverySports) {
    const response = await request.get(`/recherche?sport=${slug}`);
    expect(response.ok(), label).toBe(true);
  }
  await page.goto('/recherche?sport=padel&city=Marseille');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('padel');
  await page.locator('[data-sport-search-form]').getByRole('button', { name: /Explorer les coachs/ }).click();
  await expect(page).toHaveURL(/\/coachs\?.*sport=padel/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('padel');
  await expect(page.locator('[data-coach-card]')).toHaveCount(0);
});

test('bell opens a truthful account entry, no fabricated unread count, escape restores focus', async ({ page }) => {
  await page.goto('/');
  const bell = page.getByRole('button', { name: 'Notifications', exact: true });
  await bell.click();
  const dialog = page.getByRole('dialog', { name: 'Notifications', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Ouvrir mon compte/ })).toHaveAttribute('href', '/compte');
  await expect(bell).toHaveText('');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(bell).toBeFocused();
});

test('coach entry starts at My account, preserves booking context, and cannot grant a role', async ({ page, request }) => {
  await page.goto('/compte?reservationId=local-context-only&redirect=paiement');
  const entry = page.getByRole('navigation', { name: 'Type de compte' });
  await entry.getByRole('link', { name: 'Espace coach', exact: true }).click();
  await expect(page).toHaveURL(/mode=coach/);
  expect(new URL(page.url()).searchParams.get('reservationId')).toBe('local-context-only');
  await expect(page.getByRole('heading', { name: 'Connexion coach', exact: true })).toBeVisible();
  await expect(page.locator('[data-message-inbox]')).toHaveCount(0);
  const email = `navigation-${Date.now()}@example.test`;
  const password = 'navigation-local-fixture';
  const signup = await request.post('/api/auth/sign-up', { data: { email, password, role: 'sportif', firstName: 'Test', lastName: 'Navigation', phone: '0000000000', city: 'Paris', termsAccepted: true } });
  expect(signup.status()).toBe(201);
  const roleHint = await request.post('/api/auth/sign-in', { data: { email, password, role: 'coach' } });
  expect(roleHint.status()).toBe(200);
  expect((await roleHint.json()).data.role).toBe('sportif');
  const invalid = await request.post('/api/auth/sign-in', { data: { email, password: 'wrong-password', role: 'coach' } });
  expect(invalid.status()).toBe(401);
  await page.goto('/compte?mode=coach&connected=1&coachId=steven-fordant');
  await expect(page.getByRole('heading', { name: 'Connexion coach', exact: true })).toBeVisible();
  await expect(page.locator('[data-message-inbox]')).toHaveCount(0);
});

test('Factory surfaces and reduced motion are applied without changing source data', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/recherche']) {
    await page.goto(route);
    const theme = page.locator('.gym-theme-factory').first();
    expect(await theme.evaluate(e => getComputedStyle(e).getPropertyValue('--gym-primary').trim())).toBe('#ff5400');
  }
  await page.getByRole('button', { name: 'Ouvrir les sections' }).click();
  const drawer = page.getByRole('dialog', { name: 'Explore les sections.' });
  expect(await drawer.evaluate(e => getComputedStyle(e).animationName)).toBe('none');
});
