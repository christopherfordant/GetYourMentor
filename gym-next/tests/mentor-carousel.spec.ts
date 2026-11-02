import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import { coachProfiles } from '../lib/domain';
import { toPublicCoach } from '../lib/public-coach';
import { readMentorPreview } from '../lib/mentor-preview';
import { readPublicMentorRows } from '../lib/mentor-preview-query';

const endpoint = '/api/coaches/preview';
const folder = '../docs/assets/mentors-integration-2026-11-02';
const fixture = (index: number) => ({ id: `test-mentor-${index}`, name: `Mentor de test ${index}`, sport: 'football', specialty: 'Accompagnement de test', city: 'Paris', priceFrom: 40, description: 'Présentation de démonstration.', sessionTypes: 'Individuel, duo', format: 'visio', practice: 'interieur', level: 'debutant' });
async function open(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true }).click();
  await page.locator('#mentors').scrollIntoViewIfNeeded();
}
async function idle(page: Page) { await expect(page.locator('#mentors [data-state]')).toHaveAttribute('data-state', 'idle'); }

test('public projection excludes current and future private fields, including nested extras', () => {
  const source = { ...coachProfiles[0], bankAccountLast4: '9999', latitude: 48.1, longitude: 2.1, verificationStatus: 'approved' as const, identityPath: 'PRIVATE', futurePrivateField: 'PRIVATE', groupPrices: [{ participantCount: 2, totalCents: 4000, privateNote: 'PRIVATE' }] };
  const projected = toPublicCoach(source);
  expect(JSON.stringify(projected)).not.toContain('PRIVATE');
  for (const key of ['bankAccountLast4', 'latitude', 'longitude', 'verificationStatus', 'identityPath', 'futurePrivateField']) expect(projected).not.toHaveProperty(key);
  expect(projected.groupPrices).toEqual([{ participantCount: 2, totalCents: 4000 }]);
});

test('public preview remains bounded, includes only existing public fields and validates the payload', async ({ request }) => {
  const response = await request.get(`${endpoint}?limit=10000`);
  expect(response.status()).toBe(200); expect(response.headers()['cache-control']).toBe('no-store');
  const payload = await response.json(); expect(payload.data.length).toBeLessThanOrEqual(6);
  const directory = (await (await request.get('/api/coaches')).json()).data;
  expect(payload.data.map((row: { id: string }) => row.id).sort()).toEqual(directory.map((row: { id: string }) => row.id).sort());
  for (const row of [...payload.data, ...directory]) for (const key of ['bankAccountLast4','latitude','longitude','verificationStatus','identity_storage_path','diploma_storage_path']) expect(row).not.toHaveProperty(key);
  expect(payload.data.some((row: { sessionTypes?: string }) => row.sessionTypes)).toBe(true);
  const parsed = readMentorPreview({ data: [{ ...fixture(0), privateField: 'PRIVATE' }], demo: true });
  expect(JSON.stringify(parsed)).not.toContain('PRIVATE');
  expect(() => readMentorPreview({ data: [fixture(0), fixture(0)], demo: true })).toThrow();
  expect(() => readMentorPreview({ data: Array.from({ length: 7 }, (_, index) => fixture(index)), demo: true })).toThrow();
  expect(() => readMentorPreview({ data: [{ ...fixture(0), level: 'invented' }], demo: true })).toThrow();
});

test('remote catalogue query uses only bounded public columns, no histories or private documents', async () => {
  const original = global.fetch; const calls: string[] = [];
  global.fetch = async input => { calls.push(String(input)); return Response.json([]); };
  try {
    await readPublicMentorRows('https://mentor-preview.invalid', {});
    expect(calls).toHaveLength(1);
    const url = new URL(calls[0]); expect(url.searchParams.get('limit')).toBe('6'); expect(url.searchParams.get('verified')).toBe('eq.true');
    expect(url.searchParams.get('select')).toBe('id,name,sport,specialty,city,price_from,photo_url,description,session_types,session_format,practice,level');
  } finally { global.fetch = original; }
});

