import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
const preview = '/design_assets/header-equipment-2026-10-30/apercu.html';
const layer = '[data-equipment-entrance-layer]';
const evidence = '../docs/assets/equipment-entrance-2026-11-02';
async function settled(page: Page) {
  await expect(page.locator('.sportsPanel')).toHaveAttribute('data-equipment-intro', 'settled');
  await expect(page.locator(layer)).toHaveCount(0);
  expect(await page.locator('nav img').evaluateAll(elements => elements.every(element => getComputedStyle(element).visibility === 'visible'))).toBe(true);
}

for (const width of [390, 1440]) {
  test(`objects travel across the viewport then settle without moving links at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(preview);
    await settled(page);
    const initial = await page.getByRole('navigation', { name: 'Sports', exact: true }).boundingBox();
    await page.getByRole('button', { name: 'Rejouer l’arrivée' }).click();
    await expect(page.locator(layer)).toBeVisible();
    const samples = await page.locator(layer).evaluate(element => {
      const animations = element.getAnimations({ subtree: true });
      animations.forEach(animation => {
        const timing = animation.effect!.getTiming();
        animation.pause();
        animation.currentTime = Number(timing.delay) + Number(timing.duration) * .5;
      });
      const positions = Array.from(element.children).map(child => child.getBoundingClientRect().left);
      return { count: animations.length, frames: animations.map(animation => (animation.effect as KeyframeEffect).getKeyframes().length), spread: Math.max(...positions) - Math.min(...positions), pointerEvents: getComputedStyle(element).pointerEvents };
    });
    expect(samples.count).toBeGreaterThanOrEqual(8);
    expect(samples.frames.every(count => count >= 6)).toBe(true);
    expect(samples.pointerEvents).toBe('none');
    expect(samples.spread).toBeGreaterThan(width * .35);
    await fs.mkdir(evidence, { recursive: true });
    await page.screenshot({ path: `${evidence}/flight-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.locator(layer).evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.play()));
    await settled(page);
    const final = await page.getByRole('navigation', { name: 'Sports', exact: true }).boundingBox();
    expect(final).toEqual(initial);
    await page.screenshot({ path: `${evidence}/settled-${width}.png` });
  });
}

test('escape, resize and repeated replay restore originals and remove every overlay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(preview);
  await settled(page);
  const replay = page.getByRole('button', { name: 'Rejouer l’arrivée' });
  await replay.click();
  await expect(page.locator(layer)).toBeVisible();
  await page.keyboard.press('Escape');
  await settled(page);
  await replay.click();
  await expect(page.locator(layer)).toBeVisible();
  await page.setViewportSize({ width: 900, height: 800 });
  await settled(page);
  await replay.click(); await replay.click();
  await expect(page.locator(layer)).toHaveCount(1);
  await page.getByRole('checkbox').uncheck();
  await settled(page);
});

test('reduced motion stays static until the preview is explicitly enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#platform-sports')).toHaveAttribute('data-equipment-intro', 'skipped');
  await expect(page.locator(layer)).toHaveCount(0);
  await page.goto(preview);
  await expect(page.getByRole('checkbox')).not.toBeChecked();
  await expect(page.locator(layer)).toHaveCount(0);
  await page.getByRole('button', { name: 'Rejouer l’arrivée' }).click();
  await expect(page.getByRole('checkbox')).toBeChecked();
  await expect(page.locator(layer)).toBeVisible();
  await page.keyboard.press('Escape');
  await settled(page);
});

test('actual home header starts once and its sport links work during the arrival', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('#platform-sports')).toHaveAttribute('data-equipment-intro', /running|settled/);
  const sports = page.getByRole('navigation', { name: 'Sports', exact: true });
  await expect(sports.getByRole('link')).toHaveCount(14);
  await sports.getByRole('link', { name: 'Football', exact: true }).click();
  await expect(page).toHaveURL(/\/recherche\?sport=football/);
  await expect(page.locator(layer)).toHaveCount(0);
});

test('mobile header waits for first Sports opening and does not replay after reopening', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator(layer)).toHaveCount(0);
  const sports = page.getByRole('button', { name: 'Sports', exact: true });
  await sports.click();
  await expect(page.locator(layer)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator(layer)).toHaveCount(0);
  await sports.click(); await sports.click();
  await expect(page.locator('#platform-sports')).toHaveAttribute('data-equipment-intro', 'settled');
  await expect(page.locator(layer)).toHaveCount(0);
});
