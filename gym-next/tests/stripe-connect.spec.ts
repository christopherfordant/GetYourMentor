import {activeStripeEnvironment,claimStripeEnvironment} from '../lib/stripe-environment';
import {test,expect} from '@playwright/test';
import {checkoutConnectFields,connectOnboarding,verifyConnectSettlement} from '../lib/stripe-connect';
import {createCheckoutSession,refundStripePayment} from '../lib/payments';
import {financialSnapshot} from '../lib/domain/commission';
import {reservationToRow,reservationFromRow} from '../lib/repositories/reservation-mapper';
import type {Reservation} from '../lib/domain';

const reservation:Reservation={id:'reservation-test',stripeEnvironmentId:'recipe-accounts-v2',coachId:'coach-test',coachName:'Coach de démonstration',sport:'football',city:'Ville de test',service:'Séance test',duration:'1 heure',price:40,slots:[new Date(Date.now()+86400000*5).toISOString()],status:'accepted',createdAt:new Date().toISOString(),ownerEmail:'sportif@example.com',financials:financialSnapshot(40,1500,1)};
let original:typeof fetch;let env:NodeJS.ProcessEnv;let calls:Array<{url:string;body:URLSearchParams;headers:Headers}>;
test.beforeEach(()=>{
 env={...process.env};original=globalThis.fetch;calls=[];
 Object.assign(process.env,{STRIPE_ENVIRONMENT_ID:'recipe-accounts-v2',PAYMENT_PROVIDER:'stripe',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_CONNECT_ENABLED:'true',STRIPE_CONNECT_COUNTRY:'FR',SUPABASE_URL:'https://pqxqqbwesfrefzjoawmx.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-placeholder',NEXT_PUBLIC_APP_URL:'http://127.0.0.1:3005'});
 globalThis.fetch=async(input,init)=>{
  const url=String(input),body=new URLSearchParams(String(init?.body??'')),headers=new Headers(init?.headers);calls.push({url,body,headers});
  if(url.includes('/gym_stripe_environments'))return Response.json([{id:'recipe-accounts-v2',platform_account_id:'acct_platform',kind:'sandbox',mode:'test'}]);
  if(url.endsWith('/v1/account'))return Response.json({id:'acct_platform',object:'account'});
  if(url.includes('/rest/v1/gym_stripe_coach_bindings'))return Response.json([{stripe_account_id:'acct_fixture'}]);
  if(url.includes('/v2/core/accounts/acct_fixture'))return Response.json({id:'acct_fixture',object:'v2.core.account',livemode:false,metadata:{coach_id:'coach-test',gym_environment:'test',gym_stripe_environment:'recipe-accounts-v2'},configuration:{merchant:{capabilities:{card_payments:{status:'active'},stripe_balance:{payouts:{status:'active'}}}},recipient:{capabilities:{stripe_balance:{stripe_transfers:{status:'active'},payouts:{status:'active'}}}}}});
  if(url.endsWith('/checkout/sessions'))return Response.json({id:'cs_test_fixture',livemode:false,url:'https://checkout.stripe.com/c/pay/test_fixture'});
  if(url.includes('/rest/v1/gym_reservations'))return Response.json([{...reservationToRow(reservation),...(init?.method==='PATCH'?JSON.parse(String(init.body)):{}),...(init?.method==='PATCH'&&url.includes('stripe_environment_id=is.null')?{}:{status:'paid',stripe_payment_intent_id:'pi_fixture'}),stripe_checkout_session_id:init?.method==='PATCH'&&url.includes('stripe_environment_id=is.null')?null:'cs_test_fixture',stripe_connect_account_id:'acct_fixture'}]);
  if(url.endsWith('/account_links'))return Response.json({account:'acct_fixture',livemode:false,url:'https://accounts.stripe.com/setup/test_fixture'});
  if(url.includes('/payment_intents/'))return Response.json({id:'pi_fixture',livemode:false,status:'succeeded',currency:'eur',amount:4000,application_fee_amount:600,transfer_data:{destination:'acct_fixture'},metadata:{reservation_id:reservation.id},latest_charge:{transfer:'tr_fixture',application_fee:'fee_fixture'}});
  if(url.endsWith('/refunds'))return Response.json({id:'re_fixture',status:'succeeded'});
  throw Error('Unexpected test request');
 };
});
test.afterEach(()=>{globalThis.fetch=original;for(const k of Object.keys(process.env))if(!(k in env))delete process.env[k];Object.assign(process.env,env);});
test('Checkout uses immutable historical fee and server-side beneficiary, with stable idempotency',async()=>{
 await createCheckoutSession(reservation);const post=calls.find(c=>c.url.endsWith('/checkout/sessions'))!;
 expect(post.body.get('allowed_payment_method_types[0]')).toBe('card');expect(post.body.has('payment_method_types[0]')).toBe(false);expect(post.body.get('line_items[0][price_data][unit_amount]')).toBe('4000');expect(post.body.get('payment_intent_data[application_fee_amount]')).toBe('600');expect(post.body.get('payment_intent_data[transfer_data][destination]')).toBe('acct_fixture');expect(post.headers.get('Idempotency-Key')).toBe('gym-connect-checkout-recipe-accounts-v2-reservation-test-allowed1');
 expect(calls.filter(c=>c.url.includes('/gym_reservations')).at(-1)?.body.toString()).toContain('stripe_connect_account_id');
});
test('Checkout rejects unaccepted reservations and live keys before provider access',async()=>{
 await expect(createCheckoutSession({...reservation,status:'requested'})).rejects.toThrow();expect(calls).toHaveLength(0);
 process.env.STRIPE_SECRET_KEY='sk_live_forbidden';await expect(checkoutConnectFields(reservation)).rejects.toThrow();expect(calls).toHaveLength(0);
});
test('Connect rejects missing bindings, inactive capabilities and invalid commission',async()=>{
 const good=globalThis.fetch;globalThis.fetch=async()=>Response.json([]);await expect(checkoutConnectFields(reservation)).rejects.toThrow();
 globalThis.fetch=async(i,init)=>String(i).includes('/v2/core/accounts/')?Response.json({id:'acct_fixture',object:'v2.core.account',livemode:false,metadata:{coach_id:'coach-test',gym_environment:'test',gym_stripe_environment:'recipe-accounts-v2'},charges_enabled:false,payouts_enabled:false,capabilities:{transfers:'pending'}}):good(i,init);
 await expect(checkoutConnectFields(reservation)).rejects.toThrow();
 globalThis.fetch=good;await expect(checkoutConnectFields({...reservation,financials:undefined})).rejects.toThrow();
});
test('A binding to a different coach is rejected and onboarding link origin is constrained',async()=>{
 const good=globalThis.fetch;globalThis.fetch=async(i,init)=>String(i).includes('/v2/core/accounts/')?Response.json({id:'acct_fixture',object:'v2.core.account',livemode:false,metadata:{coach_id:'another-coach',gym_environment:'test',gym_stripe_environment:'recipe-accounts-v2'}}):good(i,init);
 await expect(checkoutConnectFields(reservation)).rejects.toThrow();
 globalThis.fetch=async(i,init)=>String(i).endsWith('/account_links')?Response.json({url:'https://example.com/wrong'}):good(i,init);
 await expect(connectOnboarding('coach-test','coach@example.com')).rejects.toThrow();
});
test('initial onboarding persists a test-only immutable binding and uses a stable creation key',async()=>{
 let linked=false;const good=globalThis.fetch;
 globalThis.fetch=async(i,init)=>{
  const url=String(i);if(url.includes('/rest/v1/gym_stripe_coach_bindings')){
   if(init?.method==='POST'){const body=JSON.parse(String(init.body));expect(body).toEqual({environment_id:'recipe-accounts-v2',coach_id:'coach-test',stripe_account_id:'acct_fixture'});expect(new Headers(init.headers).get('Prefer')).toBe('resolution=ignore-duplicates');linked=true;return new Response(null,{status:201});}
   return Response.json(linked?[{stripe_account_id:'acct_fixture'}]:[]);
  }
  if(url.endsWith('/v2/core/accounts')){const form=JSON.parse(String(init?.body));expect(form.metadata.gym_environment).toBe('test');expect(form.configuration.recipient.capabilities.stripe_balance.stripe_transfers.requested).toBe(true);expect(new Headers(init?.headers).get('Stripe-Version')).toBe('2026-10-28.endive');expect(new Headers(init?.headers).get('Idempotency-Key')).toBe('gym-connect-accounts-v2-create-recipe-accounts-v2-coach-test');return Response.json({id:'acct_fixture'});}
  return good(i,init);
 };
 await expect(connectOnboarding('coach-test','coach@example.com')).resolves.toEqual({mode:'test',url:'https://accounts.stripe.com/setup/test_fixture'});expect(linked).toBe(true);
});
test('unconfigured recipe storage fails before creating external accounts',async()=>{
 delete process.env.SUPABASE_SERVICE_ROLE_KEY;await expect(connectOnboarding('coach-test','coach@example.com')).rejects.toThrow();expect(calls).toHaveLength(0);
});
test('Settlement requires Stripe-confirmed fee, destination and exact transfer references',async()=>{
 const r={...reservation,stripeConnectAccountId:'acct_fixture'};
 await expect(verifyConnectSettlement(r,'pi_fixture')).resolves.toEqual({stripe_transfer_id:'tr_fixture',stripe_application_fee_id:'fee_fixture'});
 const good=globalThis.fetch;globalThis.fetch=async(i,init)=>{const response=await good(i,init);if(String(i).includes('/payment_intents/')){const p=await response.json();p.transfer_data.destination='acct_other';return Response.json(p);}return response;};
 await expect(verifyConnectSettlement(r,'pi_fixture')).rejects.toThrow();
});
test('Connect refunds reverse the transfer and refund the proportional application fee',async()=>{
 await refundStripePayment({paymentIntentId:'pi_fixture',amountCents:2000,reservationId:reservation.id,connectAccountId:'acct_fixture'});
 const post=calls.find(c=>c.url.endsWith('/refunds'))!;expect(post.body.get('reverse_transfer')).toBe('true');expect(post.body.get('refund_application_fee')).toBe('true');expect(post.headers.get('Idempotency-Key')).toBe('gym-refund-recipe-accounts-v2-reservation-test-2000');
});
test('Connect references survive the persistence mapper round trip',()=>{
 const r={...reservation,stripeConnectAccountId:'acct_fixture',stripeTransferId:'tr_fixture',stripeApplicationFeeId:'fee_fixture'};expect(reservationFromRow(reservationToRow(r))).toMatchObject(r);
});

