import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {createPreview} from './preview.mjs';

async function fixture(t, entry='prototypes/design-assets/demo/index.html') {
  const root=await mkdtemp(path.join(os.tmpdir(),'gym-preview-'));
  t.after(async()=>{
    const resolved=path.resolve(root);
    assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));
    assert(path.basename(resolved).startsWith('gym-preview-'));
    await rm(resolved,{recursive:true,force:true});
  });
  await mkdir(path.join(root,'prototypes/design-assets/demo'),{recursive:true});
  await writeFile(path.join(root,'prototypes/design-assets/demo/index.html'),'<h1>Demo</h1>');
  await writeFile(path.join(root,'private.txt'),'not public');
  await writeFile(path.join(root,'prototypes/manifest.json'),JSON.stringify({version:1,entries:{'/design_assets/demo/index.html':{file:entry}}}));
  return root;
}
async function start(t,root){
  const server=await createPreview(root?{root}:{});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  return server.address().port;
}
function request(port,url,options={}){
  return new Promise((resolve,reject)=>{
    const req=http.request({hostname:'127.0.0.1',port,path:url,...options},res=>{
      const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));
    });req.on('error',reject);req.end();
  });
}
test('isolated preview serves only the explicit files and safe index',async t=>{
  const port=await start(t,await fixture(t));
  const index=await request(port,'/');assert.equal(index.status,200);assert.match(index.body.toString(),/Démonstrations locales/);
  const file=await request(port,'/design_assets/demo/index.html?x=1');assert.equal(file.status,200);assert.equal(file.body.toString(),'<h1>Demo</h1>');
  for(const url of ['/private.txt','/.git/config','/prototypes/manifest.json','/recherche','/api/test','/design_assets/demo/'])assert.equal((await request(port,url)).status,404);
  assert.equal((await request(port,'/design_assets/demo/index.html',{method:'HEAD'})).body.length,0);
  assert.equal((await request(port,'/',{method:'POST'})).status,405);
  assert.equal(file.headers['cache-control'],'no-store');assert.match(file.headers['content-security-policy'],/connect-src 'none'/);
});
test('traversal, malformed URLs, forged host and cross-origin access fail closed',async t=>{
  const port=await start(t,await fixture(t));
  for(const url of ['/design_assets/../private.txt','/design_assets/%2e%2e/private.txt','/design_assets/%5cprivate.txt','/design_assets/%00','/%ZZ'])assert.equal((await request(port,url)).status,400);
  assert.equal((await request(port,'/',{headers:{Host:'evil.example'}})).status,403);
  assert.equal((await request(port,'/',{headers:{Origin:'https://evil.example'}})).status,403);
});
test('unsafe manifest cannot expose arbitrary repository files',async t=>{
  const root=await fixture(t,'prototypes/design-assets/../../private.txt');
  await assert.rejects(createPreview({root}),/Unsafe/);
});
test('all actual preview resources match the preserved content hashes',async t=>{
  const root=path.resolve(import.meta.dirname,'../..');
  const manifest=JSON.parse(await readFile(path.join(root,'prototypes/manifest.json'),'utf8'));
  const port=await start(t);
  let moved=0;
  for(const [url,item] of Object.entries(manifest.entries)){
    const result=await request(port,url);assert.equal(result.status,200,url);
    assert.equal(createHash('sha256').update(result.body).digest('hex'),item.sha256,url);
    if(item.moved){moved++;await assert.rejects(readFile(path.join(root,'gym-next/public',url.slice(1))),{code:'ENOENT'});}
  }
  assert.equal(moved,6);
});
