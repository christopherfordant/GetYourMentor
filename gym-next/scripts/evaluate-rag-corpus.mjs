import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadCorpus} from '../../tools/agentic-workbench/retrieval.mjs';
import {runAssistant} from '../../tools/agentic-workbench/workflow.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dataset=process.argv.includes('--controls')?'rag-controls-2026-11-03.json':'rag-evaluation.json';
const evaluation=JSON.parse(fs.readFileSync(path.join(root,'docs/architecture',dataset),'utf8'));
const chunks=await loadCorpus(root);
let failures=0;
for(const testCase of evaluation.cases){
 const result=await runAssistant({question:testCase.question,principal:'local-owner',load:async()=>chunks});
 // Preserve the original three-document acceptance window, exercising the
 // actual assistant instead of a separate whole-document ranking proxy.
 const cited=result.sources.slice(0,3).map(source=>source.documentId);
 const missing=(testCase.expectedDocuments??[]).filter(id=>!cited.includes(id));
 const badStatus=result.status!==(testCase.expectedStatus??'sources');
 const ungrounded=result.sources.some(source=>!chunks.some(chunk=>chunk.id===source.id&&chunk.documentId===source.documentId&&chunk.version===source.version&&chunk.path===source.path&&chunk.excerpt===source.excerpt));
 if(missing.length||badStatus||ungrounded){failures++;console.error(`FAIL ${testCase.id}: missing=${missing.join(',')} status=${result.status} ungrounded=${ungrounded}`);}
 else console.log(`PASS ${testCase.id}: ${result.status} ${cited.join(', ')}`);
}
if(failures){console.error(`Évaluation RAG lexicale échouée : ${failures} cas.`);process.exitCode=1;}
else console.log(`Évaluation RAG lexicale réussie : ${evaluation.cases.length} cas, citations exactes et statuts contrôlés.`);
