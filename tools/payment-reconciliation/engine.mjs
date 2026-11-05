import {createHash} from 'node:crypto';
import {financialSnapshot,eurosToCents,refundedCommissionCents} from '../../gym-next/lib/domain/commission.ts';

export const digest = row => createHash('sha256').update(JSON.stringify(row)).digest('hex');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const cents=n=>Number.isSafeInteger(n)&&n>=0;
const ref=(v,prefix)=>typeof v==='string'&&new RegExp('^'+prefix+'[A-Za-z0-9_]+$').test(v);
const stop=code=>({action:'manual',code});

// Deliberately fixture-only. No HTTP, money movement or notification port exists.
export function planReconciliation(row,snapshot,context){
 if(!row||!snapshot||snapshot.environmentId!==context.environmentId||row.stripeEnvironmentId!==context.environmentId
  ||snapshot.platformAccountId!==context.platformAccountId||snapshot.platformVerified!==true||snapshot.livemode!==false)return stop('environment_mismatch');
 const f=row.financials;
 try{if(!f||f.currency!=='eur'||!cents(f.grossCents)||f.grossCents===0||!Number.isSafeInteger(f.commissionVersion)||f.commissionVersion<1
  ||!Object.entries(financialSnapshot(row.price,f.commissionBps,f.commissionVersion)).every(([k,v])=>f[k]===v))return stop('financial_snapshot_invalid');}catch{return stop('financial_snapshot_invalid');}
 if(!['accepted','paid','cancelled'].includes(row.status))return stop('reservation_not_reconcilable');
 if(snapshot.boundCoachId!==row.coachId||snapshot.boundAccountId!==row.stripeConnectAccountId)return stop('coach_binding_mismatch');
 if(!ref(row.stripeCheckoutSessionId,'cs_test_')||!ref(row.stripeConnectAccountId,'acct_')||!row.ownerEmail)return stop('references_missing');
 const c=snapshot.checkout;
 if(!c||c.object!=='checkout.session'||c.id!==row.stripeCheckoutSessionId||c.livemode!==false||c.mode!=='payment'
  ||c.metadata?.reservation_id!==row.id||c.amount_total!==f.grossCents||c.currency!=='eur'
  ||(c.customer_details?.email??c.customer_email)!==row.ownerEmail)return stop('checkout_mismatch');
 if(c.payment_status!=='paid'||c.status!=='complete')return {action:'none',code:'payment_not_confirmed'};
 const pi=snapshot.intent;
 if(!pi||pi.object!=='payment_intent'||!ref(pi.id,'pi_')||pi.id!==c.payment_intent||pi.livemode!==false||pi.status!=='succeeded'
  ||pi.metadata?.reservation_id!==row.id||pi.amount!==f.grossCents||pi.currency!=='eur'||pi.application_fee_amount!==f.platformFeeCents
  ||pi.transfer_data?.destination!==row.stripeConnectAccountId)return stop('payment_mismatch');
 const charge=pi.latest_charge;
 if(!charge||charge.object!=='charge'||charge.payment_intent!==pi.id||charge.livemode!==false||charge.paid!==true||charge.captured!==true||charge.amount!==f.grossCents||charge.currency!=='eur'
  ||!ref(charge.transfer,'tr_')||(f.platformFeeCents>0&&!ref(charge.application_fee,'fee_')))return stop('settlement_incomplete');
 const refs={stripePaymentIntentId:pi.id,stripeTransferId:charge.transfer,stripeApplicationFeeId:charge.application_fee??null};
 for(const [k,v] of Object.entries(refs))if(row[k]&&row[k]!==v)return stop('persisted_reference_mismatch');
 const list=snapshot.refunds;
 if(!list||list.has_more!==false||!Array.isArray(list.data))return stop('refund_search_incomplete');
 if(list.data.some(r=>r.object!=='refund'||r.payment_intent!==pi.id||!ref(r.id,'re_')||r.currency!=='eur'||!cents(r.amount)||r.amount>f.grossCents))return stop('refund_mismatch');
 // Lost cancellation intent cannot be reconstructed by guessing a date or policy.
 if(row.status!=='cancelled'&&list.data.length)return stop('refund_without_local_cancellation');
 if(row.status!=='cancelled'&&(row.stripeRefundId||['pending','succeeded'].includes(row.refundStatus)||row.refundAmount>0))return stop('local_refund_intent_requires_review');
 let patch={...refs};
 if(row.status==='accepted')patch.status='paid';
 if(row.status==='cancelled'){
  if(row.refundStatus==='not_required'&&!row.stripePaymentIntentId)return stop('cancelled_unpaid_late_payment');
  let amount;try{amount=eurosToCents(row.refundAmount);}catch{return stop('refund_intent_missing');}
  if(!amount||amount>f.grossCents)return stop('refund_intent_missing');
  if(list.data.length!==1)return stop(list.data.length?'refund_ambiguous':'refund_not_found');
  const refund=list.data[0];
  if(refund.amount!==amount||(row.stripeRefundId&&row.stripeRefundId!==refund.id))return stop('refund_mismatch');
  if(['failed','canceled','requires_action'].includes(refund.status))return stop('refund_'+refund.status);
  if(!['pending','succeeded'].includes(refund.status))return stop('refund_status_unknown');
  if(row.refundStatus==='succeeded'&&refund.status!=='succeeded')return stop('refund_state_regression');
  if(refund.status==='succeeded'){
   const transfer=snapshot.transfer,fee=snapshot.fee,expectedFee=refundedCommissionCents(f,amount);
   if(!transfer||transfer.id!==charge.transfer||transfer.object!=='transfer'||transfer.livemode!==false
    ||transfer.destination!==row.stripeConnectAccountId||transfer.amount!==f.grossCents||transfer.currency!=='eur'||transfer.source_transaction!==charge.id
    ||transfer.amount_reversed!==amount||transfer.reversals?.has_more!==false||transfer.reversals?.data?.length!==1
    ||!ref(refund.transfer_reversal,'trr_')||transfer.reversals.data[0].object!=='transfer_reversal'||transfer.reversals.data[0].transfer!==transfer.id
    ||transfer.reversals.data[0].id!==refund.transfer_reversal||transfer.reversals.data[0].source_refund!==refund.id
    ||transfer.reversals.data[0].amount!==amount||transfer.reversals.data[0].currency!=='eur')return stop('transfer_reversal_unverified');
   if(f.platformFeeCents>0&&(!fee||fee.id!==charge.application_fee||fee.object!=='application_fee'||fee.livemode!==false||fee.account!==row.stripeConnectAccountId||fee.currency!=='eur'
    ||(fee.charge!==charge.id&&fee.originating_transaction!==charge.id)||fee.amount!==f.platformFeeCents||fee.amount_refunded!==expectedFee||fee.refunds?.has_more!==false||fee.refunds?.data?.length!==1
    ||fee.refunds.data[0].object!=='fee_refund'||!ref(fee.refunds.data[0].id,'fr_')||fee.refunds.data[0].fee!==fee.id||fee.refunds.data[0].amount!==expectedFee||fee.refunds.data[0].currency!=='eur'))return stop('fee_refund_unverified');
   patch.refundedPlatformFeeCents=expectedFee;
  }
  patch.stripeRefundId=refund.id;patch.refundStatus=refund.status;
 }
 // Never rewrite unchanged references or historical business fields.
 patch=Object.fromEntries(Object.entries(patch).filter(([k,v])=>!same(row[k]??null,v??null)));
 return Object.keys(patch).length?{action:'patch',code:'verified_transition',patch}:{action:'none',code:'already_consistent'};
}

