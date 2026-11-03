const {chromium}=require('../../../gym-next/node_modules/@playwright/test');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true}),results=[];
 const folder=path.resolve(__dirname,'../../../docs/assets/rag-fixes-2026-11-03');fs.mkdirSync(folder,{recursive:true});
 try{for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000}});await page.goto('http://127.0.0.1:4325/');await page.waitForSelector('.ticket');
  await page.evaluate(async()=>{const data=await (await fetch('/backlog.json')).json();localStorage.setItem('gym-kanban-local-v2',JSON.stringify({base:JSON.stringify(data.tickets),changes:{'GYM-A1.1':{status:'ready',manual:true}}}));});
  await page.reload();await page.waitForSelector('[data-status="ready"] [data-ticket="GYM-A1.1"]');
  await page.getByRole('button',{name:'Réinitialiser ma vue'}).click();
  const raw=JSON.stringify({base:'previous-source-version',changes:{'GYM-A1.1':{status:'ready',manual:true}}});
  await page.evaluate(raw=>localStorage.setItem('gym-kanban-local-v2',raw),raw);await page.reload();await page.waitForSelector('.ticket');
  await page.getByRole('button',{name:'Exporter mes anciens déplacements'}).waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>localStorage.getItem('gym-kanban-local-v2')),raw);
  assert.equal(await page.locator('[data-status="done"] [data-ticket="GYM-A1.1"]').count(),1);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Exporter mes anciens déplacements'}).click();const exported=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));
  assert.equal(exported.drafts[0].raw,raw);
  await page.locator('[data-ticket="GYM-A1.1"]').click();await page.selectOption('#ticket-status','ready');await page.getByRole('button',{name:'Enregistrer le statut'}).click();await page.reload();await page.waitForSelector('[data-status="ready"] [data-ticket="GYM-A1.1"]');
  assert.equal(await page.evaluate(()=>localStorage.getItem('gym-kanban-local-v2')),raw);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:path.join(folder,`preserved-drafts-${width}.png`),fullPage:true});results.push({width,legacySameBasePreserved:true,staleDraftNotApplied:true,oldBytesUnchanged:true,exportedOldDraft:true,newMovePersists:true,noPageOverflow:true});await page.close();
 }}finally{await browser.close();}
 fs.writeFileSync(path.join(folder,'drafts-browser.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
})().catch(error=>{console.error(error);process.exitCode=1;});
