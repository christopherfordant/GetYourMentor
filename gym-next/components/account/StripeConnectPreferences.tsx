'use client';
import {useEffect,useState} from 'react';
export function StripeConnectPreferences(){
 const [state,setState]=useState<{enabled?:boolean;ready?:boolean;error?:string}>({});const[busy,setBusy]=useState(false);
 useEffect(()=>{const c=new AbortController();fetch('/api/stripe/connect',{signal:c.signal}).then(async r=>{if(r.ok)setState(await r.json());else setState({error:'Association Stripe de test indisponible.'});}).catch(()=>{});return()=>c.abort();},[]);
 if(!state.enabled&&!state.error)return null;
 return <section aria-label="Stripe Connect de test"><h2>Recevoir les paiements — démonstration</h2><p>Aucun encaissement ni versement bancaire réel. Utilisez uniquement les informations de test Stripe.</p><p role="status">{state.error??(state.ready?'Compte de test prêt.':'Terminez votre association Stripe de test avant un paiement.')}</p><button type="button" disabled={busy} onClick={async()=>{setBusy(true);try{const r=await fetch('/api/stripe/connect',{method:'POST'});const data=await r.json();if(!r.ok||typeof data.url!=='string'||new URL(data.url).origin!=='https://connect.stripe.com')throw Error();window.location.assign(data.url);}catch{setState(s=>({...s,error:'Association indisponible. Réessayez plus tard.'}));setBusy(false);}}}>Configurer mon compte Stripe de test</button></section>;
}
