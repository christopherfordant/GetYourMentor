import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const stopwords=new Set(['les','des','une','pour','dans','avec','est','que','qui','sur','comment','quel','quelle','quels','quelles','sont','mes','mon','peut','doit','faut']);
export const terms=value=>new Set((value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]{3,}/g)??[]).filter(t=>!stopwords.has(t)).map(t=>t.length>4?t.replace(/s$/,''):t));
// Same governed manifest and lexical baseline as scripts/evaluate-rag-corpus.mjs.
// Chunk scoring adds no embedding model and must not be described as semantic search.
export async function loadCorpus(root,signal){
 const base=await realpath(root);
 const manifest=JSON.parse(await readFile(path.join(base,'docs/architecture/rag-corpus.json'),{encoding:'utf8',signal}));
 if(!Array.isArray(manifest.documents)||manifest.documents.length>16)throw Error('Invalid corpus');
 const chunks=[];
 for(const document of manifest.documents){
  const file=await realpath(path.resolve(base,document.path));
  if(!file.startsWith(base+path.sep)||!file.endsWith('.md'))throw Error('Source outside corpus');
  const text=await readFile(file,{encoding:'utf8',signal});
  if(Buffer.byteLength(text)>1024*1024)throw Error('Source too large');
  const version=createHash('sha256').update(text).digest('hex');
  const pieces=text.split(/\r?\n\s*\r?\n/).filter(p=>p.trim());
  pieces.forEach((piece,index)=>{
   // Fixed-size chunks with deterministic identifiers, no generated paraphrases.
   for(let offset=0;offset<piece.length;offset+=1200){
    const excerpt=piece.slice(offset,offset+1200).trim();
    chunks.push({id:`${document.id}:${index}:${offset}`,documentId:document.id,path:document.path,priority:document.priority,version,excerpt,visibility:'internal',status:'active'});
   }
  });
 }
 return chunks;
}

export const CONTEXT_BUDGET=Object.freeze({maxPassages:8,maxCharacters:7200,maxPerDocument:3,diverseDocuments:5});
export function retrieve(chunks,question){
 const query=terms(question);if(!query.size)return [];
 const active=chunks.filter(c=>c.visibility==='internal'&&c.status==='active');
 // Count frequency per document, so splitting a long source adds no weight.
 const documents=new Map();
 for(const chunk of active){
  const present=documents.get(chunk.documentId)??new Set();
  for(const term of terms(chunk.excerpt))present.add(term);
  documents.set(chunk.documentId,present);
 }
 const frequency=new Map();
 for(const present of documents.values())for(const term of present)frequency.set(term,(frequency.get(term)??0)+1);
 const ranked=active.map(chunk=>{
  const present=terms(chunk.excerpt);
  const matched=[...query].filter(t=>present.has(t));
  const score=matched.reduce((total,term)=>{const df=frequency.get(term)??0;return total+Math.log(1+(documents.size-df+.5)/(df+.5));},0);
  return {...chunk,score:score*matched.length,hits:matched.length};
 // Enforce the same exploratory coverage requirement BEFORE ranking/selection.
 }).filter(c=>c.hits>=Math.min(2,query.size)).sort((a,b)=>b.score-a.score||a.priority-b.priority||a.id.localeCompare(b.id));
 return selectPassages(ranked);
}

// Shared context budget for offline evaluations; does not change lexical admission.
export function selectPassages(ranked){
 const selected=[],counts=new Map(),seen=new Set();let characters=0;
 const add=chunk=>{
  const key=JSON.stringify([chunk.documentId,chunk.excerpt.replace(/\s+/g,' ').trim()]);
  if(seen.has(key)||selected.length>=CONTEXT_BUDGET.maxPassages||(counts.get(chunk.documentId)??0)>=CONTEXT_BUDGET.maxPerDocument||characters+chunk.excerpt.length>CONTEXT_BUDGET.maxCharacters)return false;
  selected.push(chunk);seen.add(key);characters+=chunk.excerpt.length;counts.set(chunk.documentId,(counts.get(chunk.documentId)??0)+1);return true;
 };
 // First preserve document diversity, then retain complementary/contradictory
 // exact passages. No automatic semantic contradiction resolution is claimed.
 for(const chunk of ranked)if(!counts.has(chunk.documentId)&&counts.size<CONTEXT_BUDGET.diverseDocuments)add(chunk);
 for(const chunk of ranked)add(chunk);
 return selected;
}
