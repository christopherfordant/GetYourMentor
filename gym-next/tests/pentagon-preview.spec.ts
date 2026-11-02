import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const preview = '/design_assets/pentagon-carousel-2026-11-02/index.html';
const evidence = '../docs/assets/pentagon-carousel-2026-11-02';

for (const width of [320, 390, 768, 1440]) {
  test(`pentagonal geometry, readable cards and no overflow at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(preview);
    await expect(page.locator('#stage')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('#stage')).toHaveAttribute('data-step', '0');
    await expect(page.locator('.face')).toHaveCount(5);
    await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const geometry = await page.locator('.ring').evaluate(element => ({
      style: getComputedStyle(element).transformStyle,
      matrices: Array.from(element.children).map(face => new DOMMatrix(getComputedStyle(face).transform).m43),
      tabs: Array.from(element.children).map(face => (face as HTMLElement).inert),
    }));
    expect(geometry.style).toBe('preserve-3d');
    expect(geometry.matrices.some(z => z > 0)).toBe(true);
    expect(geometry.matrices.some(z => z < 0)).toBe(true);
    expect(geometry.tabs).toEqual([false, true, true, true, true]);
    await fs.mkdir(evidence, { recursive: true });
    await page.screenshot({ path: `${evidence}/${info.project.name}-${width}.png`, fullPage: true });
    for (let index = 0; index < 5; index++) {
      await page.getByRole('button', { name: `Afficher la face ${index + 1}`, exact: true }).click();
      await expect(page.locator('#stage')).toHaveAttribute('data-state', 'idle');
      const fits = await page.locator('.face[data-active="true"]').evaluate(face => {
        const outer = face.getBoundingClientRect(), link = face.querySelector('a')!.getBoundingClientRect();
        return link.bottom <= outer.bottom + 1 && link.top >= outer.top;
      });
      expect(fits, `CTA of face ${index + 1} must fit`).toBe(true);
      await expect(page.locator('.face[data-active="true"] .cta')).toHaveAttribute('href', /^\//);
    }
  });
}

test('unbounded rotations in both directions, keyboard and rapid clicks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.goto(preview);
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'Face suivante', exact: true }).click();
  await expect(page.locator('#stage')).toHaveAttribute('data-step', '6');
  await expect(page.locator('#stage')).toHaveAttribute('data-active', '1');
  for (let i = 0; i < 12; i++) await page.getByRole('button', { name: 'Face précédente', exact: true }).click();
  await expect(page.locator('#stage')).toHaveAttribute('data-step', '-6');
  await expect(page.locator('#stage')).toHaveAttribute('data-active', '4');
  await page.locator('#stage').focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#stage')).toHaveAttribute('data-step', '-5');
  await expect(page.locator('#stage')).toHaveAttribute('data-active', '0');
  await expect(page.locator('#stage')).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('#status')).toContainText('Steven Fordant');
  expect(await page.locator('#ring').evaluate(element => element.getAnimations().length)).toBe(0);
});

test('swipe changes face; vertical gestures preserve scrolling; reduced motion is immediate', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto(preview);
  const stage = page.locator('#stage');
  await stage.dispatchEvent('pointerdown', { pointerId: 1, clientX: 260, clientY: 300, isPrimary: true, pointerType: 'touch' });
  await stage.dispatchEvent('pointerup', { pointerId: 1, clientX: 140, clientY: 307, isPrimary: true, pointerType: 'touch' });
  await expect(stage).toHaveAttribute('data-step', '1');
  await expect(stage).toHaveAttribute('data-state', 'idle');
  await stage.dispatchEvent('pointerdown', { pointerId: 2, clientX: 200, clientY: 300, isPrimary: true, pointerType: 'touch' });
  await stage.dispatchEvent('pointerup', { pointerId: 2, clientX: 206, clientY: 420, isPrimary: true, pointerType: 'touch' });
  await expect(stage).toHaveAttribute('data-step', '1');
  expect(await page.locator('#ring').evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  await page.getByRole('button', { name: 'Face suivante', exact: true }).click();
  await expect(stage).toHaveAttribute('data-step', '2');
  await expect(stage).toHaveAttribute('data-state', 'idle');
});

test('missing portrait retains textual information and usable navigation', async ({ page }) => {
  await page.route('**/coach-basketball-640.webp', route => route.abort());
  await page.goto(preview);
  await expect(page.locator('.face').first().locator('img')).toBeHidden();
  await expect(page.locator('.face').first()).toContainText('Portrait indisponible');
  await expect(page.getByRole('heading', { name: 'Steven Fordant' })).toBeVisible();
  await page.getByRole('button', { name: 'Face suivante', exact: true }).click();
  await expect(page.locator('#stage')).toHaveAttribute('data-active', '1');
});

test('keyboard retains focus when leaving the active card link', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.goto(preview);
  await page.locator('.face[data-active="true"] .cta').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#stage')).toBeFocused();
  await expect(page.locator('#stage')).toHaveAttribute('data-active', '1');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#stage')).toBeFocused();
  await expect(page.locator('#stage')).toHaveAttribute('data-active', '2');
  await expect(page.locator('#stage')).toHaveAttribute('data-state', 'idle');
});

test('door opening uses full slow duration and remains alive after former cleanup deadline', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.goto('/');
  const reject = page.getByRole('button', { name: 'Refuser le non n\u00e9cessaire', exact: true });
  await expect(reject).toBeVisible(); await reject.click();
  await page.getByRole('button', { name: 'Ouvrir les sections', exact: true }).click(); await page.keyboard.press('Escape');
  await page.evaluate(() => { const a = document.createElement('a'); a.href = '/coachs?sport=football'; document.body.append(a); a.click(); a.remove(); });
  await expect(page.locator('html').first()).toHaveAttribute('data-door-transition', 'opening');
  expect(await page.locator('[data-door-layer]').evaluate(element => element.getAnimations({ subtree: true }).map(animation => animation.effect!.getTiming().duration))).toEqual([2200, 2200]);
  await page.waitForTimeout(1550);
  await expect(page.locator('[data-door-layer]')).toHaveCount(1);
  await expect(page.locator('[data-door-layer]')).toHaveCount(0);
  await expect(page).toHaveURL(/coachs\?sport=football/);
});
