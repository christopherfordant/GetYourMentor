import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
const preview = '/api/coaches/preview';
const evidence = path.resolve('..', 'docs/assets/mentor-carousel-2026-10-28');

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('[data-mentor-id]')).toHaveCount(3);
  const refuse = page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true });
  if (await refuse.isVisible()) await refuse.click();
  await page.locator('#mentors').scrollIntoViewIfNeeded();
}
async function centered(page: Page, index: number) {
  await expect(page.locator(`[data-carousel-item="${index}"]`)).toHaveAttribute('data-active', 'true');
  await expect.poll(() => page.evaluate(index => {
    const rail = document.querySelector<HTMLElement>('[data-centered-carousel] [tabindex]')!;
    const item = rail.children[index] as HTMLElement;
    return Math.abs(item.offsetLeft + item.offsetWidth / 2 - (rail.scrollLeft + rail.clientWidth / 2));
  }, index)).toBeLessThan(2);
}
for (const width of [320, 390, 768, 1440]) {
  test(`carousel centers both ends and keeps cards, keyboard and portraits usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await ready(page);
    await centered(page, 1);
    const cards = page.locator('[data-mentor-id]');
    const ids = await cards.evaluateAll(items => items.map(item => item.getAttribute('data-mentor-id')));
    expect(new Set(ids).size).toBe(3);
    const section = page.locator('#mentors');
    await expect(section.getByRole('link', { name: 'Voir tous les mentors' })).toHaveAttribute('href', '/coachs');
    const rail = page.getByRole('group', { name: 'Cartes des mentors', exact: true });
    await rail.focus();
    const y = await page.evaluate(() => scrollY);
    await page.keyboard.press('Home'); await centered(page, 0);
    await expect(section.getByRole('button', { name: 'Mentor précédent' })).toBeDisabled();
    await page.keyboard.press('End'); await centered(page, 2);
    await expect(section.getByRole('button', { name: 'Mentor suivant' })).toBeDisabled();
    await page.keyboard.press('ArrowLeft'); await centered(page, 1);
    await section.getByRole('button', { name: 'Mentor précédent' }).click(); await centered(page, 0);
    await section.getByRole('button', { name: 'Mentor suivant' }).click(); await centered(page, 1);
    expect(Math.abs(await page.evaluate(() => scrollY) - y)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const visuals = section.locator('figure img');
    await expect(visuals).toHaveCount(3);
    for (const img of await visuals.all()) await expect.poll(() => img.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    const sources = await visuals.evaluateAll(images => images.map(image => image.getAttribute('src')));
    expect(new Set(sources).size).toBe(3);
    await fs.mkdir(evidence, { recursive: true });
    await section.screenshot({ path: path.join(evidence, `carousel-${width}.png`), animations: 'disabled' });
    // Every lateral card remains a real link to the same identity on its detail page.
    const card = cards.first(); const id = await card.getAttribute('data-mentor-id');
    const portrait = await card.locator('img').getAttribute('src');
    const link = card.getByRole('link', { name: /Voir la fiche/ });
    const target = new URL((await link.getAttribute('href'))!, page.url());
    expect(target.searchParams.get('coach')).toBe(id);
    await link.click();
    await expect(page.locator('[data-booking-name]')).toBeVisible();
    await expect(page.locator(`[data-coach-visual="${id}"] img`).first()).toHaveAttribute('src', portrait!);
    await page.goBack(); await expect(page.locator('#mentors')).toBeVisible();
  });
}

test('active identity survives resizing; mouse drag and horizontal wheel work', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 }); await ready(page);
  const rail = page.getByRole('group', { name: 'Cartes des mentors', exact: true });
  await rail.focus(); await page.keyboard.press('End'); await centered(page, 2);
  await page.setViewportSize({ width: 390, height: 1000 }); await centered(page, 2);
  await page.setViewportSize({ width: 1440, height: 1000 }); await centered(page, 2);
  const box = await rail.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + 70);
  await page.mouse.down(); await page.mouse.move(box!.x + box!.width / 2 + 310, box!.y + 70, { steps: 12 }); await page.mouse.up();
  await centered(page, 1);
  await page.mouse.wheel(340, 0); await centered(page, 2);
});

test('native touch swipe changes the centered card without vertical jump', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 1000 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  try {
    await ready(page); await centered(page, 1);
    const rail = await page.getByRole('group', { name: 'Cartes des mentors', exact: true }).boundingBox();
    const y = Math.max(80, rail!.y + 90), x = 300;
    const before = await page.evaluate(() => scrollY);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 10; step++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - step * 24, y }] });
      // A real swipe spans multiple compositor frames; zero-duration moves do not.
      await page.waitForTimeout(20);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await centered(page, 2);
    expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThan(2);
  } finally { await context.close(); }
});

test('loading, unavailable, explicit retry, empty and one-mentor states are honest', async ({ page }) => {
  let release: () => void = () => {};
  const wait = new Promise<void>(resolve => { release = resolve; });
  await page.route(`**${preview}`, async route => { await wait; await route.fulfill({ status: 503, json: { error: 'Unavailable' } }); });
  await page.goto('/');
  await expect(page.getByText('Chargement des mentors…', { exact: true })).toBeVisible();
  release();
  await expect(page.locator('#mentors [role=alert]')).toBeVisible();
  await expect(page.locator('[data-mentor-id]')).toHaveCount(0);
  await page.unroute(`**${preview}`);
  await page.route(`**${preview}`, route => route.fulfill({ json: { data: [], demo: true } }));
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.getByText('Aucun mentor n’est disponible dans le catalogue pour le moment.', { exact: true })).toBeVisible();
  await page.unroute(`**${preview}`);
  await page.route(`**${preview}`, route => route.fulfill({ json: { data: [{ id: 'unknown-demo', name: 'Profil de test', sport: 'football', city: 'Paris', specialty: 'Football', priceFrom: null }], demo: true } }));
  await page.reload(); await expect(page.locator('[data-mentor-id]')).toHaveCount(1);
  await expect(page.locator('#mentors').getByText('Tarif à confirmer')).toBeVisible();
  await expect(page.locator('#mentors img')).toHaveCount(0);
  await expect(page.locator('#mentors').getByRole('button', { name: 'Mentor précédent' })).toBeDisabled();
  await expect(page.locator('#mentors').getByRole('button', { name: 'Mentor suivant' })).toBeDisabled();
});

test('public preview is capped and shares catalogue identities without private fields', async ({ request }) => {
  const response = await request.get(`${preview}?limit=10000`);
  expect(response.status()).toBe(200); expect(response.headers()['cache-control']).toBe('no-store');
  const { data, demo } = await response.json(); expect(demo).toBe(true); expect(data.length).toBeLessThanOrEqual(6);
  const directory = (await (await request.get('/api/coaches')).json()).data;
  expect(data.map((coach: { id: string }) => coach.id).sort()).toEqual(directory.map((coach: { id: string }) => coach.id).sort());
  for (const coach of data) expect(Object.keys(coach).sort()).toEqual(['id', 'name', 'sport', 'specialty', 'city', 'priceFrom', ...(coach.photoUrl ? ['photoUrl'] : [])].sort());
});

test('six-card preview handles rapid steps and rejects duplicate identities', async ({ page }) => {
  const data = Array.from({ length: 6 }, (_, i) => ({ id: `fixture-${i}`, name: `Mentor ${i + 1}`, sport: 'football', specialty: 'Football', city: 'Paris', priceFrom: 40 }));
  await page.route(`**${preview}`, route => route.fulfill({ json: { data, demo: true } }));
  await page.goto('/'); await expect(page.locator('[data-mentor-id]')).toHaveCount(6);
  const refuse = page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true });
  if (await refuse.isVisible()) await refuse.click();
  await page.locator('#mentors').scrollIntoViewIfNeeded(); await centered(page, 2);
  const next = page.getByRole('button', { name: 'Mentor suivant', exact: true });
  await next.click(); await next.click(); await centered(page, 4);
  await page.getByRole('group', { name: 'Cartes des mentors', exact: true }).focus();
  await page.keyboard.press('End'); await centered(page, 5);
  await page.unroute(`**${preview}`);
  await page.route(`**${preview}`, route => route.fulfill({ json: { data: [data[0], data[0]], demo: true } }));
  await page.reload(); await expect(page.locator('#mentors [role=alert]')).toBeVisible();
  await expect(page.locator('[data-mentor-id]')).toHaveCount(0);
});

test('production preview reads only six public rows, without loading review or booking histories', async () => {
  const originalFetch = global.fetch;
  const calls: string[] = [];
  global.fetch = async input => { calls.push(String(input)); return Response.json([{ id: 'one', name: 'Mentor test', sport: 'football', specialty: 'Football', city: 'Paris', price_from: 40, photo_url: '' }]); };
  try {
    const { readPublicMentorRows } = await import('../lib/mentor-preview-query');
    const rows = await readPublicMentorRows('https://mentor-preview.invalid', {}); expect(rows).toHaveLength(1); expect(calls).toHaveLength(1);
    const url = new URL(calls[0]); expect(url.pathname).toBe('/rest/v1/gym_coaches');
    expect(url.searchParams.get('limit')).toBe('6'); expect(url.searchParams.get('verified')).toBe('eq.true');
    expect(url.searchParams.get('select')).toBe('id,name,sport,specialty,city,price_from,photo_url');
  } finally { global.fetch = originalFetch; }
});
