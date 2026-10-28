import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { coachVisual, demoCoachVisuals } from '../lib/demo-visuals';
import { coachProfiles } from '../lib/domain';

test('unique encoded portraits, stable identity, isolated demo and original photo priority', () => {
  const entries = Object.keys(demoCoachVisuals).map(id => coachVisual(id, true)!);
  expect(new Set(entries.map(entry => entry.src)).size).toBe(3);
  for (const id of Object.keys(demoCoachVisuals)) {
    expect(coachVisual(id, true)).toEqual(coachVisual(id, true));
    expect(coachVisual(id, false)).toBeNull();
    expect(coachVisual(id, true, '/original-photo.jpg')).toEqual({ src: '/original-photo.jpg', ai: false });
  }
  expect(coachVisual('unregistered-profile', true)).toBeNull();
  expect(coachVisual('__proto__', true)).toBeNull();
  const manifest = JSON.parse(fs.readFileSync('public/design_assets/ai-2026-10-28/manifest.json', 'utf8'));
  expect(manifest).toHaveLength(7);
  const hashes = new Set<string>();
  for (const asset of manifest) {
    for (const variant of asset.variants) {
      const bytes = fs.readFileSync(path.join('public/design_assets/ai-2026-10-28', variant.filename));
      const hash = crypto.createHash('sha256').update(bytes).digest('hex');
      expect(hash).toBe(variant.sha256);
      expect(hashes.has(hash)).toBe(false);
      hashes.add(hash);
    }
  }
});

for (const width of [390, 1440]) {
  test(`card and profile keep each coach portrait, loaded and bounded at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const sources = new Set<string>();
    for (const coach of coachProfiles) {
      const sport = coach.sport === 'fitness' ? 'metiers-de-la-forme' : coach.sport;
      await page.goto(`/coachs?sport=${sport}&city=${encodeURIComponent(coach.city)}`);
      if (coach.id === coachProfiles[0].id) await page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true }).click();
      const card = page.locator(`[data-coach-visual="${coach.id}"]`);
      await expect(card.locator('img')).toBeVisible();
      const src = await card.locator('img').getAttribute('src');
      expect(sources.has(src!)).toBe(false);
      sources.add(src!);
      await expect(card.locator('figcaption')).toContainText('Illustration IA');
      await expect.poll(() => card.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      if (coach.id === 'madison-seck') await card.screenshot({ path: `../docs/assets/ai-visuals-2026-10-28/card-${width}.png` });
      await page.locator('[data-coach-card]').filter({ has: card }).locator('[data-coach-link]').click();
      await expect(page).toHaveURL(/\/coach\?/);
      const profile = page.locator(`[data-booking-gallery-main] [data-coach-visual="${coach.id}"]`);
      await expect(profile.locator('img')).toHaveAttribute('src', src!);
      await expect.poll(() => profile.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const box = await profile.locator('img').boundingBox();
      expect(box!.height).toBeGreaterThan(100);
      if (coach.id === 'madison-seck') await profile.screenshot({ path: `../docs/assets/ai-visuals-2026-10-28/profile-${width}.png` });
    }
  });

  test(`four sport scenes and icons follow selected discipline at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/recherche');
    await page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true }).click();
    const sources = new Set<string>();
    for (const sport of ['football', 'basketball', 'metiers-de-la-forme', 'sports-de-combat']) {
      await page.locator('[data-sport-query]').selectOption(sport);
      const scene = page.locator('[data-sport-illustration]');
      await expect(scene.locator('img')).toBeVisible();
      await scene.scrollIntoViewIfNeeded();
      await expect.poll(() => scene.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      const src = await scene.locator('img').getAttribute('src');
      expect(sources.has(src!)).toBe(false);
      sources.add(src!);
      const icon = page.locator('main img[src$=".svg"]');
      await expect.poll(() => icon.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator('[data-sport-illustration]').screenshot({ path: `../docs/assets/ai-visuals-2026-10-28/search-${width}.png` });
  });
}

test('broken portrait falls back to initials, without borrowing another portrait', async ({ page }) => {
  await page.route('**/coach-football-*.webp', route => route.abort());
  await page.goto('/coach?coach=madison-seck');
  const portrait = page.locator('[data-coach-visual="madison-seck"]');
  await expect(portrait.getByLabel('Photo indisponible pour Madison Seck')).toBeVisible();
  await expect(portrait.locator('img')).toHaveCount(0);
});

test('a supplied photo replaces the illustration without an IA caption', async ({ page }) => {
  await page.route('**/api/coaches/madison-seck', route => route.fulfill({ json: { data: { ...coachProfiles[1], photoUrl: '/design_assets/logo-getyourmentor-signup.png' } } }));
  await page.goto('/coach?coach=madison-seck');
  const portrait = page.locator('[data-coach-visual="madison-seck"]');
  await expect(portrait.locator('img')).toHaveAttribute('src', '/design_assets/logo-getyourmentor-signup.png');
  await expect(portrait.locator('figcaption')).toHaveCount(0);
});
