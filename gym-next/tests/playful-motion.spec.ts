import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const evidence = '../docs/assets/realistic-header-2026-11-02';

for (const width of [320, 390, 768, 1440]) {
  test(`playful navigation remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const reject = page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true });
    if (await reject.isVisible()) await reject.click();
    if (width <= 760) await page.getByRole('button', { name: 'Sports', exact: true }).click();
    const sports = page.getByRole('navigation', { name: 'Sports', exact: true });
    await expect(sports.getByRole('link')).toHaveCount(14);
    await expect(sports.locator('[data-sport-motion] img')).toHaveCount(14);
    await expect.poll(() => sports.locator('img').evaluateAll(elements => elements.every(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth === 144))).toBe(true);
    const football = sports.getByRole('link', { name: 'Football', exact: true });
    await expect(football).toHaveAttribute('href', '/recherche?sport=football');
    await football.focus();
    await expect(football).toBeFocused();
    await expect(football.locator('img')).toBeVisible();
    await fs.mkdir(evidence, { recursive: true });
    await page.screenshot({ path: `${evidence}/header-${width}.png` });
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/recherche\?sport=football/);
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Ouvrir les sections', exact: true });
    for (let iteration = 0; iteration < 2; iteration++) {
      await trigger.click();
      const drawer = page.getByRole('dialog', { name: 'Explore les sections.' });
      await expect(drawer).toBeVisible();
      await expect(drawer.getByRole('navigation').getByRole('link')).toHaveCount(7);
      await drawer.evaluate(async element => { await Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished)); });
      await page.keyboard.press('Tab');
      expect(await drawer.evaluate(element => element.contains(document.activeElement))).toBe(true);
      if (!iteration) {
        await fs.mkdir(evidence, { recursive: true });
        await page.screenshot({ path: `${evidence}/drawer-${width}.png` });
      }
      await page.keyboard.press('Escape');
      await expect(drawer).not.toBeVisible();
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await expect(page.locator('[data-mentor-id]')).toHaveCount(3);
    const link = page.locator('[data-pentagon-face][data-active=true] [data-mentor-id] a');
    await link.focus();
    await expect(link).toBeFocused();
    await expect.poll(() => page.locator('[data-pentagon-face][data-active=true] figure img').evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    if (await reject.isVisible()) await reject.click();
    await link.focus();
    await expect(link).toBeFocused();
    const destination = await link.getAttribute('href');
    await fs.mkdir(evidence, { recursive: true });
    await page.screenshot({ path: `${evidence}/mentors-${width}.png` });
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === destination);
  });
}

test('reduced motion suppresses decorative animations without hiding content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const reject = page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true });
  if (await reject.isVisible()) await reject.click();
  await page.getByRole('button', { name: 'Ouvrir les sections', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Explore les sections.' });
  await expect(drawer.getByRole('navigation').getByRole('link')).toHaveCount(7);
  expect(await drawer.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  await page.keyboard.press('Escape');
  const sportsToggle = page.getByRole('button', { name: 'Sports', exact: true });
  if (await sportsToggle.isVisible()) await sportsToggle.click();
  const football = page.getByRole('navigation', { name: 'Sports', exact: true }).getByRole('link', { name: 'Football', exact: true });
  await football.focus();
  expect(await football.locator('img').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  await expect(page.locator('[data-mentor-id]')).toHaveCount(3);
  const card = page.locator('[data-pentagon-face][data-active=true] [data-mentor-id]');
  await card.locator('a').focus();
  expect(await card.locator('figure').evaluate(element => getComputedStyle(element).transform)).toBe('none');
});

test('desktop hover animates the icon while keeping the sport link stationary', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Hover requires a fine pointer; mobile navigation is covered separately.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const link = page.getByRole('navigation', { name: 'Sports', exact: true }).getByRole('link', { name: 'Football', exact: true });
  const before = await link.boundingBox();
  await link.hover();
  expect(await link.locator('img').evaluate(element => getComputedStyle(element).animationName)).not.toBe('none');
  const after = await link.boundingBox();
  expect(after).toEqual(before);
  await page.mouse.move(0, 0);
  await expect(page.locator('[data-mentor-id]')).toHaveCount(3);
  const card = page.locator('[data-pentagon-face][data-active=true] [data-mentor-id]');
  await card.hover();
  await expect.poll(() => card.locator('figure').evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
  const cta = card.locator('a');
  const href = await cta.getAttribute('href');
  await cta.click();
  await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === href);
});

for (const width of [390, 1440]) {
  test(`directory card keeps profile navigation and reduced motion at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/coachs?sport=football');
    const reject = page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true });
    if (await reject.isVisible()) await reject.click();
    const card = page.locator('[data-coach-card]').first();
    await expect(card).toBeVisible();
    const link = card.locator('[data-coach-link]');
    await link.focus();
    await expect(link).toBeFocused();
    await expect.poll(() => card.locator('figure img').evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    await expect.poll(() => card.locator('figure').evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => card.locator('figure').evaluate(element => getComputedStyle(element).transform)).toBe('none');
    await fs.mkdir(evidence, { recursive: true });
    await page.screenshot({ path: `${evidence}/directory-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const href = await link.getAttribute('href');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === href);
  });
}
