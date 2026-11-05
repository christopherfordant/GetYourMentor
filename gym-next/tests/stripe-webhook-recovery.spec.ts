import {test,expect} from '@playwright/test';
import {createHmac} from 'node:crypto';
import {POST} from '../app/api/webhooks/stripe/route';
import {financialSnapshot} from '../lib/domain/commission';

let env:NodeJS.ProcessEnv,original:typeof fetch,settled:boolean,row:Record<string,unknown>,writes:number,providerReads:number;
const rid='res-recovery-fixture';
function request(patch:Record<string,unknown>={},signature=true){
 const payload=JSON.stringify({id:'evt_realistic_fixture',type:'checkout.session.completed',livemode:false,data:{object:{id:'cs_test_recovery',mode:'payment',status:'complete',payment_status:'paid',currency:'eur',amount_total:4000,payment_intent:'pi_recovery',customer_email:'sportif@example.com',metadata:{reservation_id:rid},...patch}}});
 const t=Math.floor(Date.now()/1000);const sig=createHmac('sha256','fixture-webhook-secret').update(`${t}.${payload}`).digest('hex');
 return new Request('http://127.0.0.1:3005/api/webhooks/stripe',{method:'POST',body:payload,headers:{'Content-Type':'application/json','stripe-signature':`t=${t},v1=${signature?sig:'0'.repeat(64)}`}});
}
test.beforeEach(()=>{
 env={...process.env};original=globalThis.fetch;settled=false;writes=0;providerReads=0;
 Object.assign(process.env,{PAYMENT_PROVIDER:'stripe',STRIPE_CONNECT_ENABLED:'true',STRIPE_ENVIRONMENT_ID:'recipe-accounts-v2',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'fixture-webhook-secret',SUPABASE_URL:'https://pqxqqbwesfrefzjoawmx.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'fixture-key'});
 delete process.env.TELEGRAM_BOT_TOKEN;delete process.env.RESEND_API_KEY;delete process.env.GYM_REAL_TEST_SERVICES;
 row={id:rid,owner_email:'sportif@example.com',coach_id:'coach-fixture',coach_name:'Demo',sport:'fitness',city:'Paris',service:'Recette',duration:'60 min',price:40,slots:[new Date(Date.now()+10*86400000).toISOString()],status:'accepted',created_at:new Date().toISOString(),financial_snapshot:financialSnapshot(40,1500,1),stripe_environment_id:'recipe-accounts-v2',stripe_checkout_session_id:'cs_test_recovery',stripe_connect_account_id:'acct_coach'};
 globalThis.fetch=async(i,init)=>{
  const url=String(i);
  if(url.includes('/gym_reservations')){if(init?.method==='PATCH'){writes++;Object.assign(row,JSON.parse(String(init.body)));}return Response.json([{...row}]);}
  if(url.includes('/gym_stripe_environments'))return Response.json([{id:'recipe-accounts-v2',platform_account_id:'acct_platform',kind:'sandbox',mode:'test'}]);
  if(url.endsWith('/v1/account'))return Response.json({id:'acct_platform',object:'account'});
  if(url.includes('/payment_intents/')){providerReads++;return Response.json({id:'pi_recovery',livemode:false,status:'succeeded',currency:'eur',amount:4000,application_fee_amount:600,transfer_data:{destination:'acct_coach'},metadata:{reservation_id:rid},latest_charge:{transfer:settled?'tr_fixture':null,application_fee:settled?'fee_fixture':null}});}
  throw Error('Unexpected fixture request');
 };
});
test.afterEach(()=>{globalThis.fetch=original;for(const k of Object.keys(process.env))if(!(k in env))delete process.env[k];Object.assign(process.env,env);});
test('Incomplete settlement yields retryable 503; later event persists payment; duplicate performs no writes',async()=>{
 expect((await POST(request())).status).toBe(503);expect(writes).toBe(0);expect(row.status).toBe('accepted');
 settled=true;expect((await POST(request())).status).toBe(200);expect(row.status).toBe('paid');expect(row.stripe_payment_intent_id).toBe('pi_recovery');expect(row.stripe_transfer_id).toBe('tr_fixture');expect(row.stripe_application_fee_id).toBe('fee_fixture');
 const priorWrites=writes,priorReads=providerReads;const replay=await POST(request());expect(replay.status).toBe(200);expect(await replay.json()).toMatchObject({processed:false});expect(writes).toBe(priorWrites);expect(providerReads).toBe(priorReads);
});
test('Invalid signature, amount and environment never mutate payment state',async()=>{
 settled=true;expect((await POST(request({},false))).status).toBe(400);expect(writes).toBe(0);expect(providerReads).toBe(0);
 expect((await POST(request({amount_total:1}))).status).toBe(409);expect(writes).toBe(0);
 row.stripe_environment_id='legacy-test';expect((await POST(request())).status).toBe(503);expect(writes).toBe(0);expect(providerReads).toBe(0);
});
test('Persistence outage remains retryable and does not mark payment paid',async()=>{
 settled=true;const good=globalThis.fetch;globalThis.fetch=async(i,init)=>init?.method==='PATCH'?new Response(null,{status:503}):good(i,init);
 expect((await POST(request())).status).toBe(503);expect(row.status).toBe('accepted');expect(row.stripe_payment_intent_id).toBeUndefined();
});

test('An event arriving after cancellation cannot resurrect a refunded reservation',async()=>{
 settled=true;row.status='cancelled';row.stripe_payment_intent_id='pi_recovery';row.stripe_refund_id='re_fixture';row.refund_status='succeeded';
 const response=await POST(request());expect(response.status).toBe(200);expect(await response.json()).toMatchObject({processed:false});expect(writes).toBe(0);expect(providerReads).toBe(0);expect(row.status).toBe('cancelled');
});
