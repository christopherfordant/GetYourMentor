import {test,expect} from '@playwright/test';
import {addTelegramEvent,startTelegramPairing,receiveTelegramPairing,confirmTelegramPairing,telegramPreferences,flushTelegram,unlinkTelegram} from '../lib/telegram';
import {emptyTelegramState,mutateTelegram} from '../lib/telegram-state';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {stripeTestConfig} from '../lib/stripe-test-config';
import type {Reservation} from '../lib/domain';
import {createCheckoutSession} from '../lib/payments';
import {memoryReservations} from '../lib/repositories/reservation-repository';

test('notifications: recipients, deduplication and retention',()=>{
 const state=emptyTelegramState();
 state.bindings=[
  {owner:{email:'coach@test.invalid',role:'coach',coachId:'one'},chatId:'10'},
  {owner:{email:'client@test.invalid',role:'sportif'},chatId:'20'},
  {owner:{email:'other@test.invalid',role:'coach',coachId:'two'},chatId:'30'}
 ];
 const reservation={id:'reservation-test',coachId:'one',ownerEmail:'client@test.invalid'} as Reservation;
 addTelegramEvent(state,reservation,'requested');addTelegramEvent(state,reservation,'requested');
 expect(state.outbox).toHaveLength(1);expect(state.outbox[0].chatId).toBe('10');
 addTelegramEvent(state,reservation,'accepted');expect(state.outbox[1].chatId).toBe('20');
 addTelegramEvent(state,reservation,'paid');expect(state.outbox).toHaveLength(4);
 expect(state.outbox.every(m=>!m.text.includes('@')&&!m.text.includes(reservation.id))).toBeTruthy();
 state.outbox.forEach(m=>{m.created=0;m.status='accepted';});
 addTelegramEvent(state,reservation,'paid');expect(state.outbox).toHaveLength(0);
 addTelegramEvent(state,reservation,'requested');expect(state.outbox).toHaveLength(0);
 expect(state.history).toHaveLength(4);
});

test('Stripe rejects live keys and unsafe return origins',()=>{
 const saved={...process.env};
 try{
  process.env.PAYMENT_PROVIDER='stripe';process.env.STRIPE_SECRET_KEY='sk_live_notARealKey';
  expect(()=>stripeTestConfig()).toThrow();
  process.env.STRIPE_SECRET_KEY='sk_test_unitFixture';process.env.NEXT_PUBLIC_APP_URL='http://example.com';
  expect(()=>stripeTestConfig()).toThrow();
  process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3005';expect(stripeTestConfig()?.appUrl).toBe('http://127.0.0.1:3005');
 }finally{for(const key of ['PAYMENT_PROVIDER','STRIPE_SECRET_KEY','NEXT_PUBLIC_APP_URL']){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key];}}
});

