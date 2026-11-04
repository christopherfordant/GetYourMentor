// Local diagnostic only. No model, database, network or independent gold claims.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadCorpus} from './retrieval.mjs';
import {runAssistant} from './workflow.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=path.join(root,'docs/assets/rag-quality-2026-11-04');await mkdir(out,{recursive:true});
const before=JSON.parse(await readFile(path.join(out,'lexical-before.json'),'utf8'));
const datasetBytes=await readFile(path.join(root,'docs/architecture/rag-comparison-2026-11-04.json'));
const dataset=JSON.parse(datasetBytes);const hash=b=>createHash('sha256').update(b).digest('hex');
if(hash(datasetBytes)!==before.datasetSha256)throw Error('Frozen dataset changed');
const real=await loadCorpus(root);
const fixture=dataset.chunks.map(c=>({...c,path:'synthetic-fixture',priority:2,version:hash(c.excerpt),visibility:c.visibility??'internal',status:c.status??'active'}));
const correct=(c,r,corpus)=>r.status===c.expectedStatus&&(!c.expectedIds?.length||c.expectedIds.every(id=>r.ids.includes(id)))&&(!c.expectedDocuments?.length||c.expectedDocuments.some(id=>r.ids.some(cid=>corpus.find(s=>s.id===cid)?.documentId===id)));
const rows=[];
for(const old of before.cases){
 const c=dataset.cases.find(c=>c.id===old.id)??old;
 const corpus=(c.scope==='real'||old.id.startsWith('historical:')||old.id.startsWith('control:')?real:fixture).filter(s=>!c.onlyDocuments||c.onlyDocuments.includes(s.documentId));
 const result=await runAssistant({question:old.question,principal:c.principal??'local-owner',load:async()=>corpus});
 const after={status:result.status,ids:result.sources.map(s=>s.id)};
 rows.push({id:old.id,before:old.result,after,beforeCorrect:correct(old,old.result,corpus),afterCorrect:correct(old,after,corpus)});
}
await writeFile(path.join(out,'lexical-after.json'),JSON.stringify({datasetSha256:hash(datasetBytes),purpose:'Diagnostic replay after correction; previously observed cases, not independent validation',rows},null,2));
const questions=before.cases.filter(c=>c.id.startsWith('historical:')&&c.expectedStatus==='sources').slice(0,6);
const annotations=[];
for(const c of questions){
 const result=await runAssistant({question:c.question,principal:'local-owner',load:async()=>real});
 const candidates=result.sources.filter(s=>c.expectedDocuments.includes(s.documentId)).slice(0,2);
 annotations.push({id:c.id,question:c.question,status:'proposed-pending-human-review',humanValidated:false,justification:'Candidate matching the historical expected document; relevance and completeness still require human passage-level review.',candidates:await Promise.all(candidates.map(async s=>{
  const text=await readFile(path.join(root,s.path),'utf8');const offset=text.indexOf(s.excerpt);if(offset<0)throw Error('Citation not found');
  return {id:s.id,path:s.path,documentVersion:s.version,excerptSha256:hash(s.excerpt),startLine:text.slice(0,offset).split('\n').length,endLine:text.slice(0,offset+s.excerpt.length).split('\n').length,excerpt:s.excerpt};
 }))});
}
await writeFile(path.join(out,'annotations-proposed.json'),JSON.stringify({humanValidatedCount:0,exhaustive:false,annotations},null,2));
let md='# Passages proposés à la relecture humaine\n\nAucune annotation validée par un humain. Ces candidats automatiques ne constituent pas un jeu de référence indépendant. Pour chaque question : confirmer/rejeter les passages, ajouter les omissions, noter le motif et la date.\n';
for(const a of annotations){md+=`\n## ${a.id}\n\n${a.question}\n\nStatut : proposé, à vérifier. Justification : document historiquement attendu ; pertinence exacte et exhaustivité non validées.\n`;
 for(const s of a.candidates)md+=`\n- ${s.id} — ${s.path}:${s.startLine}–${s.endLine}, version ${s.documentVersion}\n\n> ${s.excerpt.replace(/\r?\n/g,'\n> ')}\n`;
 md+='\nDécision humaine : ______ ; passages manquants : ______ ; motif/date : ______\n';
}
await writeFile(path.join(root,'docs/RAG_ANNOTATIONS_A_RELIRE_2026-11-04.md'),md);
console.log(JSON.stringify({cases:rows.length,before:rows.filter(r=>r.beforeCorrect).length,after:rows.filter(r=>r.afterCorrect).length,regressions:rows.filter(r=>r.beforeCorrect&&!r.afterCorrect).map(r=>r.id),annotations:annotations.length,humanValidated:0}));
