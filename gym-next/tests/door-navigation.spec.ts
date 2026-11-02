import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
const evidence = '../docs/assets/door-navigation-2026-11-02';
const layer = '[data-door-layer]';
async function ready(page: Page, motion: 'reduce' | 'no-preference' = 'no-preference') {
  await page.emulateMedia({ reducedMotion: motion });
  await page.goto('/');
  const reject = page.getByRole('button', { name: 'Refuser le non n\u00e9cessaire', exact: true });
  await expect(reject).toBeVisible();
  await reject.click();
  await page.getByRole('button', { name: 'Ouvrir les sections', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
}
async function go(page: Page, href: string) {
  const target = new URL(href, page.url()).href;
  await page.evaluate(href => {
    const a = document.createElement('a'); a.href = href; a.textContent = 'navigation test';
    document.body.append(a); a.click(); a.remove();
  }, href);
  await page.waitForURL(target);
}
async function settled(page: Page) {
  await expect(page.locator(layer)).toHaveCount(0);
  await expect(page.locator('html').first()).not.toHaveAttribute('data-door-transition');
}
for (const width of [390, 1440]) {
 test(`real page opens with two opposite doors at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await ready(page);
  const oldTitle = await page.locator('h1').first().textContent();
  await go(page, '/coachs?sport=football');
  await expect(page.locator('html').first()).toHaveAttribute('data-door-transition', 'opening');
  const result = await page.locator(layer).evaluate(element => {
    const animations = [...element.getAnimations({ subtree: true }), ...document.querySelector('[data-door-page]')!.getAnimations()];
    animations.forEach(animation => { animation.pause(); animation.currentTime = 120; });
    return { angles: Array.from(element.children).map(door => new DOMMatrix(getComputedStyle(door).transform).m13),
      shadows: Array.from(element.children).map(door => !!door.shadowRoot?.querySelector('body')),
      titles: Array.from(element.children).map(door => door.shadowRoot?.querySelector('h1')?.textContent),
      pointer: getComputedStyle(element).pointerEvents, inert: (element as HTMLElement).inert,
      incoming: new DOMMatrix(getComputedStyle(document.querySelector('[data-door-page]')!).transform).m43 };
  });
  expect(result.angles[0] * result.angles[1]).toBeLessThan(0);
  expect(result.titles).toEqual([oldTitle, oldTitle]);
  expect(result.shadows).toEqual([true, true]); expect(result.pointer).toBe('none'); expect(result.inert).toBe(true);
  expect(result.incoming).toBeLessThan(0);
  await fs.mkdir(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/opening-${width}.png` });
  await page.evaluate(() => document.getAnimations().forEach(animation => animation.play()));
  await settled(page); await expect(page).toHaveURL(/coachs\?sport=football/);
  await expect(page.locator('[data-door-page]').first()).toContainText('coach');
  await page.screenshot({ path: `${evidence}/finished-${width}.png` });
 });
}
test('history, query and legacy location navigation retain working live pages', async ({ page }) => {
 await ready(page); const initial = await page.evaluate(() => performance.timeOrigin);
 await go(page, '/coachs?sport=football'); await settled(page);
 await go(page, '/coachs?sport=basketball'); await settled(page);
 await page.goBack(); await expect(page).toHaveURL(/sport=football/);
 await expect(page.locator('html').first()).toHaveAttribute('data-door-transition', 'opening'); await settled(page);
 await page.goForward(); await expect(page).toHaveURL(/sport=basketball/); await settled(page);
 const historyBefore = await page.evaluate(() => history.length);
 await page.evaluate(() => location.assign('/recherche?sport=football'));
 await expect(page).toHaveURL(/recherche\?sport=football/); await settled(page);
 expect(await page.evaluate(() => performance.timeOrigin)).toBe(initial);
 expect(await page.evaluate(() => history.length)).toBe(historyBefore + 1);
 await expect(page.locator('input').first()).toBeVisible();
 await page.locator('[data-sport-city]').fill('Lyon');
 await page.getByRole('button', { name: 'Explorer les coachs' }).click();
 await expect(page).toHaveURL(/coachs\?sport=football&city=Lyon/);
 await expect(page.locator('html').first()).toHaveAttribute('data-door-transition', 'opening'); await settled(page);
 expect(await page.evaluate(() => performance.timeOrigin)).toBe(initial);
});
test('reduced motion, hashes, downloads and external links never create doors', async ({ page }) => {
 await ready(page, 'reduce'); await go(page, '/coachs?sport=football'); await settled(page);
 await page.emulateMedia({ reducedMotion: 'no-preference' });
 await go(page, '#top'); await settled(page);
 await page.evaluate(() => {
   const a = document.createElement('a'); a.href = '/cv-test.pdf'; a.download = 'cv.pdf';
   a.addEventListener('click', event => event.preventDefault()); document.body.append(a); a.click(); a.remove();
 });
 await settled(page);
});
test('escape, resize, motion change and repeated navigation clean all temporary trees', async ({ page }) => {
 await ready(page);
 await go(page, '/coachs?sport=football'); await expect(page.locator(layer)).toHaveCount(1);
 await page.keyboard.press('Escape'); await settled(page);
 await go(page, '/recherche?sport=football'); await expect(page.locator(layer)).toHaveCount(1);
 await page.setViewportSize({ width: 1000, height: 800 }); await settled(page);
 await go(page, '/coachs?sport=basketball'); await expect(page.locator(layer)).toHaveCount(1);
 await page.emulateMedia({ reducedMotion: 'reduce' }); await settled(page);
 await page.emulateMedia({ reducedMotion: 'no-preference' });
 await go(page, '/recherche?sport=boxe'); await go(page, '/coachs?sport=football');
 await expect(page).toHaveURL(/coachs\?sport=football/); await settled(page);
 expect(await page.evaluate(() => document.querySelectorAll('[data-door-layer]').length)).toBe(0);
});
test('slow route never traps the interface and the next page still completes', async ({ page }) => {
 await ready(page);
 await page.route('**/coachs?**', async route => { await new Promise(resolve => setTimeout(resolve, 6200)); await route.continue(); });
 await page.evaluate(() => { const a = document.createElement('a'); a.href = '/coachs?sport=football'; document.body.append(a); a.click(); a.remove(); });
 await expect(page.locator(layer)).toHaveCount(1);
 await expect(page.locator(layer)).toHaveCount(0, { timeout: 5800 });
 await expect(page).toHaveURL(/coachs\?sport=football/); await settled(page);
 await expect(page.locator('[data-door-page]').first()).toContainText('coach');
});

