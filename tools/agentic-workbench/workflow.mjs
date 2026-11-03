import {retrieve,terms,CONTEXT_BUDGET} from './retrieval.mjs';
const suspicious=/(ignore (?:all |previous)|ignorez les instructions|révèle.*secret|reveal.*secret|system prompt|exfiltrat)/i;
const mutation=/(?:paie|payer|payez|annule|annuler|confirme|confirmer|modifie|modifier|supprime|supprimer|rembourse)\s+(?:ma|la|une|cette|mon|le|un|cette)?\s*(?:réservation|reservation|paiement|compte|transaction)/i;

export async function runAssistant({question,principal,load,timeoutMs=2000}){
 const trace=[];
 const result=(status,reason,sources=[])=>({status,reason,sources,trace,mode:'extractive-lexical',contextBudget:CONTEXT_BUDGET,modelCalls:0,embeddingCalls:0});
 trace.push('authorize');
 if(principal!=='local-owner'&&principal!=='admin')return result('denied','Accès documentaire interne requis.');
 trace.push('validate');
 if(typeof question!=='string'||question.trim().length<3||question.length>240)return result('invalid','Question attendue : 3 à 240 caractères.');
 if(mutation.test(question)||suspicious.test(question))return result('abstained','Lecture documentaire uniquement. Aucune action métier ni instruction externe exécutée.');
 trace.push('retrieve');
 const controller=new AbortController();let timer;
 try{
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('timeout'));},timeoutMs);});
  const chunks=await Promise.race([load(controller.signal),deadline]);
  const sources=retrieve(chunks,question);
  trace.push('check');
  if(!sources.length)return result('abstained','Aucune source suffisamment reliée à la question.');
  // Conservative exploratory gate, not a calibrated semantic confidence score.
  const required=Math.min(2,terms(question).size);
  if(!required||!sources.some(source=>source.hits>=required))return result('abstained','Les correspondances sont insuffisantes ; précisez la question.');
  if(sources.some(s=>suspicious.test(s.excerpt)))return result('review','Une source contient une instruction suspecte ; revue humaine nécessaire.');
  // No synthesis: even conflicting sources stay distinct and must be reviewed.
  trace.push('cite');
  return result('sources','Extraits documentaires à vérifier ; aucune synthèse générée ni arbitrage automatique des contradictions.',sources);
 }catch{
  trace.push('stop');return result('unavailable','Recherche indisponible ou délai dépassé. Aucun appel externe de secours.');
 }finally{clearTimeout(timer);controller.abort();}
}
