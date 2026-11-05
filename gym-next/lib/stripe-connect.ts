// Server-only sandbox boundary. No client-supplied beneficiary or fee.
import {stripeTestConfig} from './stripe-test-config';
import {supabaseHeaders} from './supabase';
import type {Reservation} from './domain';

export const connectEnabled=()=>process.env.STRIPE_CONNECT_ENABLED==='true';
function config(){const c=stripeTestConfig();if(!c||!connectEnabled())throw Error('Stripe Connect de test indisponible');return c;}
async function stripe(resource:string,form?:URLSearchParams,idempotency?:string){
 const c=config();const response=await fetch('https://api.stripe.com/v1/'+resource,{method:form?'POST':'GET',headers:{Authorization:`Bearer ${c.secretKey}`,...(form?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotency?{'Idempotency-Key':idempotency}:{})},body:form,cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Opération Stripe Connect de test indisponible');return response.json();
}
function store(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(url!=='https://pqxqqbwesfrefzjoawmx.supabase.co'||!key)throw Error('Stockage Connect de recette non configuré');
 return {url,headers:supabaseHeaders(key,{'Content-Type':'application/json'})};
}
async function accountId(coachId:string){
 const c=store();const response=await fetch(`${c.url}/rest/v1/gym_stripe_coach_accounts?coach_id=eq.${encodeURIComponent(coachId)}&mode=eq.test&select=stripe_account_id&limit=1`,{headers:c.headers,cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Migration ou stockage Connect indisponible');
 const rows=await response.json();if(!Array.isArray(rows))throw Error('Stockage Connect invalide');
 const id=rows[0]?.stripe_account_id;if(id!==undefined&&!/^acct_[A-Za-z0-9]+$/.test(id))throw Error('Compte Connect invalide');return id as string|undefined;
}
async function account(coachId:string,id:string){
 const value=await stripe('accounts/'+encodeURIComponent(id));
 if(value.id!==id||value.deleted||value.metadata?.gym_environment!=='test'||value.metadata?.coach_id!==coachId)throw Error('Compte Connect incohérent');
 return value;
}
export async function connectStatus(coachId:string){
 config();const id=await accountId(coachId);if(!id)return {mode:'test',linked:false,ready:false};
 const a=await account(coachId,id);return {mode:'test',linked:true,ready:a.charges_enabled===true&&a.payouts_enabled===true&&a.capabilities?.transfers==='active',detailsSubmitted:a.details_submitted===true};
}
export async function connectOnboarding(coachId:string){
 const c=config();let id=await accountId(coachId);
 if(!id){
  const country=process.env.STRIPE_CONNECT_COUNTRY;if(!country||!/^[A-Z]{2}$/.test(country))throw Error('Pays du compte Connect de test non configuré');
  const form=new URLSearchParams({type:'express',country,'capabilities[card_payments][requested]':'true','capabilities[transfers][requested]':'true','metadata[coach_id]':coachId,'metadata[gym_environment]':'test'});
  const created=await stripe('accounts',form,`gym-connect-test-v2-${coachId}`);
  if(typeof created.id!=='string'||!/^acct_[A-Za-z0-9]+$/.test(created.id))throw Error('Compte Connect absent');
  await account(coachId,created.id);
  const db=store();const response=await fetch(db.url+'/rest/v1/gym_stripe_coach_accounts?on_conflict=coach_id',{method:'POST',headers:{...db.headers,Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({coach_id:coachId,stripe_account_id:created.id,mode:'test'}),signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('Association Connect non enregistrée');
  id=await accountId(coachId);if(id!==created.id)throw Error('Association Connect concurrente incohérente');
 }
 if(!id)throw Error('Association Connect absente');
 await account(coachId,id);
 const form=new URLSearchParams({account:id,type:'account_onboarding',refresh_url:c.appUrl+'/compte?mode=coach&connect=retry',return_url:c.appUrl+'/compte?mode=coach&connect=returned'});
 const link=await stripe('account_links',form);
 if(typeof link.url!=='string'||new URL(link.url).origin!=='https://connect.stripe.com')throw Error('Lien Connect invalide');
 return {mode:'test',url:link.url};
}
export async function checkoutConnectFields(reservation:Reservation){
 config();const id=await accountId(reservation.coachId);if(!id)throw Error('Le coach doit terminer son association Stripe de test');
 const a=await account(reservation.coachId,id);
 if(a.charges_enabled!==true||a.payouts_enabled!==true||a.capabilities?.transfers!=='active')throw Error('Le compte Stripe de test du coach n’est pas prêt');
 const f=reservation.financials;
 if(!f||f.currency!=='eur'||!Number.isSafeInteger(f.grossCents)||f.grossCents<=0||!Number.isSafeInteger(f.platformFeeCents)||f.platformFeeCents<0||f.platformFeeCents>f.grossCents||f.coachAmountCents!==f.grossCents-f.platformFeeCents)throw Error('Commission historique invalide');
 return {accountId:id,feeCents:f.platformFeeCents};
}
export async function verifyConnectSettlement(reservation:Reservation,paymentIntentId:string){
 if(!reservation.stripeConnectAccountId)return {};
 config();if(!/^pi_[A-Za-z0-9]+$/.test(paymentIntentId))throw Error('Paiement invalide');
 const p=await stripe(`payment_intents/${encodeURIComponent(paymentIntentId)}?expand%5B%5D=latest_charge`);
 if(p.id!==paymentIntentId||p.livemode!==false||p.status!=='succeeded'||p.currency!=='eur'||p.amount!==reservation.financials?.grossCents||p.application_fee_amount!==reservation.financials?.platformFeeCents||p.transfer_data?.destination!==reservation.stripeConnectAccountId||p.metadata?.reservation_id!==reservation.id)throw Error('Répartition Connect incohérente');
 const charge=p.latest_charge;
 if(!charge||typeof charge!=='object'||typeof charge.transfer!=='string'||!/^tr_[A-Za-z0-9]+$/.test(charge.transfer)||(p.application_fee_amount>0&&(typeof charge.application_fee!=='string'||!/^fee_[A-Za-z0-9]+$/.test(charge.application_fee))))throw Error('Références Connect en attente');
 return {stripe_transfer_id:charge.transfer,stripe_application_fee_id:charge.application_fee??null};
}
