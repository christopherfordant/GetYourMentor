import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {runAssistant} from '../../../tools/agentic-workbench/workflow.mjs';
import {loadCorpus} from '../../../tools/agentic-workbench/retrieval.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url)),origin='http://127.0.0.1:4325';
const assets=[];
for(const name of ['app.js','board-policy.mjs','backlog.json']){
 const local=fs.readFileSync(new URL('../../../tools/agentic-workbench/'+name,import.meta.url));
 const served=Buffer.from(await (await fetch(origin+'/'+name)).arrayBuffer());assert(local.equals(served));
 assets.push({name,sha256:createHash('sha256').update(served).digest('hex'),equalToDisk:true});
}
const question='commission reservations';
const live=await (await fetch(origin+'/api/assistant',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({question})})).json();
const local=await runAssistant({question,principal:'local-owner',load:signal=>loadCorpus(root,signal)});
assert.deepEqual(live,local);
const base={documentId:'master',path:'fixture.md',version:'fixture',priority:1,visibility:'internal',status:'active'};
const contradiction=await runAssistant({question,principal:'admin',load:async()=>[{...base,id:'a',excerpt:'Commission reservations 15 pourcent.'},{...base,id:'b',excerpt:'Commission reservations 10 pourcent.'}]});
console.log(JSON.stringify({origin,checkout:root,assets,apiMatchesLocalEngine:true,contextBudget:live.contextBudget,realSources:live.sources,syntheticContradiction:contradiction.sources},null,2));