test('Telegram: private pairing, explicit confirmation, dedup and ambiguous delivery',async()=>{
 const env={...process.env},cwd=process.cwd(),fetchOriginal=globalThis.fetch;
 const dir=await mkdtemp(path.join(os.tmpdir(),'gym-telegram-test-'));await mkdir(path.join(dir,'app'));
 try{
  process.chdir(path.join(dir,'app'));
  delete process.env.SUPABASE_URL;delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  Object.assign(process.env,{CI:'true',NEXT_PUBLIC_APP_URL:'http://127.0.0.1:3005',GETYOURMENTOR_ACCEPTANCE_MODE:'true',GETYOURMENTOR_ALLOW_DEMO:'true',TELEGRAM_BOT_TOKEN:'unit-fixture',TELEGRAM_WEBHOOK_SECRET:'unit-secret',TELEGRAM_ENABLE_SEND:'true',TELEGRAM_TEST_CHAT_IDS:'42'});
  const owner={email:'recipient@test.invalid',role:'sportif'};
  const pairing=await startTelegramPairing(owner);
  const incoming={message:{text:pairing.command,chat:{id:42,type:'private'},from:{id:42}}};
  await receiveTelegramPairing({...incoming,message:{...incoming.message,chat:{id:42,type:'group'}}});
  expect((await telegramPreferences(owner)).candidate).toBe(false);
  await receiveTelegramPairing(incoming);expect((await telegramPreferences(owner)).linked).toBe(false);
  await confirmTelegramPairing(owner);expect((await telegramPreferences(owner)).linked).toBe(true);
  const reservation={id:'unit-reservation',coachId:'one',ownerEmail:owner.email} as Reservation;
  let sends=0;
  globalThis.fetch=async()=>{sends++;return new Response(JSON.stringify({ok:true,result:{message_id:99}}),{status:200});};
  await mutateTelegram(state=>addTelegramEvent(state,reservation,'accepted'));
  await Promise.all([flushTelegram(),flushTelegram()]);expect(sends).toBe(1);
  expect(await mutateTelegram(state=>state.outbox[0].status)).toBe('accepted');
  globalThis.fetch=async()=>{sends++;throw new Error('simulated timeout');};
  await mutateTelegram(state=>addTelegramEvent(state,reservation,'paid'));
  await flushTelegram();await flushTelegram();expect(sends).toBe(2);
  expect(await mutateTelegram(state=>state.outbox[1].status)).toBe('uncertain');
  await unlinkTelegram(owner);expect((await telegramPreferences(owner)).linked).toBe(false);
  expect(await mutateTelegram(state=>state.outbox.length)).toBe(0);
 }finally{
  globalThis.fetch=fetchOriginal;process.chdir(cwd);
  for(const key of new Set([...Object.keys(process.env),...Object.keys(env)])){if(env[key]===undefined)delete process.env[key];else process.env[key]=env[key];}
  await rm(dir,{recursive:true,force:true});
 }
});

test('Stripe checkout: server amount, test response and persisted session (mock API)',async()=>{
 const env={...process.env},originalFetch=globalThis.fetch;
 const reservation={id:'checkout-unit',ownerEmail:'fixture@test.invalid',coachId:'fixture',coachName:'Fixture',sport:'football',city:'Paris',service:'Test',duration:'1 heure',price:35,slots:[new Date(Date.now()+86400000*200).toISOString()],status:'accepted',createdAt:new Date().toISOString()} as Reservation;
 memoryReservations.push(reservation);
 try{
  delete process.env.SUPABASE_URL;delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  Object.assign(process.env,{CI:'true',NEXT_PUBLIC_APP_URL:'http://127.0.0.1:3005',GETYOURMENTOR_ACCEPTANCE_MODE:'true',GETYOURMENTOR_ALLOW_DEMO:'true',PAYMENT_PROVIDER:'stripe',STRIPE_SECRET_KEY:'sk_test_unitFixture'});
  let calls=0;
  globalThis.fetch=async(url,options)=>{
   calls++;expect(String(url)).toBe('https://api.stripe.com/v1/checkout/sessions');
   const body=new URLSearchParams(String(options?.body));
   expect(body.get('line_items[0][price_data][unit_amount]')).toBe('3500');
   expect(body.get('success_url')).not.toContain(reservation.ownerEmail!);
   expect((options?.headers as Record<string,string>)['Idempotency-Key']).toBe('gym-checkout-checkout-unit');
   return new Response(JSON.stringify({id:'cs_test_fixture',livemode:false,url:'https://checkout.stripe.com/c/pay/cs_test_fixture'}));
  };
  const result=await createCheckoutSession(reservation);expect(calls).toBe(1);expect(result?.sessionId).toBe('cs_test_fixture');
  expect(memoryReservations.find(r=>r.id===reservation.id)?.stripeCheckoutSessionId).toBe('cs_test_fixture');
  globalThis.fetch=async()=>new Response(JSON.stringify({id:'cs_live_fixture',livemode:true,url:'https://checkout.stripe.com/c/pay/fixture'}));
  await expect(createCheckoutSession(reservation)).rejects.toThrow();
 }finally{
  const index=memoryReservations.findIndex(r=>r.id===reservation.id);if(index>=0)memoryReservations.splice(index,1);
  globalThis.fetch=originalFetch;
  for(const key of new Set([...Object.keys(process.env),...Object.keys(env)])){if(env[key]===undefined)delete process.env[key];else process.env[key]=env[key];}
 }
});
