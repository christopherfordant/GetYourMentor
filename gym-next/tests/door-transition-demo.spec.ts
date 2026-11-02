import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const proof='../docs/assets/door-transition-2026-11-02';
const url='/design_assets/door-transition-2026-11-02/index.html';
for(const [size,width,height] of [['desktop',1440,900],['mobile',390,780]] as const){
  test(`capture source pages ${size}`,async({page})=>{
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:'reduce'});
    await fs.mkdir(proof,{recursive:true});
    for(const [name,route] of [['accueil','/'],['annuaire','/coachs?sport=football']]){
      await page.goto(route);await page.waitForLoadState('networkidle');
      const reject=page.getByRole('button',{name:'Refuser le non nécessaire',exact:true});
      if(await reject.isVisible())await reject.click();
      await expect(reject).not.toBeVisible();
      if(name==='annuaire')await expect(page.locator('[data-coach-card]').first()).toBeVisible();
      await page.evaluate(()=>document.fonts.ready);
      await expect.poll(()=>page.locator('img').evaluateAll(elements=>elements.filter(element=>{const box=element.getBoundingClientRect();return box.bottom>0&&box.top<innerHeight}).every(element=>(element as HTMLImageElement).complete&&(element as HTMLImageElement).naturalWidth>0))).toBe(true);
      await page.screenshot({path:`${proof}/${name}-${size}.png`});
    }
  });
}

for(const width of [390,1440]){
  test(`door demo opens opposite battants and brings destination forward at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:1000});
    await page.goto(url);const stage=page.locator('#stage');
    await expect(stage).toHaveAttribute('data-state','idle');
    await expect(stage).toHaveAttribute('data-page','accueil');
    await page.locator('#speed').selectOption('2200');
    await page.locator('#play').click();
    await expect(stage).toHaveAttribute('data-state','opening');
    const transforms=await stage.evaluate(element=>{
      element.getAnimations({subtree:true}).forEach(animation=>{animation.pause();animation.currentTime=Number(animation.effect!.getTiming().duration)*.2});
      const left=new DOMMatrix(getComputedStyle(element.querySelector('.left')!).transform);
      const right=new DOMMatrix(getComputedStyle(element.querySelector('.right')!).transform);
      const incoming=new DOMMatrix(getComputedStyle(element.querySelector('.incoming')!).transform);
      return {opposed:left.m13*right.m13<0,retreated:incoming.m43<0,scale:incoming.m11};
    });
    expect(transforms.opposed).toBe(true);expect(transforms.retreated).toBe(true);expect(transforms.scale).toBeLessThan(1);
    await page.screenshot({path:`${proof}/opening-${width}.png`});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    await stage.evaluate(element=>element.getAnimations({subtree:true}).forEach(animation=>animation.play()));
    await expect(stage).toHaveAttribute('data-state','idle');
    await expect(stage).toHaveAttribute('data-page','annuaire');
    expect(await stage.locator('.incoming').evaluate(element=>getComputedStyle(element).transform)).toBe('none');
    await page.screenshot({path:`${proof}/finished-${width}.png`});
  });
}

test('door demo supports explicit replay, escape, resize and no-motion path',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);
  const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-state','idle');
  expect(await stage.evaluate(element=>element.getAnimations({subtree:true}).length)).toBe(0);
  await page.locator('#speed').selectOption('2200');
  await page.locator('#play').evaluate((element:HTMLButtonElement)=>{element.click();element.click()});
  await expect(stage).toHaveAttribute('data-state','opening');
  await page.keyboard.press('Escape');
  await expect(stage).toHaveAttribute('data-page','annuaire');
  await expect(stage).toHaveAttribute('data-state','idle');
  await page.locator('#replay').click();await expect(stage).toHaveAttribute('data-state','opening');
  await page.setViewportSize({width:390,height:900});await expect(stage).toHaveAttribute('data-state','idle');
  await page.locator('#instant').click();await expect(stage).toHaveAttribute('data-page','accueil');
  expect(await stage.evaluate(element=>element.getAnimations({subtree:true}).length)).toBe(0);
  await expect(page.locator('#play')).toHaveAttribute('aria-disabled','false');
});

test('door demo reports missing snapshots instead of opening an empty destination',async({page})=>{
  await page.route('**/annuaire-desktop.webp',route=>route.abort());await page.goto(url);
  await expect(page.locator('#stage')).toHaveAttribute('data-state','error');
  await expect(page.getByRole('status')).toContainText('Captures indisponibles');
  await expect(page.locator('#play')).toBeDisabled();
  await expect(page.locator('#stage')).toHaveAttribute('data-state','error');
});