test('Accounts v2 rejects live accounts, omitted includes and live onboarding links',async()=>{
 const good=globalThis.fetch;
 for(const patch of [{livemode:true},{configuration:null}]){
  globalThis.fetch=async(i,init)=>{const r=await good(i,init);if(String(i).includes('/v2/core/accounts/'))return Response.json({...await r.json(),...patch});return r;};
  await expect(checkoutConnectFields(reservation)).rejects.toThrow();
 }
 globalThis.fetch=async(i,init)=>String(i).endsWith('/account_links')?Response.json({account:'acct_fixture',livemode:true,url:'https://accounts.stripe.com/setup/test_fixture'}):good(i,init);
 await expect(connectOnboarding('coach-test','coach@example.com')).rejects.toThrow();
});
test('Accounts v2 requests include fields and sends JSON onboarding without accepting terms',async()=>{
 const good=globalThis.fetch;let checked=false;
 globalThis.fetch=async(i,init)=>{
  if(String(i).endsWith('/account_links')){
   const body=JSON.parse(String(init?.body));expect(body.use_case.type).toBe('account_onboarding');expect(body.use_case.account_onboarding.configurations).toBeUndefined();
   expect(body.use_case.account_onboarding.return_url).toBe('http://127.0.0.1:3005/compte?mode=coach&connect=returned');
   expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');expect(JSON.stringify(body)).not.toContain('tos_acceptance');checked=true;
  }
  return good(i,init);
 };
 await connectOnboarding('coach-test','coach@example.com');expect(checked).toBe(true);
 const read=calls.find(c=>c.url.includes('/v2/core/accounts/'))!;expect(new URL(read.url).searchParams.get('include[0]')).toBe('configuration.recipient');
});

