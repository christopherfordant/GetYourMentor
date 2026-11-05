import {test,expect} from '@playwright/test';
import {checkoutConnectFields,connectOnboarding,verifyConnectSettlement} from '../lib/stripe-connect';
import {createCheckoutSession,refundStripePayment} from '../lib/payments';
import {financialSnapshot} from '../lib/domain/commission';
import {reservationToRow,reservationFromRow} from '../lib/repositories/reservation-mapper';
import type {Reservation} from '../lib/domain';

const reservation:Reservation={id:'reservation-test',coachId:'coach-test',coachName:'Coach de démonstration',sport:'football',city:'Ville de test',service:'Séance test',duration:'1 heure',price:40,slots:[new Date(Date.now()+86400000*5).toISOString()],status:'accepted',createdAt:new Date().toISOString(),ownerEmail:'sportif@example.com',financials:financialSnapshot(40,1500,1)};
let original:typeof fetch;let env:NodeJS.ProcessEnv;let calls:Array<{url:string;body:URLSearchParams;headers:Headers}>;
test.beforeEach(()=>{
 env={...process.env};original=globalThis.fetch;calls=[];
 Object.assign(process.env,{PAYMENT_PROVIDER:'stripe',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_CONNECT_ENABLED:'true',STRIPE_CONNECT_COUNTRY:'FR',SUPABASE_URL:'https://pqxqqbwesfrefzjoawmx.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-placeholder',NEXT_PUBLIC_APP_URL:'http://127.0.0.1:3005'});
 globalThis.fetch=async(input,init)=>{
  const url=String(input),body=new URLSearchParams(String(init?.body??'')),headers=new Headers(init?.headers);calls.push({url,body,headers});
  if(url.includes('/rest/v1/gym_stripe_coach_accounts'))return Response.json([{stripe_account_id:'acct_fixture'}]);
  if(url.includes('/v1/accounts/acct_fixture'))return Response.json({id:'acct_fixture',metadata:{coach_id:'coach-test',gym_environment:'test'},charges_enabled:true,payouts_enabled:true,capabilities:{transfers:'active'}});
  if(url.endsWith('/checkout/sessions'))return Response.json({id:'cs_test_fixture',livemode:false,url:'https://checkout.stripe.com/c/pay/test_fixture'});
  if(url.includes('/rest/v1/gym_reservations'))return Response.json([{...reservationToRow(reservation),stripe_checkout_session_id:'cs_test_fixture',stripe_connect_account_id:'acct_fixture'}]);
  if(url.endsWith('/account_links'))return Response.json({url:'https://connect.stripe.com/setup/test_fixture'});
  if(url.includes('/payment_intents/'))return Response.json({id:'pi_fixture',livemode:false,status:'succeeded',currency:'eur',amount:4000,application_fee_amount:600,transfer_data:{destination:'acct_fixture'},metadata:{reservation_id:reservation.id},latest_charge:{transfer:'tr_fixture',application_fee:'fee_fixture'}});
  if(url.endsWith('/refunds'))return Response.json({id:'re_fixture',status:'succeeded'});
  throw Error('Unexpected test request');
 };
});
test.afterEach(()=>{globalThis.fetch=original;for(const k of Object.keys(process.env))if(!(k in env))delete process.env[k];Object.assign(process.env,env);});
test('Checkout uses immutable historical fee and server-side beneficiary, with stable idempotency',async()=>{
 await createCheckoutSession(reservation);const post=calls.find(c=>c.url.endsWith('/checkout/sessions'))!;
 expect(post.body.get('line_items[0][price_data][unit_amount]')).toBe('4000');expect(post.body.get('payment_intent_data[application_fee_amount]')).toBe('600');expect(post.body.get('payment_intent_data[transfer_data][destination]')).toBe('acct_fixture');expect(post.headers.get('Idempotency-Key')).toBe('gym-connect-checkout-reservation-test');
 expect(calls.find(c=>c.url.includes('/gym_reservations'))?.body.toString()).toContain('stripe_connect_account_id');
});
test('Checkout rejects unaccepted reservations and live keys before provider access',async()=>{
 await expect(createCheckoutSession({...reservation,status:'requested'})).rejects.toThrow();expect(calls).toHaveLength(0);
 process.env.STRIPE_SECRET_KEY='sk_live_forbidden';await expect(checkoutConnectFields(reservation)).rejects.toThrow();expect(calls).toHaveLength(0);
});
test('Connect rejects missing bindings, inactive capabilities and invalid commission',async()=>{
 const good=globalThis.fetch;globalThis.fetch=async()=>Response.json([]);await expect(checkoutConnectFields(reservation)).rejects.toThrow();
 globalThis.fetch=async(i,init)=>String(i).includes('/v1/accounts/')?Response.json({id:'acct_fixture',metadata:{coach_id:'coach-test',gym_environment:'test'},charges_enabled:false,payouts_enabled:false,capabilities:{transfers:'pending'}}):good(i,init);
 await expect(checkoutConnectFields(reservation)).rejects.toThrow();
 globalThis.fetch=good;await expect(checkoutConnectFields({...reservation,financials:undefined})).rejects.toThrow();
});
test('A binding to a different coach is rejected and onboarding link origin is constrained',async()=>{
 const good=globalThis.fetch;globalThis.fetch=async(i,init)=>String(i).includes('/v1/accounts/')?Response.json({id:'acct_fixture',metadata:{coach_id:'another-coach',gym_environment:'test'}}):good(i,init);
 await expect(checkoutConnectFields(reservation)).rejects.toThrow();
 globalThis.fetch=async(i,init)=>String(i).endsWith('/account_links')?Response.json({url:'https://example.com/wrong'}):good(i,init);
 await expect(connectOnboarding('coach-test')).rejects.toThrow();
});
test('initial onboarding persists a test-only immutable binding and uses a stable creation key',async()=>{
 let linked=false;const good=globalThis.fetch;
 globalThis.fetch=async(i,init)=>{
  const url=String(i);if(url.includes('/rest/v1/gym_stripe_coach_accounts')){
   if(init?.method==='POST'){const body=JSON.parse(String(init.body));expect(body).toEqual({coach_id:'coach-test',stripe_account_id:'acct_fixture',mode:'test'});expect(new Headers(init.headers).get('Prefer')).toBe('resolution=ignore-duplicates');linked=true;return new Response(null,{status:201});}
   return Response.json(linked?[{stripe_account_id:'acct_fixture'}]:[]);
  }
  if(url.endsWith('/v1/accounts')){const form=new URLSearchParams(String(init?.body));expect(form.get('metadata[gym_environment]')).toBe('test');expect(new Headers(init?.headers).get('Idempotency-Key')).toBe('gym-connect-test-v2-coach-test');return Response.json({id:'acct_fixture'});}
  return good(i,init);
 };
 await expect(connectOnboarding('coach-test')).resolves.toEqual({mode:'test',url:'https://connect.stripe.com/setup/test_fixture'});expect(linked).toBe(true);
});
test('unconfigured recipe storage fails before creating external accounts',async()=>{
 delete process.env.SUPABASE_SERVICE_ROLE_KEY;await expect(connectOnboarding('coach-test')).rejects.toThrow();expect(calls).toHaveLength(0);
});
test('Settlement requires Stripe-confirmed fee, destination and exact transfer references',async()=>{
 const r={...reservation,stripeConnectAccountId:'acct_fixture'};
 await expect(verifyConnectSettlement(r,'pi_fixture')).resolves.toEqual({stripe_transfer_id:'tr_fixture',stripe_application_fee_id:'fee_fixture'});
 const good=globalThis.fetch;globalThis.fetch=async(i,init)=>{const response=await good(i,init);if(String(i).includes('/payment_intents/')){const p=await response.json();p.transfer_data.destination='acct_other';return Response.json(p);}return response;};
 await expect(verifyConnectSettlement(r,'pi_fixture')).rejects.toThrow();
});
test('Connect refunds reverse the transfer and refund the proportional application fee',async()=>{
 await refundStripePayment({paymentIntentId:'pi_fixture',amountCents:2000,reservationId:reservation.id,connectAccountId:'acct_fixture'});
 const post=calls.find(c=>c.url.endsWith('/refunds'))!;expect(post.body.get('reverse_transfer')).toBe('true');expect(post.body.get('refund_application_fee')).toBe('true');expect(post.headers.get('Idempotency-Key')).toBe('gym-refund-reservation-test-2000');
});
test('Connect references survive the persistence mapper round trip',()=>{
 const r={...reservation,stripeConnectAccountId:'acct_fixture',stripeTransferId:'tr_fixture',stripeApplicationFeeId:'fee_fixture'};expect(reservationFromRow(reservationToRow(r))).toMatchObject(r);
});
