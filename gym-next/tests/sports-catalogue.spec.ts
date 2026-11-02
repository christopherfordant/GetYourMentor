import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { discoverySports, canonicalSportSlug, isSportSlug, knownDiscoverySport, sportEquipment } from '../lib/sports-catalogue';
import { validateCoachProfileInput } from '../lib/domain/validation/coach-profile-input';
import { normalizeSearchFilters } from '../lib/domain/validation/search-filters';
import { parseSessionFilters, matchesSession } from '../lib/domain/session-discovery';
import { readMentorPreview } from '../lib/mentor-preview';
import { readBookingSummary } from '../lib/booking-summary';
import { isCoachReservation } from '../components/account-legacy/coach-request-data';
const folder='../docs/assets/sports-catalogue-2026-11-02';
const slot=new Date(Date.now()+600*86400000).toISOString();
test('shared catalogue reaches profiles, sessions and both booking contracts without losing historic identifiers',async()=>{
  expect(discoverySports).toHaveLength(14);expect(new Set(discoverySports.map(([s])=>s)).size).toBe(14);
  const schema=await fs.readFile('../supabase/schemas/app.sql','utf8');const migration=await fs.readFile('../supabase/migrations/20261102_expand_sports_catalogue.sql','utf8');
  for(const [slug,label] of discoverySports){
    const stored=canonicalSportSlug(slug)!;expect(isSportSlug(stored)).toBe(true);expect(knownDiscoverySport(label)?.[0]).toBe(slug);expect(validateCoachProfileInput({sport:slug})).toBeNull();
    expect(normalizeSearchFilters({sport:slug}).sport).toBe(stored);expect(schema).toContain(`'${stored}'`);expect(migration).toContain(`'${stored}'`);
    const filter=parseSessionFilters(new URLSearchParams({sport:slug}));expect(filter.sport).toBe(slug);
    expect(matchesSession({sport:stored,slots:[slot],individualPrice:40,capacity:2},filter)).toBe(true);
    const dto={id:'synthetic-only',name:'Fixture',sport:stored,specialty:'Test',city:'Paris',priceFrom:40};expect(readMentorPreview({data:[dto],demo:true}).data[0].sport).toBe(stored);
    const reservation={id:'synthetic-booking',coachId:'synthetic-only',coachName:'Fixture',sport:stored,city:'Paris',service:'Test',duration:'45min',price:40,slots:[slot],createdAt:new Date().toISOString(),status:'requested',participantCount:1,authenticated:true};
    expect(isCoachReservation(reservation)).toBe(true);expect(readBookingSummary(reservation,reservation.id).sport).toBe(stored);
    await fs.access(`public/design_assets/header-equipment-2026-10-30/${sportEquipment[slug][0]}.webp`);
  }
  expect(canonicalSportSlug('metiers-de-la-forme')).toBe('fitness');expect(knownDiscoverySport('fitness')?.[0]).toBe('metiers-de-la-forme');
  for(const unknown of ['constructor','tennis','__proto__']){expect(validateCoachProfileInput({sport:unknown})).not.toBeNull();expect(normalizeSearchFilters({sport:unknown}).sport).toBe('__invalid__');expect(parseSessionFilters(new URLSearchParams({sport:unknown})).sport).toBe('__invalid__');}
});
for(const [slug,label] of discoverySports)test(`public discovery and collective filters preserve ${slug}`,async({page,request})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`/recherche?sport=${slug}&city=Lyon`);
  await expect(page.locator('[data-sport-query]')).toHaveValue(slug);await expect(page.locator('[data-sport-query] option')).toHaveCount(15);
  const consent=page.getByRole('button',{name:'Refuser le non nécessaire',exact:true});if(await consent.count())await consent.click();
  await page.locator('[data-sport-city]').fill('Lyon');await page.getByRole('button',{name:'Explorer les coachs'}).click();await expect(page).toHaveURL(new RegExp(`sport=${slug}&city=Lyon`));
  await expect(page.locator('h1')).toContainText(slug==='mma'?'mma':label.toLowerCase());await expect(page.locator('[data-directory-sport-input]')).toHaveValue(label);
  const response=await request.get(`/api/coaches?sport=${slug}&city=Lyon`);expect(response.status()).toBe(200);const payload=await response.json();for(const coach of payload.data)expect(coach.sport).toBe(canonicalSportSlug(slug));
  await page.goto(`/seances?sport=${slug}&city=Lyon`);await expect(page.locator('select[name=sport]')).toHaveValue(slug);await expect(page.locator('select[name=sport] option')).toHaveCount(15);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('unknown sports and fitness alias never silently turn into football',async({page,request})=>{
  await page.goto('/recherche?sport=fitness');await expect(page.locator('[data-sport-query]')).toHaveValue('metiers-de-la-forme');
  await page.goto('/coachs?sport=fitness');await expect(page.locator('[data-directory-sport-input]')).toHaveValue('Fitness');
  for(const sport of ['constructor','unknown-sport']){
    await page.goto(`/recherche?sport=${sport}`);await expect(page.locator('p[role=alert]')).toContainText('Discipline inconnue');await expect(page.getByRole('button',{name:'Explorer les coachs'})).toBeDisabled();
    await page.goto(`/coachs?sport=${sport}`);await expect(page.locator('h1')).toHaveText('Discipline inconnue');expect((await(await request.get(`/api/coaches?sport=${sport}`)).json()).data).toEqual([]);
    await page.goto(`/seances?sport=${sport}`);await expect(page.locator('p[role=alert]')).toContainText('Discipline inconnue');await expect(page.locator('select[name=sport]')).toHaveValue('__invalid__');
  }
  await page.goto('/coach?sport=padel');await expect(page.getByRole('heading',{name:'Profil coach indisponible'})).toBeVisible();
});
test('owner-authorized profile editing persists every discipline without changing price or ownership',async({request})=>{
  const response=await request.post('/api/auth/sign-in',{data:{email:'coach@example.com',role:'coach',password:'demo-password'}});expect(response.status()).toBe(200);
  const headers={Cookie:response.headers()['set-cookie'].split(';')[0]};
  const original=(await(await request.get('/api/coaches/steven-fordant')).json()).data;
  try{
    for(const [slug] of discoverySports){expect((await request.patch('/api/coaches/steven-fordant',{headers,data:{sport:slug}})).status()).toBe(200);const coach=(await(await request.get('/api/coaches/steven-fordant')).json()).data;expect(coach.sport).toBe(canonicalSportSlug(slug));expect(coach.priceFrom).toBe(original.priceFrom);const rows=(await(await request.get(`/api/coaches?sport=${slug}`)).json()).data;expect(rows.map((r:{id:string})=>r.id)).toContain(original.id);}
    expect((await request.patch('/api/coaches/steven-fordant',{headers,data:{sport:'unknown-sport'}})).status()).toBe(400);
    expect((await request.patch('/api/coaches/madison-seck',{headers,data:{sport:'padel'}})).status()).toBe(403);
  }finally{expect((await request.patch('/api/coaches/steven-fordant',{headers,data:{sport:original.sport}})).status()).toBe(200);}
});
test('coach editor exposes the whole catalogue without submitting unrelated profile fields',async({page,request,baseURL})=>{
  const login=await request.post('/api/auth/sign-in',{data:{email:'coach@example.com',role:'coach',password:'demo-password'}});expect(login.status()).toBe(200);
  const raw=login.headers()['set-cookie'].split(';')[0];const at=raw.indexOf('=');await page.context().addCookies([{name:raw.slice(0,at),value:raw.slice(at+1),url:baseURL!}]);
  await page.goto('/compte?mode=coach');const field=page.getByRole('combobox',{name:'Discipline principale',exact:true});await expect(field.locator('option')).toHaveCount(discoverySports.length);await field.selectOption('padel');await expect(field).toHaveValue('padel');
});
for(const width of [390,1440])test(`catalogue content, fields, neutral artwork and keyboard at ${width}`,async({page})=>{
  await page.setViewportSize({width,height:1100});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const consent=page.getByRole('button',{name:'Refuser le non nécessaire',exact:true});if(await consent.count())await consent.click();
  await expect(page.locator('.sports[aria-label="Les disciplines proposées"] a')).toHaveCount(14);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await fs.mkdir(folder,{recursive:true});await page.screenshot({path:`${folder}/home-${width}.png`});
  await page.goto('/recherche?sport=padel&city=Lyon');await expect(page.locator('[data-sport-illustration-fallback]')).toContainText('Padel');await expect(page.locator('[data-sport-illustration]')).toHaveCount(0);
  await page.locator('[data-sport-query]').focus();await page.keyboard.press('Tab');await expect(page.locator('[data-sport-city]')).toBeFocused();await page.screenshot({path:`${folder}/padel-${width}.png`,fullPage:true});
  await page.goto('/plan-du-site');
  for(const [slug] of discoverySports)await expect(page.locator(`main a[href="/recherche?sport=${slug}"]`)).toHaveCount(1);
});
