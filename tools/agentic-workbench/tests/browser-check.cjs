const {chromium}=require('../../../gym-next/node_modules/@playwright/test');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const directory=path.resolve(__dirname,'../../../docs/assets/kanban-2026-11-03');fs.mkdirSync(directory,{recursive:true});
 const origin=process.env.GYM_WORKBENCH_URL||'http://127.0.0.1:4325';
 const browser=await chromium.launch({headless:true});const observations=[];
 try{for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000},hasTouch:width===390,isMobile:width===390,reducedMotion:'reduce'});
  await page.goto(origin);await page.waitForSelector('.ticket');
  assert.equal(await page.locator('.ticket').count(),13);assert.equal(await page.locator('.lane-title').count(),5);
  assert.equal(await page.locator('.agent').count(),5);
  await page.selectOption('#sprint','S1');assert.equal(await page.locator('.ticket').count(),7);
  await page.selectOption('#sprint','all');
  await page.selectOption('#role','Architecture');assert.equal(await page.locator('.ticket').count(),3);await page.selectOption('#role','all');
  await page.locator('#search').fill('GYM-A4.1');assert.equal(await page.locator('.ticket').count(),1);await page.locator('#search').fill('');
  if(width===390)await page.locator('[data-ticket="GYM-A1.1"]').tap();else await page.locator('[data-ticket="GYM-A1.1"]').click();assert(await page.locator('dialog').evaluate(d=>d.open));
  await page.selectOption('#ticket-status','ready');await page.getByRole('button',{name:'Enregistrer le statut'}).click();
  await page.reload();await page.waitForSelector('.ticket');assert.equal(await page.locator('[data-parent="GYM-A1"][data-status="ready"] [data-ticket="GYM-A1.1"]').count(),1);
  await page.getByRole('button',{name:'Réinitialiser ma vue'}).click();
  await page.locator('[data-ticket="GYM-A4.1"]').click();await page.selectOption('#ticket-status','done');await page.getByRole('button',{name:'Enregistrer le statut'}).click();assert(await page.locator('dialog').evaluate(d=>d.open));assert.match(await page.locator('#ticket-feedback').textContent(),/preuve/);
  await page.locator('#ticket-evidence').fill('Fixture de recette : observation manuelle, aucun test réel revendiqué.');await page.locator('#ticket-verified').check();await page.getByRole('button',{name:'Enregistrer le statut'}).click();
  assert.equal(await page.locator('[data-parent="GYM-A4"][data-status="done"] [data-ticket="GYM-A4.1"]').count(),1);
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Exporter l’état JSON'}).click();const downloadedFile=await (await downloaded).path();const exported=JSON.parse(fs.readFileSync(downloadedFile,'utf8'));assert.equal(exported.exportKind,'manual-browser-planning-copy');assert.equal(exported.tickets.length,18);assert(exported.tickets.find(t=>t.id==='GYM-A4.1').manuallyVerifiedAt);
  await page.getByRole('button',{name:'Réinitialiser ma vue'}).click();
  if(width===1440){await page.locator('[data-ticket="GYM-A1.1"]').dragTo(page.locator('[data-parent="GYM-A1"][data-status="ready"]'));assert.equal(await page.locator('[data-parent="GYM-A1"][data-status="ready"] .ticket').count(),1);await page.getByRole('button',{name:'Réinitialiser ma vue'}).click();}
  await page.screenshot({path:path.join(directory,`kanban-${width}.png`),fullPage:true});
  await page.getByRole('button',{name:'Documentation',exact:true}).click();
  await page.locator('#question').fill('commission reservations');await page.locator('#question').focus();await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement?.tagName),'BUTTON');
  const response=page.waitForResponse(r=>r.url().endsWith('/api/assistant')&&r.request().method()==='POST');await page.keyboard.press('Enter');
  assert.equal((await (await response).json()).status,'sources');await page.waitForSelector('.source');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#assistant').screenshot({path:path.join(directory,`assistant-${width}.png`)});
  await page.locator('#question').fill('zyxwvutsrqponmlkjihgfedcba');await page.getByRole('button',{name:/Retrouver/}).click();await page.waitForFunction(()=>document.querySelector('#answer-status').textContent.includes('Aucune source'));
  observations.push({width,subTickets:13,parentLanes:5,s1SubTickets:7,roles:5,dialog:true,statusPersistence:true,dragDrop:width===1440,keyboard:true,citations:true,abstention:true,reducedMotion:true,horizontalPageOverflow:false});await page.close();
 }}finally{await browser.close();}
 fs.writeFileSync(path.join(directory,'browser.json'),JSON.stringify(observations,null,2));console.log(JSON.stringify(observations));
})().catch(error=>{console.error(error);process.exitCode=1;});
