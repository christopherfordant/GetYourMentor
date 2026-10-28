import { expect, test } from '@playwright/test';
import fs from 'node:fs/promises';
import { collectivePreviewRow, readCollectivePreview } from '../lib/collective-preview';
import { isolatedCollectiveDemo } from '../lib/collective-preview-server';
import { hasActiveOfferAffiliation } from '../lib/structure-offers';
import { memoryAffiliations } from '../lib/affiliations';
const slot = new Date(Date.now() + 600 * 86400000).toISOString();
const fixture = { id: 'collective-fixture', title: 'Collectif fictif de test', coachName: 'Coach de démonstration', sport: 'basketball', city: 'Marseille', source: 'coach' as const, duration: '60 minutes', location: 'Terrain fictif', slot, capacity: 6, remaining: 4, totalCents: 7300 };
const evidence = '../docs/assets/collective-preview-2026-10-28';

test('structure eligibility requires both consents; backend activation remains isolated-demo only', async () => {
  const env = { ...process.env }, before = memoryAffiliations.length;
  try {
    Object.assign(process.env, { NODE_ENV: 'development', GETYOURMENTOR_ALLOW_DEMO: 'true', DEPLOY_ENV: 'local' });
    for (const key of ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) delete process.env[key];
    const offer = { id: 'affiliation-test', ownerEmail: 'test-collective@example.com', coachId: 'steven-fordant', title: 'Test', duration: '60 minutes', slots: [slot], createdAt: slot };
    expect(await hasActiveOfferAffiliation(offer)).toBe(false);
    memoryAffiliations.push({ id: 'test-preview-consent', structureEmail: offer.ownerEmail, coachId: offer.coachId, requestedBy: 'club', status: 'accepted', structureConsent: true, coachConsent: false, createdAt: slot });
    expect(await hasActiveOfferAffiliation(offer)).toBe(false);
    memoryAffiliations[before].coachConsent = true;
    expect(await hasActiveOfferAffiliation(offer)).toBe(true);
    expect(await hasActiveOfferAffiliation({ ...offer, source: 'coach' })).toBe(true);
    expect(isolatedCollectiveDemo()).toBe(true);
    process.env.SUPABASE_URL = 'https://invalid.example';
    expect(isolatedCollectiveDemo()).toBe(false);
  } finally { memoryAffiliations.splice(before); process.env = env; }
});

test('projection refuses assumed seats, missing group price, exhausted and expired sessions; strips private data', () => {
  const offer = { ...fixture, slots: [slot], availability: [{ slot, remaining: 4 }], individualPrice: 30, groupPrices: [{ participantCount: 2, totalCents: 7300 }], ownerEmail: 'private@example.com' };
  expect(collectivePreviewRow(offer)).toEqual(fixture);
  for (const patch of [{ availability: undefined }, { availability: [{ slot, remaining: 1 }] }, { availability: [{ slot, remaining: 7 }] }, { capacity: 1 }, { groupPrices: [] }, { groupPrices: [{ participantCount: 3, totalCents: 9000 }] }, { sport: 'padel' }, { slots: ['2020-01-01T10:00:00Z'] }]) expect(collectivePreviewRow({ ...offer, ...patch })).toBeNull();
  expect(() => readCollectivePreview({ demo: true, data: [fixture, fixture] })).toThrow();
  expect(() => readCollectivePreview({ demo: false, data: [fixture] })).toThrow();
});

for (const width of [320, 390, 768, 1440]) {
  test(`preview and selected detail stay usable at ${width}px with keyboard and honest totals`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.route('**/api/sessions/preview', route => route.fulfill({ json: { demo: true, data: [fixture, { ...fixture, id: 'second-fixture', title: 'Deuxième séance fictive' }, { ...fixture, id: 'third-fixture', title: 'Troisième séance fictive' }] } }));
    await page.route('**/api/sessions', route => route.fulfill({ json: { data: [{ ...fixture, coachId: 'steven-fordant', slots: [slot], availability: [{ slot, remaining: 4 }], individualPrice: 30, groupPrices: [{ participantCount: 2, totalCents: 7300 }] }] } }));
    await page.goto('/');
    const consent = page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true });
    if (await consent.isVisible()) await consent.click();
    const section = page.locator('#collectif');
    await expect(section.locator('[data-collective-id]')).toHaveCount(3);
    await expect(page.locator('#mentors [data-mentor-id]')).toHaveCount(3);
    await expect(section).toContainText('6 places au total · 4 restantes');
    await expect(section).toContainText('73,00');
    await expect(section.getByRole('link', { name: 'Voir toutes les séances pour deux participants' })).toHaveAttribute('href', '/seances?participants=2');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await section.scrollIntoViewIfNeeded();
    await fs.mkdir(evidence, { recursive: true });
    await section.screenshot({ path: `${evidence}/preview-${width}.png`, scale: 'css' });
    const cta = section.getByRole('link', { name: /Voir la séance : Collectif fictif de test/ });
    await cta.focus();
    expect(await cta.evaluate(el => el.matches(':focus-visible'))).toBe(true);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/seances\?participants=2&offer=collective-fixture/);
    const booking = page.locator('[data-structure-offer]');
    await expect(booking).toHaveCount(1);
    await expect(booking.getByLabel('Nombre de participants, vous compris')).toHaveValue('2');
    await expect(booking.locator('[data-group-total]')).toContainText('73.00 EUR pour le groupe');
    await expect(booking).toContainText('Paiement simulé après acceptation');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await booking.screenshot({ path: `${evidence}/detail-${width}.png`, scale: 'css' });
    await page.getByRole('link', { name: 'Retour aux séances avec ces critères' }).click();
    await expect(page.locator('select[name="sport"] option')).toHaveCount(5);
  });
}

