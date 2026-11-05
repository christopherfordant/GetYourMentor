import {spawn} from 'node:child_process';
import {digest,planReconciliation} from './engine.mjs';
import {localReadProvider} from './local-provider.mjs';
import {reservationFromRow} from '../../gym-next/lib/repositories/reservation-mapper.ts';
const literal=value=>"'"+String(value).replaceAll("'","''")+"'";
export function localPostgres({psql,host='127.0.0.1',port,user,database='postgres'}){
 if(host!=='127.0.0.1'||!Number.isInteger(port)||port<1024||port>65535||database!=='postgres'||!/^[a-z_][a-z0-9_]{0,62}$/.test(user)||!psql)throw Error('Isolated local PostgreSQL required');
 const env={};for(const [k,v] of Object.entries(process.env))if(/^(SystemRoot|windir|PATH|TEMP|TMP|LOCALAPPDATA|APPDATA|USERPROFILE)$/i.test(k))env[k]=v;Object.assign(env,{PGCONNECT_TIMEOUT:'2',PGCLIENTENCODING:'UTF8'});
 return sql=>new Promise((resolve,reject)=>{
  const child=spawn(psql,['-X','-q','-A','-t','-v','ON_ERROR_STOP=1','--no-password','-h',host,'-p',String(port),'-U',user,'-d',database],{env,windowsHide:true,stdio:['pipe','pipe','pipe']});let out='';const timer=setTimeout(()=>child.kill(),6000);
  child.stdout.on('data',data=>{out+=data;if(out.length>2*1024*1024)child.kill();});child.stderr.resume();child.on('error',()=>{clearTimeout(timer);reject(Error('Local database unavailable'));});child.on('exit',code=>{clearTimeout(timer);code===0?resolve(out.trim()):reject(Error('Local database request refused'));});child.stdin.on('error',()=>{});child.stdin.end("SET statement_timeout='4s';SET lock_timeout='2s';SET standard_conforming_strings=on;\n"+sql);
 });
}
export function postgresStore({query,environmentId,origin}){
 const expected=new Map(),schema='gym_reconciliation_private';
 const json=async sql=>{const result=await query(sql);return result?JSON.parse(result):null;};
 const authorize=async(mode,ids)=>{const result=await json(`SELECT ${schema}.authorize(${literal(environmentId)},ARRAY[${ids.map(literal).join(',')}]::text[],${literal(mode)});`);return {...result,origin};};
 async function read(id){const snapshot=await json(`SELECT ${schema}.snapshot(${literal(environmentId)},${literal(id)});`);if(!snapshot)return null;const row={...reservationFromRow(snapshot.row),__pgExpected:snapshot};expected.set(digest(row),snapshot);if(expected.size>100)expected.delete(expected.keys().next().value);return row;}
 const names={status:'status',stripePaymentIntentId:'stripe_payment_intent_id',stripeTransferId:'stripe_transfer_id',stripeApplicationFeeId:'stripe_application_fee_id',stripeRefundId:'stripe_refund_id',refundStatus:'refund_status',refundedPlatformFeeCents:'refunded_platform_fee_cents'};
 async function compareAndSwap(id,before,patch){const snapshot=expected.get(before);if(!snapshot||snapshot.row.id!==id)return false;if(Object.keys(patch).some(k=>!names[k]))throw Error('Patch refused');const mapped=Object.fromEntries(Object.entries(patch).map(([k,v])=>[names[k],v]));return json(`SELECT to_jsonb(${schema}.cas(${literal(environmentId)},${literal(id)},${literal(JSON.stringify(snapshot))}::jsonb,${literal(JSON.stringify(mapped))}::jsonb));`);}
 return {authorize,read,compareAndSwap,binding:async(env,coach,id)=>{if(env!==environmentId)throw Error('Environment refused');return json(`SELECT to_jsonb(${schema}.binding(${literal(env)},${literal(id)}));`);},
  recordIntent:async(id,before,intent)=>{const snapshot=expected.get(before);if(!snapshot||snapshot.row.id!==id)return false;return json(`SELECT to_jsonb(${schema}.record_intent(${literal(environmentId)},${literal(id)},${literal(JSON.stringify(snapshot))}::jsonb,${literal(JSON.stringify(intent))}::jsonb));`);}};
}
export async function runPostgresMaintenance({store,ids,apiKey,mode='diagnose',limit=10}){
 if(!['diagnose','resume'].includes(mode)||!Array.isArray(ids)||ids.length>100||ids.some(id=>typeof id!=='string'||!/^res-[A-Za-z0-9-]{1,120}$/.test(id))||!Number.isInteger(limit)||limit<1||limit>20)throw Error('Bounded request refused');
 const unique=[...new Set(ids)],env=await store.authorize(mode,unique),provider=localReadProvider({environment:env,store,apiKey});const results=[];
 for(const [index,id] of unique.slice(0,limit).entries()){
  let phase='storage';try{
   const row=await store.read(id);if(!row){results.push({item:index+1,action:'manual',code:'reservation_missing'});continue;}
   const before=digest(row);phase='provider';const snapshot=await provider.readSnapshot(row),plan=planReconciliation(row,snapshot,{environmentId:env.id,platformAccountId:env.platform});
   if(plan.action!=='patch'){results.push({item:index+1,...plan});continue;}
   if(mode==='diagnose'){results.push({item:index+1,action:'would_patch',fields:Object.keys(plan.patch)});continue;}
   phase='storage';const changed=await store.compareAndSwap(id,before,plan.patch);results.push({item:index+1,action:changed?'updated':'retry',code:changed?'verified_transition':'concurrent_change'});
  }catch{results.push({item:index+1,action:'retry',code:phase==='provider'?'provider_unavailable':'storage_unavailable'});}
 }
 return {mode,processed:results.length,remaining:Math.max(0,unique.length-limit),results,notifications:'not_sent',financialOperations:'not_supported'};
}