test('Wrong platform key, absent environment and cross-environment reservations fail before Checkout',async()=>{
 const good=globalThis.fetch;
 globalThis.fetch=async(i,init)=>String(i).endsWith('/v1/account')?Response.json({id:'acct_wrong',object:'account'}):good(i,init);
 await expect(createCheckoutSession(reservation)).rejects.toThrow();expect(calls.some(c=>c.url.endsWith('/checkout/sessions'))).toBe(false);
 globalThis.fetch=good;delete process.env.STRIPE_ENVIRONMENT_ID;await expect(activeStripeEnvironment()).rejects.toThrow();
 process.env.STRIPE_ENVIRONMENT_ID='recipe-accounts-v2';
 globalThis.fetch=async(i,init)=>String(i).includes('/gym_reservations')?Response.json(init?.method==='PATCH'?[]:[{...reservationToRow(reservation),stripe_environment_id:'legacy-test'}]):good(i,init);
 await expect(createCheckoutSession(reservation)).rejects.toThrow();expect(calls.some(c=>c.url.endsWith('/checkout/sessions'))).toBe(false);
});
test('Lost environment claim re-reads persisted state and refuses a reservation cancelled concurrently',async()=>{
 globalThis.fetch=async(i,init)=>Response.json(init?.method==='PATCH'?[]:[{...reservationToRow(reservation),status:'cancelled'}]);
 await expect(claimStripeEnvironment(reservation.id,'recipe-accounts-v2')).rejects.toThrow();
});
test('Concurrent payment requests use one environment and identical provider idempotency keys',async()=>{
 await Promise.all([createCheckoutSession(reservation),createCheckoutSession(reservation)]);
 const posts=calls.filter(c=>c.url.endsWith('/checkout/sessions'));expect(posts).toHaveLength(2);
 expect(new Set(posts.map(c=>c.headers.get('Idempotency-Key'))).size).toBe(1);
 const claims=calls.filter(c=>c.url.includes('stripe_environment_id=is.null'));
 expect(claims).toHaveLength(2);expect(claims.every(c=>c.url.includes('status=eq.accepted'))).toBe(true);
});
test('Refund re-reads persisted payment ownership and rejects mismatched intent or environment',async()=>{
 await expect(refundStripePayment({paymentIntentId:'pi_other',amountCents:100,reservationId:reservation.id,connectAccountId:'acct_fixture'})).rejects.toThrow();
 expect(calls.some(c=>c.url.endsWith('/refunds'))).toBe(false);
 const good=globalThis.fetch;
 globalThis.fetch=async(i,init)=>{const r=await good(i,init);if(String(i).includes('/gym_reservations')){const rows=await r.json();rows[0].stripe_environment_id='legacy-test';return Response.json(rows);}return r;};
 await expect(refundStripePayment({paymentIntentId:'pi_fixture',amountCents:100,reservationId:reservation.id,connectAccountId:'acct_fixture'})).rejects.toThrow();expect(calls.some(c=>c.url.endsWith('/refunds'))).toBe(false);
});
test('Settlement rejects a reservation from another environment before reading its PaymentIntent',async()=>{
 await expect(verifyConnectSettlement({...reservation,stripeConnectAccountId:'acct_fixture',stripeEnvironmentId:'legacy-test'},'pi_fixture')).rejects.toThrow();
 expect(calls.some(c=>c.url.includes('/payment_intents/'))).toBe(false);
});

test('Existing Checkout is retrieved instead of creating another provider session',async()=>{
 const good=globalThis.fetch;
 globalThis.fetch=async(i,init)=>{
  const url=String(i);
  if(url.includes('/checkout/sessions/cs_test_fixture'))return Response.json({id:'cs_test_fixture',livemode:false,mode:'payment',status:'open',metadata:{reservation_id:reservation.id},amount_total:4000,currency:'eur',url:'https://checkout.stripe.com/c/pay/test_fixture'});
  const r=await good(i,init);if(url.includes('/gym_reservations')){const rows=await r.json();rows[0].stripe_checkout_session_id='cs_test_fixture';return Response.json(rows);}return r;
 };
 await expect(createCheckoutSession(reservation)).resolves.toEqual({checkoutUrl:'https://checkout.stripe.com/c/pay/test_fixture',sessionId:'cs_test_fixture'});
 expect(calls.some(c=>c.url.endsWith('/checkout/sessions'))).toBe(false);
});