test('fallback without Navigation API keeps links and back navigation working', async ({ page }) => {
 await page.addInitScript(() => Object.defineProperty(window, 'navigation', { configurable: true, value: undefined }));
 await ready(page); await go(page, '/coachs?sport=football');
 await expect(page.locator('html').first()).toHaveAttribute('data-door-transition', 'opening'); await settled(page);
 await page.goBack(); await expect(page).toHaveURL(/\/$/); await settled(page);
});

test('scrolled snapshots keep the fixed sidebar handle at the original position', async ({ page }) => {
 await ready(page); await page.evaluate(() => scrollTo(0, 500));
 await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(400);
 const delta = await page.evaluate(() => {
   const original = document.querySelector<HTMLElement>('[aria-label="Ouvrir les sections"]')!;
   const top = original.getBoundingClientRect().top;
   const a = document.createElement('a'); a.href = '/coachs?sport=football'; document.body.append(a); a.click(); a.remove();
   const copies = Array.from(document.querySelector('[data-door-layer]')!.children).map(door => door.shadowRoot!.querySelector<HTMLElement>('[aria-label="Ouvrir les sections"]')!.getBoundingClientRect().top);
   return copies.map(value => Math.abs(value - top));
 });
 expect(Math.max(...delta)).toBeLessThan(2); await settled(page);
});

test('keyboard sports links and sidebar links keep focusable live destinations', async ({ page }) => {
 await ready(page);
 if (await page.getByRole('button', { name: 'Sports', exact: true }).isVisible()) await page.getByRole('button', { name: 'Sports', exact: true }).click();
 const football = page.getByRole('navigation', { name: 'Sports', exact: true }).getByRole('link', { name: 'Football', exact: true });
 await football.focus(); await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/recherche\?sport=football/); await settled(page);
 await page.getByRole('button', { name: 'Ouvrir les sections', exact: true }).click();
 await page.getByRole('navigation', { name: 'Sections du site' }).getByRole('link', { name: 'Tous les mentors' }).click();
 await expect(page).toHaveURL(/\/coachs$/); await settled(page);
 await expect(page.getByRole('dialog')).not.toBeVisible();
 expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});
