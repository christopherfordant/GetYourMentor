import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {request as httpRequest} from 'node:http';
import {fileURLToPath} from 'node:url';
const origin='http://127.0.0.1:4326';let child;
before(async()=>{
 child=spawn(process.execPath,[fileURLToPath(new URL('../server.mjs',import.meta.url))],{env:{GYM_WORKBENCH_PORT:'4326'},stdio:['ignore','pipe','pipe'],windowsHide:true});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('server timeout')),5000);child.stdout.on('data',()=>{clearTimeout(timer);resolve();});child.once('exit',code=>{clearTimeout(timer);reject(Error('server exited '+code));});});
});
after(()=>{child?.kill();});
test('only the explicit UI assets are served, with protective headers',async()=>{
 const page=await fetch(origin);assert.equal(page.status,200);assert.match(page.headers.get('content-security-policy'),/frame-ancestors 'none'/);
 assert.equal((await fetch(origin+'/DOCUMENT_MAITRE_GYM.md')).status,404);
 assert.equal((await fetch(origin+'/api/assistant')).status,404);
 // fetch may normalize Host; use a raw HTTP request to exercise DNS-rebinding protection.
 const refused=await new Promise((resolve,reject)=>{const req=httpRequest(origin,{headers:{Host:'attacker.invalid'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);req.end();});
 assert.equal(refused,403);
});
test('cross-origin requests cannot invoke retrieval',async()=>{
 const response=await fetch(origin+'/api/assistant',{method:'POST',headers:{Origin:'https://attacker.invalid','Content-Type':'application/json'},body:JSON.stringify({question:'commission reservations'})});assert.equal(response.status,403);
});
test('local read-only query returns exact citations; malformed and large input fail',async()=>{
 const send=body=>fetch(origin+'/api/assistant',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body});
 const response=await send(JSON.stringify({question:'commission reservations'}));assert.equal(response.status,200);const data=await response.json();assert.equal(data.status,'sources');assert(data.sources.every(s=>s.path&&s.version.length===64));
 assert.equal((await send('invalid')).status,400);assert.equal((await send('x'.repeat(3000))).status,413);
});
