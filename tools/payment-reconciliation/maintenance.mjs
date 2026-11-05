import {digest,planReconciliation} from './engine.mjs';
import {localReadProvider} from './local-provider.mjs';
// OS-local maintenance. Authorization is resolved in the database, not from JSON flags.
export async function runMaintenance({store,token,apiKey,ids,mode='diagnose',limit=10,signal,timeoutMs,maxPages}){
 if(!['diagnose','resume'].includes(mode)||!Array.isArray(ids)||ids.length>100||ids.some(id=>typeof id!=='string'||!/^res-[A-Za-z0-9-]{1,120}$/.test(id))||!Number.isInteger(limit)||limit<1||limit>20)throw Error('Invalid bounded maintenance request');
 const targets=[...new Set(ids)];const environment=store.authorize(token,mode,targets);
 const provider=localReadProvider({environment,store,apiKey,signal,timeoutMs,maxPages});
 const context={environmentId:environment.id,platformAccountId:environment.platform};const results=[];
 for(const [index,target] of targets.slice(0,limit).entries()){
  let phase='storage';
  try{
   signal?.throwIfAborted();store.authorize(token,mode,[target]);const row=store.read(target);
   if(!row||row.id!==target){results.push({item:index+1,action:'manual',code:'reservation_missing'});continue;}
   const before=digest(row);phase='provider';const snapshot=await provider.readSnapshot(row);const plan=planReconciliation(row,snapshot,context);
   if(plan.action!=='patch'){results.push({item:index+1,...plan});continue;}
   if(mode==='diagnose'){results.push({item:index+1,action:'would_patch',code:plan.code,fields:Object.keys(plan.patch)});continue;}
   phase='storage';signal?.throwIfAborted();store.authorize(token,mode,[target]);
   const changed=store.compareAndSwap(target,before,plan.patch,()=>store.authorize(token,mode,[target]));results.push({item:index+1,action:changed?'updated':'retry',code:changed?'verified_transition':'concurrent_change',fields:Object.keys(plan.patch)});
  }catch{results.push({item:index+1,action:'retry',code:signal?.aborted?'cancelled':phase==='provider'?'provider_unavailable':'storage_unavailable'});}
 }
 return {mode,processed:results.length,remaining:Math.max(0,targets.length-limit),results,financialOperations:'not_supported',notifications:'not_sent'};
}
