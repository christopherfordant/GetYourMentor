import {createHash,randomBytes} from 'node:crypto';
import type {Reservation} from './domain';
import {mutateTelegram,telegramStorageReady,type TelegramIdentity,type TelegramState} from './telegram-state';
const hash=(text:string)=>createHash('sha256').update(text).digest('hex');
const configured=()=>Boolean(process.env.TELEGRAM_BOT_TOKEN&&process.env.TELEGRAM_WEBHOOK_SECRET&&telegramStorageReady());
export async function telegramPreferences(owner:TelegramIdentity){
  if(!configured())return {configured:false,linked:false,candidate:false};
  return mutateTelegram(state=>({configured:true,linked:state.bindings.some(b=>b.owner.email===owner.email),candidate:state.pending.some(p=>p.owner.email===owner.email&&p.expires>Date.now()&&Boolean(p.candidate)),notifications:state.outbox.filter(m=>m.owner===owner.email).slice(-10).map(m=>({status:m.status,attempts:m.attempts,created:m.created}))}));
}
export async function startTelegramPairing(owner:TelegramIdentity){
  if(!configured())throw new Error('Telegram non configuré');
  const code=randomBytes(24).toString('base64url');
  await mutateTelegram(state=>{state.pending=state.pending.filter(p=>p.expires>Date.now()&&p.owner.email!==owner.email);state.pending.push({owner,hash:hash(code),expires:Date.now()+300000});});
  return {command:'/start '+code,expiresIn:300};
}
export async function receiveTelegramPairing(update:unknown){
  const message=(update as {message?:{text?:unknown;chat?:{id?:unknown;type?:unknown};from?:{id?:unknown}}})?.message;
  if(!message||message.chat?.type!=='private'||message.from?.id!==message.chat.id||typeof message.text!=='string')return;
  const match=/^\/start(?:@[A-Za-z0-9_]+)? ([A-Za-z0-9_-]{32})$/.exec(message.text);if(!match||!Number.isSafeInteger(message.chat.id))return;
  const digest=hash(match[1]),chatId=String(message.chat.id);
  await mutateTelegram(state=>{const pairing=state.pending.find(p=>p.hash===digest&&p.expires>Date.now()&&!p.candidate);if(pairing)pairing.candidate=chatId;});
}
export async function confirmTelegramPairing(owner:TelegramIdentity){
  await mutateTelegram(state=>{const pairing=state.pending.find(p=>p.owner.email===owner.email&&p.expires>Date.now()&&p.candidate);if(!pairing?.candidate)throw new Error('Association absente ou expirée');if(state.bindings.some(b=>b.chatId===pairing.candidate&&b.owner.email!==owner.email))throw new Error('Conversation déjà associée');state.bindings=state.bindings.filter(b=>b.owner.email!==owner.email);state.bindings.push({owner,chatId:pairing.candidate});state.pending=state.pending.filter(p=>p.owner.email!==owner.email);});
}
export async function unlinkTelegram(owner:TelegramIdentity){await mutateTelegram(state=>{state.bindings=state.bindings.filter(b=>b.owner.email!==owner.email);state.pending=state.pending.filter(p=>p.owner.email!==owner.email);state.outbox=state.outbox.filter(m=>m.owner!==owner.email);});}
export function addTelegramEvent(state:TelegramState,reservation:Reservation,event:'requested'|'accepted'|'rejected'|'paid'){
  // Minimal message: no email, phone, payment details or private reservation link.
  const text={requested:'Nouvelle demande de réservation.',accepted:'Votre demande a été acceptée. Le paiement reste à effectuer.',rejected:'Votre demande a été refusée.',paid:'Paiement Stripe de test confirmé. Aucun débit réel.'}[event]+' Consultez votre espace GetYourMentor.';
  state.history??=[];
  const expired=state.outbox.filter(m=>m.created<=Date.now()-7*86400000);
  // Retain only opaque deduplication digests after deleting message and recipient data.
  state.history=[...new Set([...state.history,...expired.map(m=>m.key)])];
  state.outbox=state.outbox.filter(m=>m.created>Date.now()-7*86400000);
  for(const binding of state.bindings){const coach=binding.owner.role==='coach'&&binding.owner.coachId===reservation.coachId;const client=binding.owner.role==='sportif'&&binding.owner.email===reservation.ownerEmail;const eligible=event==='requested'?coach:event==='paid'?coach||client:client;if(!eligible)continue;const key=hash(reservation.id+'|'+event+'|'+binding.owner.email);if(!state.history.includes(key)&&!state.outbox.some(m=>m.key===key))state.outbox.push({key,owner:binding.owner.email,chatId:binding.chatId,text,status:'pending',created:Date.now(),attempts:0});}
}
export async function flushTelegram(){
  const token=process.env.TELEGRAM_BOT_TOKEN;
  // No real message until explicit test recipients are configured server-side.
  const allow=new Set((process.env.TELEGRAM_TEST_CHAT_IDS??'').split(',').map(s=>s.trim()).filter(Boolean));
  if(!configured()||!token||process.env.TELEGRAM_ENABLE_SEND!=='true'||!allow.size)return;
  for(let i=0;i<10;i++){
    const message=await mutateTelegram(state=>{for(const m of state.outbox)if(m.status==='sending'&&Boolean(m.retryAt&&m.retryAt<Date.now()))m.status='uncertain';const next=state.outbox.find(m=>m.status==='pending'&&(!m.retryAt||m.retryAt<=Date.now())&&allow.has(m.chatId)&&state.bindings.some(b=>b.chatId===m.chatId&&b.owner.email===m.owner));if(!next)return null;next.status='sending';next.attempts++;next.retryAt=Date.now()+30000;return {...next};});if(!message)return;
    let status:'accepted'|'failed'|'uncertain'|'pending'='uncertain',messageId:number|undefined,retryAt:number|undefined;
    try{const response=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:message.chatId,text:message.text}),signal:AbortSignal.timeout(8000)});const payload=await response.json();if(response.ok&&payload.ok===true&&Number.isSafeInteger(payload.result?.message_id)){status='accepted';messageId=payload.result.message_id;}else if(response.status===429){status='pending';retryAt=Date.now()+Math.max(1,Number(payload.parameters?.retry_after)||60)*1000;}else if(response.status>=400&&response.status<500)status='failed';}catch{/* Unknown delivery: never retry automatically and risk duplicates. */}
    await mutateTelegram(state=>{const row=state.outbox.find(m=>m.key===message.key);if(row&&row.status==='sending'){row.status=status;row.messageId=messageId;row.retryAt=retryAt;}});
  }
}
export async function notifyTelegram(reservation:Reservation,event:'requested'|'accepted'|'rejected'|'paid'){
  if(!configured())return;
  // Notification failures never roll back a saved reservation.
  try{await mutateTelegram(state=>addTelegramEvent(state,reservation,event));await flushTelegram();}catch{/* Reconciliation retries enqueueing from persisted reservation status. */}
}