for (const width of [320,390,768,1440]) {
  test(`integrated five faces remain readable, unique and keyboard usable at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 }); await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
    await expect(page.locator('#mentors [data-mentor-id]')).toHaveCount(3);
    await expect(page.locator('#mentors [data-catalogue-action]')).toHaveCount(2);
    await expect(page.locator('#mentors [data-pentagon-face]')).toHaveCount(5);
    const ids = await page.locator('#mentors [data-mentor-id]').evaluateAll(cards => cards.map(card => card.getAttribute('data-mentor-id')));
    expect(new Set(ids).size).toBe(3);
    await expect.poll(() => page.locator('#mentors img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await fs.mkdir(folder, { recursive: true });
    await page.locator('#mentors').screenshot({ path: `${folder}/after-home-${info.project.name}-${width}.png` });
    for (let i=0;i<5;i++) {
      const face = page.locator('#mentors [data-pentagon-face][data-active=true]');
      expect(await face.locator('a').evaluate(element => getComputedStyle(element).color)).toBe('rgb(255, 255, 255)');
      expect(await face.evaluate(element => { const card=element.firstElementChild as HTMLElement; const cta=card.querySelector('a')!; return card.scrollHeight <= card.clientHeight + 2 && cta.getBoundingClientRect().bottom <= card.getBoundingClientRect().bottom + 2; })).toBe(true);
      await page.getByRole('button',{name:'Face suivante',exact:true}).click(); await idle(page);
    }
    await expect(page.locator('#mentors [data-step]')).toHaveAttribute('data-step','5');
    await page.locator('#mentors [data-state]').focus(); await page.keyboard.press('ArrowLeft'); await idle(page);
    await expect(page.locator('#mentors [data-step]')).toHaveAttribute('data-step','4');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const count of [0,1,2,4,5,6]) {
  test(`catalogue of ${count} profiles has no invented or duplicate mentors`, async ({ page }) => {
    const data = Array.from({ length: count }, (_, index) => fixture(index));
    await page.route(`**${endpoint}`,route=>route.fulfill({json:{data,demo:true}})); await open(page);
    if (!count) { await expect(page.locator('#mentors')).toContainText('Aucun mentor'); await expect(page.locator('[data-mentor-pentagon]')).toHaveCount(0); return; }
    await expect(page.locator('#mentors [data-mentor-id]')).toHaveCount(Math.min(count,5));
    if (count<=2) { await expect(page.locator('[data-pentagon-ring]')).toHaveCount(0); await expect(page.locator('[data-catalogue-action]')).toHaveCount(0); }
    if (count===4) await expect(page.locator('[data-catalogue-action]')).toHaveCount(1);
    if (count>=5) await expect(page.locator('[data-catalogue-action]')).toHaveCount(0);
    if (count===6) {
      await page.getByRole('button',{name:'Autres profils'}).click();
      await expect(page.locator('[data-mentor-id]')).toHaveCount(1); await expect(page.locator('[data-mentor-id]')).toHaveAttribute('data-mentor-id','test-mentor-5');
      await expect(page.locator('[data-pentagon-ring]')).toHaveCount(0);
      await page.getByRole('button',{name:'Autres profils'}).click(); await expect(page.locator('[data-mentor-id]')).toHaveCount(5);
    }
  });
}

test('loading, error, retry and empty states remove stale profiles', async ({ page }) => {
  let release: () => void = ()=>{}; const waiting=new Promise<void>(resolve=>{release=resolve;});
  await page.route(`**${endpoint}`,async route=>{await waiting;await route.fulfill({status:503,json:{error:'Unavailable'}});});
  await page.goto('/');await expect(page.locator('#mentors')).toContainText('Chargement des mentors');release();
  await expect(page.locator('#mentors [role=alert]')).toBeVisible();await expect(page.locator('[data-mentor-id]')).toHaveCount(0);
  await page.unroute(`**${endpoint}`);await page.route(`**${endpoint}`,route=>route.fulfill({json:{data:[],demo:true}}));
  await page.getByRole('button',{name:'Réessayer',exact:true}).click();await expect(page.locator('#mentors')).toContainText('Aucun mentor');
});

test('long text, unknown modalities and missing image remain honest and bounded', async ({ page }) => {
  const data=Array.from({length:5},(_,index)=>({...fixture(index), name:index===0?'Nom de test très long '.repeat(12):fixture(index).name, specialty:'Spécialité '.repeat(60),description:'Description '.repeat(100),sessionTypes:undefined,format:undefined,practice:undefined,level:undefined,photoUrl:'/portrait-missing.webp'}));
  await page.route(`**${endpoint}`,route=>route.fulfill({json:{data,demo:true}}));await page.emulateMedia({reducedMotion:'reduce'});await open(page);
  await expect(page.locator('#mentors [data-active=true]')).toContainText('À confirmer avec le coach');
  await expect(page.locator('#mentors [data-active=true] img')).toHaveCount(0);
  await expect(page.locator('#mentors [data-active=true]')).not.toContainText('Niveau indiqué');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Face suivante',exact:true}).click();await idle(page);
});

test('full turns in both directions and focus survive reduced motion and resize', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});await open(page);
  for(let i=0;i<6;i++)await page.getByRole('button',{name:'Face suivante',exact:true}).click();
  await expect(page.locator('#mentors [data-step]')).toHaveAttribute('data-step','6');
  for(let i=0;i<12;i++)await page.getByRole('button',{name:'Face précédente',exact:true}).click();
  await expect(page.locator('#mentors [data-step]')).toHaveAttribute('data-step','-6');
  const stage=page.locator('#mentors [data-state]'); await stage.locator('[data-active=true] a').focus(); await page.keyboard.press('ArrowRight'); await expect(stage).toBeFocused(); await idle(page);
  await page.setViewportSize({width:390,height:900});await idle(page);
  expect(await page.locator('[data-pentagon-ring]').evaluate(element=>parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(.00001);
});

test('native touch swipe rotates the pentagon without trapping vertical scroll',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,viewport:{width:390,height:1000},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();
  try {await open(page);const stage=page.locator('#mentors [data-state]');await stage.scrollIntoViewIfNeeded();const box=await stage.boundingBox();const x=280,y=Math.max(100,box!.y+120);const before=await page.evaluate(()=>scrollY);const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*22,y}]});await page.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect(stage).toHaveAttribute('data-step','1');expect(Math.abs(await page.evaluate(()=>scrollY)-before)).toBeLessThan(3);
  }finally{await context.close();}
});

test('card to profile keeps identity, city and declared formats through the slow door transition', async ({ page,request },info) => {
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page);
  const payload=await(await request.get(endpoint)).json();const coach=payload.data[0];
  const link=page.locator('#mentors [data-active=true] a');const href=await link.getAttribute('href');expect(href).toContain(encodeURIComponent(coach.id));
  await link.click();await expect(page).toHaveURL(/\/coach\?/);await expect(page.locator('[data-door-layer]')).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('city')).toBe(coach.city);await expect(page.locator('[data-booking-name]')).toHaveText(coach.name);
  await page.locator('[data-booking-tab=apropos]').click();
  await expect(page.locator('[data-booking-session-types]')).toHaveText(coach.sessionTypes);
  await expect(page.locator('[data-booking-public-diplomas]')).toContainText('à compléter');
  await expect(page.locator('[data-booking-qualification]')).toHaveText('Profil validé dans le catalogue');
  expect(await page.locator('.de-booking-tabs-profile').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(28, 28, 28)');
  for (const tab of await page.locator('[data-booking-tab]').all()) expect(await tab.evaluate(element => getComputedStyle(element).color)).toBe('rgb(252, 251, 249)');
  await fs.mkdir(folder,{recursive:true});await page.screenshot({path:`${folder}/after-profile-${info.project.name}.png`});
  await page.locator('[data-booking-pane=apropos]').screenshot({path:`${folder}/after-profile-facts-${info.project.name}.png`});
});
