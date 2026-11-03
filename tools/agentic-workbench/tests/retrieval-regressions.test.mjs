import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retrieve,CONTEXT_BUDGET} from '../retrieval.mjs';
import {runAssistant} from '../workflow.mjs';
const chunk=(id,documentId,excerpt,extra={})=>({id,documentId,excerpt,path:'fixture.md',version:'fixture',priority:1,visibility:'internal',status:'active',...extra});
const run=(chunks,question)=>runAssistant({question,principal:'admin',load:async()=>chunks});
test('regression: contradictory passages in one document remain available',async()=>{
 const sources=[chunk('a','master','Commission reservations : 15 pourcent.'),chunk('b','master','Commission reservations : 10 pourcent.')];
 const result=await run(sources,'commission reservations');assert.equal(result.status,'sources');assert.equal(result.sources.length,2);assert(result.sources.every(s=>sources.some(c=>c.id===s.id&&c.excerpt===s.excerpt&&c.path===s.path&&c.version===s.version)));assert.match(result.reason,/aucune synthèse/);
});
test('regression: a rare isolated word cannot hide qualified candidates',async()=>{
 const sources=Array.from({length:8},(_,i)=>chunk('c'+i,'d'+i,i===0?'orchestration':'coach tarif'));
 const result=await run(sources,'coach tarif orchestration');assert.equal(result.status,'sources');assert(result.sources.every(s=>s.hits>=2));assert(!result.sources.some(s=>s.documentId==='d0'));
});
test('complementary passages survive while exact duplicate passages do not monopolize',()=>{
 const sources=[...Array.from({length:30},(_,i)=>chunk('dup'+i,'one','coach tarif principal')),chunk('extra','one','coach tarif secondaire'),chunk('other','two','coach tarif voisin')];
 const result=retrieve(sources,'coach tarif');assert.equal(result.length,3);assert.equal(result.filter(s=>s.documentId==='one').length,2);assert(result.some(s=>s.documentId==='two'));
});
test('passage, character and per-document budgets retain exact excerpts',()=>{
 const sources=Array.from({length:40},(_,i)=>chunk('c'+i,'d'+Math.floor(i/4),`coach tarif detail ${i} `+'x'.repeat(1100)));
 const result=retrieve(sources,'coach tarif');assert(result.length>1&&result.length<=CONTEXT_BUDGET.maxPassages);assert(result.reduce((n,c)=>n+c.excerpt.length,0)<=CONTEXT_BUDGET.maxCharacters);
 for(const doc of new Set(result.map(c=>c.documentId)))assert(result.filter(c=>c.documentId===doc).length<=CONTEXT_BUDGET.maxPerDocument);
 assert(result.every(c=>sources.some(s=>s.id===c.id&&s.excerpt===c.excerpt)));
});
test('insufficient, private and archived candidates cannot satisfy admission',async()=>{
 const sources=[chunk('one','a','coach'),chunk('private','b','coach tarif',{visibility:'private'}),chunk('old','c','coach tarif',{status:'archived'})];
 assert.equal((await run(sources,'coach tarif')).status,'abstained');assert.equal(retrieve(sources,'coach tarif').length,0);
});
test('oversized evidence is not silently truncated to manufacture a citation',()=>{
 assert.equal(retrieve([chunk('big','a','coach tarif '+'x'.repeat(8000))],'coach tarif').length,0);
});
