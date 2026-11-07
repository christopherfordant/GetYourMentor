import 'server-only';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {isLocalPortraitPreview} from './runtime';
export type TelegramIdentity={email:string;role:string;coachId?:string};
export type TelegramState={history?:string[];pending:Array<{owner:TelegramIdentity;hash:string;expires:number;candidate?:string}>;bindings:Array<{owner:TelegramIdentity;chatId:string}>;outbox:Array<{key:string;owner:string;chatId:string;text:string;status:'pending'|'sending'|'accepted'|'failed'|'uncertain';created:number;attempts:number;messageId?:number;retryAt?:number}>};
export const emptyTelegramState=():TelegramState=>({pending:[],bindings:[],outbox:[]});
const stateGlobal=globalThis as typeof globalThis & {telegramLocalQueue?:Promise<unknown>};
function remote(){const url=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;return url&&key?{url:url.replace(/\/$/,''),headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'}}:null;}
export function telegramStorageReady(){return Boolean(remote())||isLocalPortraitPreview();}

function checkedSnapshot(payload:unknown):TelegramState{
  if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('TELEGRAM_SNAPSHOT_INVALID');
  const state=payload as Partial<TelegramState>;
  if(!Array.isArray(state.pending)||!Array.isArray(state.bindings)||!Array.isArray(state.outbox))throw new Error('TELEGRAM_SNAPSHOT_INVALID');
  return state as TelegramState;
}

/** Server-internal snapshot. Callers must authorize access; global state is private.
 * This does not use mutateTelegram: reading must never persist or initialize state.
 */
export async function readTelegramSnapshot():Promise<TelegramState>{
  try{
    const config=remote();
    if(config){
      const response=await fetch(config.url+'/rest/v1/gym_telegram_state?id=eq.primary&select=payload',{
        method:'GET',headers:config.headers,cache:'no-store',signal:AbortSignal.timeout(8000),
      });
      if(!response.ok)throw new Error('TELEGRAM_SNAPSHOT_UNAVAILABLE');
      const rows:unknown=await response.json();
      if(!Array.isArray(rows)||rows.length!==1)throw new Error('TELEGRAM_SNAPSHOT_INVALID');
      return checkedSnapshot(rows[0]?.payload);
    }
    if(!isLocalPortraitPreview())throw new Error('TELEGRAM_SNAPSHOT_UNAVAILABLE');
    const operation=async()=>{
      const file=path.resolve(process.cwd(),'../.private-data/telegram-state.json');
      try{return checkedSnapshot(JSON.parse(await readFile(file,'utf8')));}
      catch(error){if((error as NodeJS.ErrnoException)?.code==='ENOENT')return emptyTelegramState();throw error;}
    };
    // Join the existing queue so neither earlier nor later mutations overlap this read.
    const pending=(stateGlobal.telegramLocalQueue??Promise.resolve()).then(operation,operation);
    stateGlobal.telegramLocalQueue=pending.catch(()=>{});
    return await pending;
  }catch{
    // Storage errors may contain URLs, credentials or private payloads.
    throw new Error('TELEGRAM_SNAPSHOT_UNAVAILABLE');
  }
}
export async function mutateTelegram<T>(change:(state:TelegramState)=>T):Promise<T>{
  const config=remote();
  if(config){
    const endpoint=config.url+'/rest/v1/gym_telegram_state?id=eq.primary';
    for(let attempt=0;attempt<8;attempt++){
      const response=await fetch(endpoint+'&select=version,payload',{headers:config.headers,cache:'no-store',signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw new Error('Stockage Telegram indisponible');
      const rows=await response.json();if(!rows[0])throw new Error('Migration Telegram non appliquée');
      const {version,payload}=rows[0];const result=change(payload);
      const update=await fetch(endpoint+'&version=eq.'+version,{method:'PATCH',headers:{...config.headers,Prefer:'return=representation'},body:JSON.stringify({version:version+1,payload}),signal:AbortSignal.timeout(8000)});
      if(!update.ok)throw new Error('Écriture Telegram indisponible');
      if((await update.json()).length)return result;
    }
    throw new Error('Stockage Telegram occupé');
  }
  if(!isLocalPortraitPreview())throw new Error('Stockage Telegram non configuré');
  const operation=async()=>{
    const file=path.resolve(process.cwd(),'../.private-data/telegram-state.json');
    let state:TelegramState;try{state=JSON.parse(await readFile(file,'utf8'));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;state=emptyTelegramState();}
    const result=change(state);await mkdir(path.dirname(file),{recursive:true});const temp=file+'.'+randomUUID();await writeFile(temp,JSON.stringify(state),{mode:0o600});await rename(temp,file);return result;
  };
  const pending=(stateGlobal.telegramLocalQueue??Promise.resolve()).then(operation,operation);stateGlobal.telegramLocalQueue=pending.catch(()=>{});return pending;
}
