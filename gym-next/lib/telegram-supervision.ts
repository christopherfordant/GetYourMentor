import 'server-only';
import {readTelegramSnapshot} from './telegram-state';
import {projectTelegramOutbox,type TelegramObservability} from './telegram-observability';

export type TelegramSupervisionResult=
  | {ok:true;metrics:TelegramObservability}
  | {ok:false;code:'TELEGRAM_SUPERVISION_UNAVAILABLE'};

/** Operator-only global aggregates. Authorization belongs to the server caller.
 * No public route, retry selection, send or storage mutation is provided here.
 * accepted does not establish phone delivery; due does not authorize resending.
 */
export async function readTelegramSupervision(now:number):Promise<TelegramSupervisionResult>{
  try{
    if(!Number.isFinite(now))return {ok:false,code:'TELEGRAM_SUPERVISION_UNAVAILABLE'};
    const snapshot=await readTelegramSnapshot();
    return {ok:true,metrics:projectTelegramOutbox(snapshot.outbox,now)};
  }catch{
    return {ok:false,code:'TELEGRAM_SUPERVISION_UNAVAILABLE'};
  }
}