test('loading, error, retry, empty, malformed and withdrawn offer never manufacture data', async ({ page }) => {
  let state = 'loading';
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/sessions/preview', async route => {
    if (state === 'loading') await wait;
    await route.fulfill(state === 'error' ? { status: 503, json: {} } : { json: { demo: true, data: state === 'malformed' ? [{ ...fixture, remaining: 99 }] : [] } });
  });
  await page.goto('/');
  const section = page.locator('#collectif');
  await expect(section.getByRole('status')).toContainText('Chargement');
  state = 'error'; release();
  await expect(section.getByRole('alert')).toBeVisible();
  state = 'empty'; await section.getByRole('button', { name: 'Réessayer' }).click();
  await expect(section).toContainText('Aucune séance pour deux participants');
  state = 'malformed'; await page.reload();
  await expect(section.getByRole('alert')).toBeVisible();
  await expect(section.locator('[data-collective-id]')).toHaveCount(0);
  await page.route('**/api/sessions', route => route.fulfill({ json: { data: [] } }));
  await page.goto('/seances?participants=2&offer=withdrawn');
  await expect(page.getByRole('status')).toContainText('n’est plus disponible');
  await expect(page.locator('[data-structure-offer]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Retour aux séances avec ces critères' })).toHaveAttribute('href', '/seances?participants=2');
});

test('touch and reduced motion coexist with drawer, cookies, header and footer', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await page.route('**/api/sessions/preview', route => route.fulfill({ json: { demo: true, data: [fixture] } }));
    await page.goto('/');
    await expect(page.locator('#collectif [data-collective-id]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Ouvrir les sections' }).tap();
    const drawer = page.getByRole('dialog', { name: 'Explore les sections.' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('link', { name: /Entraîne-toi à plusieurs/ })).toHaveAttribute('href', '/seances');
    expect(await drawer.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Ouvrir les sections' })).toBeFocused();
    const consent = page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true });
    if (await consent.isVisible()) await consent.tap();
    await page.locator('#collectif').scrollIntoViewIfNeeded();
    await page.locator('#collectif').screenshot({ path: `${evidence}/touch-cohabitation-390.png`, scale: 'css' });
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('footer')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#collectif').getByRole('link', { name: /Voir la séance :/ }).tap();
    await expect(page).toHaveURL(/offer=collective-fixture/);
  } finally { await context.close(); }
});

test('local real API publishes eligible offers, bounds public preview, reserves seats and rechecks group total', async ({ request }) => {
  const login = async (role: string) => {
    const response = await request.post('/api/auth/sign-in', { data: { email: `${role}@example.com`, role, password: 'demo-password' } });
    expect(response.status()).toBe(200); return { Cookie: response.headers()['set-cookie'].split(';')[0] };
  };
  const coach = await login('coach'), athlete = await login('sportif');
  const previous = (await (await request.get('/api/coaches/steven-fordant')).json()).data.groupPrices ?? [];
  try {
    expect((await request.patch('/api/coaches/group-prices', { headers: coach, data: { prices: [{ participantCount: 2, totalCents: 7300 }] } })).status()).toBe(200);
    const ids: string[] = [];
    for (let i = 0; i < 4; i++) {
      const published = await request.post('/api/coaches/sessions', { headers: coach, data: { title: `Test local collectif ${i}`, duration: '60 minutes', capacity: i === 0 ? 2 : 4, location: 'Terrain fictif de test', slots: [new Date(Date.now() + (700 + i) * 86400000).toISOString()] } });
      expect(published.status()).toBe(201); ids.push((await published.json()).data.id);
    }
    const preview = await request.get('/api/sessions/preview');
    expect(preview.headers()['cache-control']).toBe('no-store');
    const payload = await preview.json();
    expect(payload.demo).toBe(true); expect(payload.data).toHaveLength(3);
    expect(payload.data.map((row: { id: string }) => row.id)).toEqual(ids.slice(0, 3));
    expect(Object.keys(payload.data[0]).sort()).toEqual(Object.keys(fixture).sort());
    expect(JSON.stringify(payload)).not.toMatch(/ownerEmail|additionalParticipants|bankAccount|example\.com/);
    const offer = (await (await request.get('/api/sessions')).json()).data.find((row: { id: string }) => row.id === ids[0]);
    const body = { structureOfferId: ids[0], slots: [offer.slots[0]], participantCount: 2, additionalParticipants: [{ firstName: 'Personne', lastName: 'Fictive', age: 25, email: 'local-test@example.com' }], price: 1 };
    const reservation = await request.post('/api/reservations', { headers: athlete, data: body });
    expect(reservation.status()).toBe(201);
    const data = (await reservation.json()).data;
    expect(data).toMatchObject({ participantCount: 2, price: 73, status: 'requested', financials: { grossCents: 7300, commissionBps: 1500 } });
    expect((await request.post(`/api/reservations/${data.id}/payment`, { headers: athlete })).status()).toBe(409);
    const after = (await (await request.get('/api/sessions/preview')).json()).data;
    expect(after.some((row: { id: string }) => row.id === ids[0])).toBe(false);
    expect((await request.post('/api/reservations', { headers: athlete, data: body })).status()).toBe(409);
    await request.patch(`/api/reservations/${data.id}`, { headers: coach, data: { status: 'rejected' } });
  } finally {
    await request.patch('/api/coaches/group-prices', { headers: coach, data: { prices: previous } });
  }
});
