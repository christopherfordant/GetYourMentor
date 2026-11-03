const {chromium}=require('../../../gym-next/node_modules/@playwright/test');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const directory=path.resolve(__dirname,'../../../docs/assets/agentic-2026-11-03');fs.mkdirSync(directory,{recursive:true});
 const browser=await chromium.launch({headless:true});const observations=[];
 try{for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4325/');await page.waitForSelector('.ticket');
  assert.equal(await page.locator('.ticket').count(),18);
  assert.equal(await page.locator('.agent').count(),5);
  await page.selectOption('#sprint','S1');assert.equal(await page.locator('.ticket').count(),10);
  await page.selectOption('#sprint','all');
  await page.locator('.ticket details summary').first().click();assert(await page.locator('.ticket details').first().getAttribute('open')!==null);
  await page.locator('#question').fill('commission reservations');await page.locator('#question').focus();await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement?.tagName),'BUTTON');
  const response=page.waitForResponse(r=>r.url().endsWith('/api/assistant')&&r.request().method()==='POST');await page.keyboard.press('Enter');
  assert.equal((await (await response).json()).status,'sources');await page.waitForSelector('.source');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:path.join(directory,`workbench-${width}.png`),fullPage:true});
  await page.locator('#assistant').screenshot({path:path.join(directory,`assistant-${width}.png`)});
  await page.locator('#question').fill('zyxwvutsrqponmlkjihgfedcba');await page.getByRole('button',{name:/Retrouver/}).click();await page.waitForFunction(()=>document.querySelector('#answer-status').textContent.includes('Aucune source'));
  observations.push({width,tickets:18,s1Tickets:10,roles:5,keyboard:true,citations:true,abstention:true,reducedMotion:true,horizontalPageOverflow:false});await page.close();
 }}finally{await browser.close();}
 fs.writeFileSync(path.join(directory,'browser.json'),JSON.stringify(observations,null,2));console.log(JSON.stringify(observations));
})().catch(error=>{console.error(error);process.exitCode=1;});
