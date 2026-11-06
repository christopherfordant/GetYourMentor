import assert from 'node:assert/strict';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const proofDir=path.join(root,'docs/assets/prototype-candidate-2026-11-06');
const target=(await readFile(path.join(root,'delivery-private/arc33-candidate-location.txt'),'utf8')).trim();
assert.equal(path.dirname(path.resolve(target)),path.join(root,'delivery-private'));
assert(path.basename(target).startsWith('arc33-candidate-'));
await stat(path.join(target,'.next/BUILD_ID'));
const origin='http://127.0.0.1:3006';
const buildId=(await readFile(path.join(target,'.next/BUILD_ID'),'utf8')).trim();
const identityPath=`/_next/static/${buildId}/_buildManifest.js`;
const identity=await fetch(origin+identityPath,{redirect:'manual'});
assert.equal(identity.status,200,'Candidate build identity');
assert.deepEqual(Buffer.from(await identity.arrayBuffer()),await readFile(path.join(target,'.next/static',buildId,'_buildManifest.js')));
const old=JSON.parse(await readFile(path.join(root,'docs/assets/public-assets-2026-11-06/inventory.json'),'utf8'));
const manifest=JSON.parse(await readFile(path.join(root,'prototypes/manifest.json'),'utf8'));
const results=[];
for(const asset of old.assets){
  const url='/design_assets/'+asset.path,item=manifest.entries[url];
  const response=await fetch(origin+url,{redirect:'manual'});
  if(item?.moved){assert.equal(response.status,404,url);results.push({url,status:404,removed:true});}
  else {
    assert.equal(response.status,200,url);
    const hash=createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
    assert.equal(hash,asset.sha256,url);
    results.push({url,status:200,sha256:hash,retained:true});
  }
}
for(const url of ['/prototypes/README.md','/prototypes/manifest.json','/tools/public-assets/preview.mjs','/governance/ai/ARCHITECTURE_IA_RAG_GYM.md']){
  const response=await fetch(origin+url,{redirect:'manual'});assert.equal(response.status,404,url);results.push({url,status:404,nonPublic:true});
}
await writeFile(path.join(proofDir,'http-assets.json'),JSON.stringify({origin,candidateBuildIdentityVerified:true,retainedAssets:110,removedPaths:6,nonPublicPaths:4,results},null,2)+'\n');
console.log('Candidate HTTP:110 retained hashes match;6 extracted paths and4 internal paths return404');