export async function reconcileBatch({ids,mode='diagnose',limit=10,context,store,provider}){
 if(!['diagnose','resume'].includes(mode)||!Number.isInteger(limit)||limit<1||limit>20
  ||!Array.isArray(ids)||ids.length>100||ids.some(id=>typeof id!=='string'||!/^res-[A-Za-z0-9-]{1,120}$/.test(id)))throw Error('Invalid bounded request');
 if(context?.permission!=='reconcile-local-fixtures'||context.mode!=='test'||!context.environmentId||!ref(context.platformAccountId,'acct_')
  ||store.kind!=='local-fixture'||provider.kind!=='local-fixture')throw Error('Only authorized local fixtures supported');
 const unique=[...new Set(ids)],results=[];
 for(const [index,id] of unique.slice(0,limit).entries()){
  let phase='storage';
  try{
   const row=await store.read(id);if(!row){results.push({item:index+1,action:'manual',code:'reservation_missing'});continue;}
   if(row.id!==id){results.push({item:index+1,action:'manual',code:'reservation_identity_mismatch'});continue;}
   const before=digest(row);phase='provider';const snapshot=await provider.readSnapshot(row);const plan=planReconciliation(row,snapshot,context);
   if(plan.action!=='patch'){results.push({item:index+1,...plan});continue;}
   const fields=Object.keys(plan.patch);
   if(mode==='diagnose'){results.push({item:index+1,action:'would_patch',code:plan.code,fields});continue;}
   phase='storage';const updated=await store.compareAndSwap(id,before,plan.patch);
   results.push({item:index+1,action:updated?'updated':'retry',code:updated?'verified_transition':'concurrent_change',fields});
  }catch{results.push({item:index+1,action:'retry',code:phase==='provider'?'provider_unavailable':'storage_unavailable'});}
 }
 return {mode,processed:results.length,remaining:Math.max(0,unique.length-limit),results,notifications:'not_sent',financialOperations:'not_supported'};
}

// CAS covers the full row, not just status. Suitable for a shared local fixture store.
export function localFixtureStore(rows){
 const data=structuredClone(rows);let writes=0;
 return {kind:'local-fixture',read:async id=>structuredClone(data.find(r=>r.id===id)??null),
  compareAndSwap:async(id,expected,patch)=>{const row=data.find(r=>r.id===id);if(!row||digest(row)!==expected)return false;Object.assign(row,structuredClone(patch));writes++;return true;},
  snapshot:()=>structuredClone(data),writes:()=>writes};
}
