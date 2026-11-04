// Offline evaluation only; stdin/stdout pipes, no HTTP endpoint or provider.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadCorpus,selectPassages} from './retrieval.mjs';
import {runAssistant,requiresHumanReview} from './workflow.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const input=JSON.parse(await new Promise(resolve=>{let s='';process.stdin.setEncoding('utf8');process.stdin.on('data',v=>s+=v);process.stdin.on('end',()=>resolve(s));}));
if(input.operation==='prepare'){
 const dataset=JSON.parse(await readFile(path.join(root,'docs/architecture/rag-comparison-2026-11-04.json'),'utf8'));
 const real=await loadCorpus(root);
 const fixtures=dataset.chunks.map(c=>({...c,path:'synthetic-fixture',priority:2,version:createHash('sha256').update(c.excerpt).digest('hex'),visibility:c.visibility??'internal',status:c.status??'active'}));
 const historical=JSON.parse(await readFile(path.join(root,'docs/architecture/rag-evaluation.json'),'utf8')).cases;
 const controls=JSON.parse(await readFile(path.join(root,'docs/architecture/rag-controls-2026-11-03.json'),'utf8')).cases;
 const cases=[...dataset.cases,...historical.map(c=>({...c,id:'historical:'+c.id,split:'historical',scope:'real',expectedStatus:c.expectedStatus??'sources'})),...controls.map(c=>({...c,id:'control:'+c.id,split:'historical',scope:'real',expectedStatus:c.expectedStatus??'sources'}))];
 const rows=[];
 for(const c of cases){
  const chunks=(c.scope==='real'?real:fixtures).filter(s=>!c.onlyDocuments||c.onlyDocuments.includes(s.documentId));
  let loaded=false;const start=performance.now();
  const result=await runAssistant({question:c.question,principal:c.principal??'local-owner',load:async()=>{loaded=true;return chunks;}});
  rows.push({...c,loaded,allowedIds:chunks.filter(s=>s.status==='active'&&s.visibility==='internal').map(s=>s.id),baseline:{status:result.status,ids:result.sources.map(s=>s.id),milliseconds:performance.now()-start},lexical:result.sources.map(s=>({id:s.id,score:s.score}))});
 }
 process.stdout.write(JSON.stringify({dataset,corpus:[...fixtures,...real],cases:rows}));
}else if(input.operation==='rank'){
 const byId=new Map(input.corpus.map(s=>[s.id,s]));const outputs=[];
 for(const request of input.requests){
  const c=input.cases[request.caseIndex],start=performance.now();
  if(!c.loaded){outputs.push({...request,status:c.baseline.status,ids:[],citationExact:true,milliseconds:performance.now()-start});continue;}
  const allowed=new Set(c.allowedIds.filter(id=>byId.get(id)?.visibility==='internal'&&byId.get(id)?.status==='active'));
  const candidates=(input.scores[request.caseIndex]??[]).filter(s=>allowed.has(s.id)&&s.score>=request.threshold).map(s=>({...byId.get(s.id),score:s.score})).sort((a,b)=>b.score-a.score||a.priority-b.priority||a.id.localeCompare(b.id));
  let selected=selectPassages(candidates);
  if(request.method==='hybrid'){
   const rrf=new Map();
   for(const list of [c.lexical,selected])list.forEach((s,i)=>rrf.set(s.id,(rrf.get(s.id)??0)+1/(60+i+1)));
   selected=selectPassages([...rrf].filter(([id])=>allowed.has(id)).map(([id,score])=>({...byId.get(id),score})).sort((a,b)=>b.score-a.score||a.priority-b.priority||a.id.localeCompare(b.id)));
  }
  const status=!selected.length?'abstained':requiresHumanReview(selected)?'review':'sources';
  outputs.push({...request,scores:undefined,status,ids:selected.map(s=>s.id),citationExact:selected.every(s=>s.excerpt===byId.get(s.id)?.excerpt&&s.version===byId.get(s.id)?.version),milliseconds:performance.now()-start});
 }
 process.stdout.write(JSON.stringify(outputs));
}else throw Error('Unknown offline operation');
