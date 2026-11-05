import {financialSnapshot} from '../../gym-next/lib/domain/commission.ts';
export function sample(){
 const row={id:'res-fixture-1',ownerEmail:'sportif@example.com',coachId:'coach-fixture',status:'accepted',price:40,financials:financialSnapshot(40,1500,1),stripeEnvironmentId:'recipe-accounts-v2',stripeCheckoutSessionId:'cs_test_fixture',stripeConnectAccountId:'acct_coach'};
 const snapshot={environmentId:'recipe-accounts-v2',platformAccountId:'acct_platform',platformVerified:true,livemode:false,boundCoachId:'coach-fixture',boundAccountId:'acct_coach',
  checkout:{object:'checkout.session',id:'cs_test_fixture',livemode:false,mode:'payment',status:'complete',payment_status:'paid',amount_total:4000,currency:'eur',payment_intent:'pi_fixture',customer_email:'sportif@example.com',metadata:{reservation_id:row.id}},
  intent:{object:'payment_intent',id:'pi_fixture',livemode:false,status:'succeeded',amount:4000,currency:'eur',application_fee_amount:600,transfer_data:{destination:'acct_coach'},metadata:{reservation_id:row.id},latest_charge:{object:'charge',id:'ch_fixture',payment_intent:'pi_fixture',livemode:false,paid:true,captured:true,amount:4000,currency:'eur',transfer:'tr_fixture',application_fee:'fee_fixture'}},
  refunds:{has_more:false,data:[]}};
 return {fixture:true,context:{permission:'reconcile-local-fixtures',environmentId:'recipe-accounts-v2',platformAccountId:'acct_platform',mode:'test'},rows:[row],snapshots:{[row.id]:snapshot}};
}
export function refunded(status='succeeded'){
 const f=sample(),r=f.rows[0],s=f.snapshots[r.id];Object.assign(r,{status:'cancelled',stripePaymentIntentId:'pi_fixture',refundAmount:40,refundStatus:'pending'});
 s.refunds.data=[{object:'refund',id:'re_fixture',payment_intent:'pi_fixture',amount:4000,currency:'eur',status,transfer_reversal:'trr_fixture'}];
 s.transfer={object:'transfer',id:'tr_fixture',livemode:false,destination:'acct_coach',amount:4000,currency:'eur',source_transaction:'ch_fixture',amount_reversed:4000,reversals:{has_more:false,data:[{object:'transfer_reversal',id:'trr_fixture',transfer:'tr_fixture',source_refund:'re_fixture',amount:4000,currency:'eur'}]}};
 s.fee={object:'application_fee',id:'fee_fixture',livemode:false,account:'acct_coach',charge:'ch_fixture',amount:600,currency:'eur',amount_refunded:600,refunds:{has_more:false,data:[{object:'fee_refund',id:'fr_fixture',fee:'fee_fixture',amount:600,currency:'eur'}]}};
 return f;
}
