import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import { coachProfiles } from '../lib/domain';
import { toPublicCoach } from '../lib/public-coach';
import { readMentorPreview } from '../lib/mentor-preview';
import { readPublicMentorRows } from '../lib/mentor-preview-query';
import { isLocalPortraitPreview } from '../lib/runtime';

const endpoint = '/api/coaches/preview';
const folder = '../docs/assets/mentors-integration-2026-11-02';
const fixture = (index: number) => ({ id: `test-mentor-${index}`, name: `Mentor de test ${index}`, sport: 'football', specialty: 'Accompagnement de test', city: 'Paris', priceFrom: 40, description: 'Présentation de démonstration.', sessionTypes: 'Individuel, duo', format: 'visio', practice: 'interieur', level: 'debutant' });
test('fictional portrait flag requires local acceptance and cannot activate for non-demo data',()=>{
  const keys=['GETYOURMENTOR_ACCEPTANCE_MODE','GETYOURMENTOR_ALLOW_DEMO','CI','NEXT_PUBLIC_APP_URL'];
  const previous=keys.map(key=>process.env[key]);
  try {
    Object.assign(process.env,{GETYOURMENTOR_ACCEPTANCE_MODE:'true',GETYOURMENTOR_ALLOW_DEMO:'true',CI:'true',NEXT_PUBLIC_APP_URL:'http://127.0.0.1:3004'});
    expect(isLocalPortraitPreview()).toBe(true);
    process.env.NEXT_PUBLIC_APP_URL='https://example.netlify.app';expect(isLocalPortraitPreview()).toBe(false);
    process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3004';process.env.GETYOURMENTOR_ALLOW_DEMO='false';expect(isLocalPortraitPreview()).toBe(false);
    expect(readMentorPreview({demo:false,data:[],showDemoPortraits:true}).showDemoPortraits).toBe(false);
    expect(()=>readMentorPreview({demo:true,data:[],showDemoPortraits:'yes'})).toThrow();
  } finally { keys.forEach((key,index)=>{if(previous[index]===undefined)delete process.env[key];else process.env[key]=previous[index];}); }
});
async function open(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Refuser le non nécessaire', exact: true }).click();
  await page.locator('#mentors').scrollIntoViewIfNeeded();
}


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
 test(`square fan, keyboard and circular navigation at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await open(page);
  await expect(page.locator('#mentors [data-fan-card]')).toHaveCount(9);
  await expect(page.locator('#mentors [data-demo-coach-portrait]')).toHaveCount(6);
  await expect(page.locator('[data-catalogue-action]')).toHaveCount(0);
  const stage=page.locator('#mentors [tabindex="0"]');
  for(let i=0;i<10;i++)await page.getByRole('button',{name:'Carte suivante',exact:true}).click();
  await expect(stage).toHaveAttribute('data-active','1');
  for(let i=0;i<11;i++)await page.getByRole('button',{name:'Carte précédente',exact:true}).click();
  await expect(stage).toHaveAttribute('data-active','8');
  await stage.locator('[data-active=true] a').focus();await page.keyboard.press('ArrowRight');await expect(stage).toBeFocused();await expect(stage).toHaveAttribute('data-active','0');
  expect(await stage.locator('[data-active=true]').evaluate(el=>el.clientWidth===el.clientHeight)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
for(const count of [1,2,5,6]) {
 test(`all ${count} supplied profiles remain in one fan`,async({page})=>{
  await page.route(`**${endpoint}`,route=>route.fulfill({json:{demo:true,data:Array.from({length:count},(_,i)=>fixture(i))}}));await open(page);
  await expect(page.locator('#mentors [data-fan-card]')).toHaveCount(count);
  await expect(page.getByRole('button',{name:'Autres profils'})).toHaveCount(0);
  if(count===1)await expect(page.getByRole('button',{name:'Carte suivante',exact:true})).toBeDisabled();
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
