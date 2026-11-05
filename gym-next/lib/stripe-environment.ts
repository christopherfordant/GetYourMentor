import {stripeTestConfig} from './stripe-test-config';
import {supabaseHeaders} from './supabase';
import {reservationFromRow} from './repositories/reservation-mapper';
import type {Reservation} from './domain';

export function environmentStore(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(typeof window!=='undefined'||url!=='https://pqxqqbwesfrefzjoawmx.supabase.co'||!key)throw Error('Stockage environnement recette indisponible');
 return {url,headers:supabaseHeaders(key,{'Content-Type':'application/json'})};
}
export async function activeStripeEnvironment(){
 const c=stripeTestConfig();const id=process.env.STRIPE_ENVIRONMENT_ID;
 if(!c||!id||!['legacy-test','recipe-accounts-v2'].includes(id))throw Error('Environnement Stripe explicite requis');
 const db=environmentStore();
 const response=await fetch(`${db.url}/rest/v1/gym_stripe_environments?id=eq.${encodeURIComponent(id)}&select=id,platform_account_id,kind,mode`,{headers:db.headers,cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Registre Stripe indisponible');
 const rows=await response.json();const row=Array.isArray(rows)&&rows.length===1?rows[0]:null;
 if(!row||row.id!==id||row.mode!=='test'||!/^acct_[A-Za-z0-9]+$/.test(row.platform_account_id)||!['test_mode','sandbox'].includes(row.kind))throw Error('Environnement Stripe invalide');
 const account=await fetch('https://api.stripe.com/v1/account',{headers:{Authorization:`Bearer ${c.secretKey}`},cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!account.ok)throw Error('Plateforme Stripe indisponible');const platform=await account.json();
 if(platform.id!==row.platform_account_id||platform.object!=='account')throw Error('Cle Stripe incompatible avec environnement');
 return {...c,environmentId:id,platformId:row.platform_account_id as string};
}
export async function assertReservationEnvironment(reservation:Reservation){
 const env=await activeStripeEnvironment();
 if(reservation.stripeEnvironmentId!==env.environmentId)throw Error('Reservation dans un autre environnement Stripe');
 return env;
}
export async function claimStripeEnvironment(id:string,environmentId:string){
 const db=environmentStore();const root=`${db.url}/rest/v1/gym_reservations?id=eq.${encodeURIComponent(id)}`;
 const response=await fetch(root+'&status=eq.accepted&stripe_environment_id=is.null',{method:'PATCH',headers:{...db.headers,Prefer:'return=representation'},body:JSON.stringify({stripe_environment_id:environmentId}),signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Revendication environnement indisponible');
 const rows=await response.json();if(!Array.isArray(rows))throw Error('Revendication invalide');
 let row=rows[0];
 if(!row){const read=await fetch(root+'&select=*',{headers:db.headers,cache:'no-store',signal:AbortSignal.timeout(8000)});if(!read.ok)throw Error('Reservation indisponible');const values=await read.json();row=Array.isArray(values)&&values.length===1?values[0]:null;}
 if(!row||row.id!==id||row.stripe_environment_id!==environmentId||row.status!=='accepted')throw Error('Reservation non payable dans cet environnement');
 return reservationFromRow(row);
}
