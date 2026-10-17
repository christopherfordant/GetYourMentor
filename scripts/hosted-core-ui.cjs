const fs = require('node:fs');
const path = require('node:path');
const { chromium, expect } = require('../gym-next/node_modules/@playwright/test');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'docs/assets/persistence-reviews-2026-10-17');
const manifest = JSON.parse(fs.readFileSync(path.join(out, 'hosted-recipe.json'), 'utf8'));
const base = 'https://getyourmentor-demo-20261014.netlify.app';
if (manifest.baseURL !== base || !manifest.created.athlete.email.endsWith('@example.com')) throw new Error('Wrong demo fixture');
if (Date.now() < Date.parse(manifest.reviewAt) + 2000) throw new Error('Scheduled session not finished; no clock override');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const proof = { baseURL: base, scheduledEnd: manifest.reviewAt, loginViaUI: false, publicationClicked: false, viewports: [] };
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 1000 } });
    const page = await context.newPage();
    await page.goto(base + '/compte?mode=sportif', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.cookie-consent-banner,.cookie-preferences-trigger')).toHaveCount(1);
    const cookies = page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true });
    if (await cookies.isVisible()) await cookies.click();
    await page.locator('#account-email').fill(manifest.created.athlete.email);
    await page.locator('#account-password').fill('demo-password');
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await expect(page.locator('[data-athlete-dashboard]')).toBeVisible();
    proof.loginViaUI = true;
    const ownResponse = await page.request.get(base + '/api/reviews');
    if (!ownResponse.ok()) throw new Error('Private reviews unavailable');
    let review = (await ownResponse.json()).data.find(row => row.reservationId === manifest.created.reservationId);
    const reservation = page.locator(`[data-athlete-reservation="${manifest.created.reservationId}"]`);
    await expect(reservation).toBeVisible();
    if (!review) {
      const form = reservation.getByRole('form');
      await form.getByRole('combobox', { name: 'Note sur 5', exact: true }).selectOption('5');
      await form.getByRole('textbox', { name: 'Votre avis', exact: true }).fill('Avis fictif de recette après la fin prévue. Aucune séance réelle attestée.');
      for (const width of [320,390,768,1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const metrics = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
        if (metrics.scroll > metrics.width) throw new Error('Account overflow at ' + width);
        proof.viewports.push({ page: 'account-review', viewport: width, ...metrics });
        if ([390,1440].includes(width)) await form.screenshot({ path: path.join(out, `live-review-form-${width}.png`) });
      }
      const response = page.waitForResponse(r => r.url().endsWith('/api/reviews') && r.request().method() === 'POST');
      await form.getByRole('button', { name: 'Publier mon avis', exact: true }).click();
      if ((await response).status() !== 201) throw new Error('Review publication not confirmed');
      proof.publicationClicked = true;
      await expect(reservation).toContainText('Votre avis pour cette séance a été enregistré.');
      review = (await (await page.request.get(base + '/api/reviews')).json()).data.find(row => row.reservationId === manifest.created.reservationId);
    }
    if (!review) throw new Error('Published review not found');
    proof.reviewId = review.id; proof.publishedAt = review.createdAt;
    await page.goto(base + '/coach?coach=' + encodeURIComponent(manifest.created.coach.coachId), { waitUntil: 'domcontentloaded' });
    const publicReviews = page.locator('[data-coach-reviews]');
    await expect(publicReviews).toContainText(review.comment);
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const metrics = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      if (metrics.scroll > metrics.width) throw new Error('Profile overflow at ' + width);
      proof.viewports.push({ page: 'public-review', viewport: width, ...metrics });
      if ([390,1440].includes(width)) await publicReviews.screenshot({ path: path.join(out, `live-public-review-${width}.png`) });
    }
    const profile = (await (await page.request.get(base + '/api/coaches/' + manifest.created.coach.coachId)).json()).data;
    if (profile.rating !== 5 || profile.reviewCount !== 1) throw new Error('Review aggregate mismatch');
    proof.rating = profile.rating; proof.reviewCount = profile.reviewCount;
    fs.writeFileSync(path.join(out, 'live-ui.json'), JSON.stringify(proof, null, 2) + '\n');
    process.stdout.write('PASS hosted UI login, review publication, public display and eight viewport checks\n');
  } finally { await browser.close(); }
})().catch(error => { process.stderr.write(error.message + '\n'); process.exitCode = 1; });
