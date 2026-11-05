import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,unlink,rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {sample} from './fixtures.mjs';
test('CLI diagnosis and explicit resume preserve input and refuse overwriting output',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gym-reconciliation-'));try{
  const input=join(dir,'fixture.json'),diagnostic=join(dir,'diagnostic.json'),output=join(dir,'resume.json');await writeFile(input,JSON.stringify(sample()));const original=await readFile(input,'utf8');
  const invoke=(mode,dest)=>spawnSync(process.execPath,[resolve('tools/payment-reconciliation/cli.mjs'),'--input',input,'--mode',mode,'--output',dest],{encoding:'utf8'});
  let r=invoke('diagnose',diagnostic);assert.equal(r.status,0);let data=JSON.parse(await readFile(diagnostic,'utf8'));assert.equal(data.rows[0].status,'accepted');assert.equal(data.report.results[0].action,'would_patch');
  r=invoke('resume',output);assert.equal(r.status,0);data=JSON.parse(await readFile(output,'utf8'));assert.equal(data.rows[0].status,'paid');assert.equal(await readFile(input,'utf8'),original);
  const saved=await readFile(output,'utf8');assert.equal(invoke('resume',output).status,1);assert.equal(await readFile(output,'utf8'),saved);assert.equal(invoke('resume',input).status,1);assert.equal(await readFile(input,'utf8'),original);
 }finally{for(const name of ['fixture.json','diagnostic.json','resume.json']){try{await unlink(join(dir,name));}catch(e){if(e.code!=='ENOENT')throw e;}}await rmdir(dir);}
});
