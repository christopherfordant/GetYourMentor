import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync} from 'node:fs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {digest} from './engine.mjs';
import {eurosToCents,refundedCommissionCents} from '../../gym-next/lib/domain/commission.ts';
export const tokenHash=value=>createHash('sha256').update(value).digest('hex');
const allowed=new Set(['status','stripePaymentIntentId','stripeTransferId','stripeApplicationFeeId','stripeRefundId','refundStatus','refundedPlatformFeeCents']);
export function initializeLab(path,{rows,environment,bindings,operator}){
 if(existsSync(path))throw Error('Existing database preserved');
 const db=new DatabaseSync(path);
 try{
  db.exec('PRAGMA synchronous=FULL; BEGIN IMMEDIATE;');db.exec(readFileSync(fileURLToPath(new URL('./local-schema.sql',import.meta.url)),'utf8').replace(/^\uFEFF/,''));
  db.prepare('INSERT INTO metadata VALUES (?,?)').run('kind','isolated-reconciliation-lab-v1');
  db.prepare('INSERT INTO environments VALUES (?,?,?)').run(environment.id,environment.platform,environment.origin);
  for(const row of rows)db.prepare('INSERT INTO reservations(id,body) VALUES (?,?)').run(row.id,JSON.stringify(row));
  for(const b of bindings)db.prepare('INSERT INTO bindings VALUES (?,?,?)').run(environment.id,b.coach,b.account);
  if(typeof operator.token!=='string'||operator.token.length<32)throw Error('Operator token too short');
  db.prepare('INSERT INTO operators VALUES (?,?,?,?,?,1)').run(tokenHash(operator.token),environment.id,JSON.stringify(operator.modes),JSON.stringify(operator.targets),operator.expiresAt);
  db.exec('COMMIT');
 }catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}finally{db.close();}
}
export function openLab(path,{readOnly=false}={}){
 if(!existsSync(path))throw Error('Lab database missing');
 const db=new DatabaseSync(path,{readOnly});db.exec('PRAGMA busy_timeout=1500;');
 if(db.prepare('SELECT value FROM metadata WHERE name=?').get('kind')?.value!=='isolated-reconciliation-lab-v1'){db.close();throw Error('Lab database required');}
 const read=id=>{const r=db.prepare('SELECT body,revision FROM reservations WHERE id=?').get(id);if(!r)return null;const intent=db.prepare('SELECT body FROM cancellation_intents WHERE reservation_id=?').get(id);return {...JSON.parse(r.body),__reconciliationRevision:r.revision,__reconciliationIntent:intent?tokenHash(intent.body):null};};
 const environment=id=>db.prepare('SELECT id,platform,origin FROM environments WHERE id=?').get(id);
 function authorize(token,mode,ids){
  if(typeof token!=='string'||token.length<32||token.length>512)throw Error('Operator refused');
  const hash=tokenHash(token),op=db.prepare('SELECT * FROM operators WHERE token_hash=?').get(hash);
  if(!op||!timingSafeEqual(Buffer.from(hash,'hex'),Buffer.from(op.token_hash,'hex'))||!op.enabled||op.expires_at<=Date.now()
   ||!JSON.parse(op.modes).includes(mode)||!ids.every(id=>JSON.parse(op.targets).includes(id)))throw Error('Operator refused');
  const env=environment(op.environment);if(!env)throw Error('Environment missing');return env;
 }
 function compareAndSwap(id,expected,patch,recheck){
  if(readOnly)throw Error('Read-only diagnostic');
  if(Object.keys(patch).some(k=>!allowed.has(k)))throw Error('Forbidden patch field');
  db.exec('BEGIN IMMEDIATE');
  try{
   recheck?.();const row=read(id);if(!row||digest(row)!==expected){db.exec('ROLLBACK');return false;}
   if(patch.status!==undefined&&!(row.status==='accepted'&&patch.status==='paid'))throw Error('Forbidden transition');
   if(patch.refundStatus!==undefined&&(!['pending','succeeded'].includes(patch.refundStatus)||row.status!=='cancelled'||(row.refundStatus==='succeeded'&&patch.refundStatus!=='succeeded')))throw Error('Forbidden refund transition');
   const next={...row,...patch};delete next.__reconciliationRevision;delete next.__reconciliationIntent;db.prepare('UPDATE reservations SET body=?, revision=revision+1 WHERE id=?').run(JSON.stringify(next),id);db.exec('COMMIT');return true;
  }catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}
 }
 function recordCancellationIntent(id,expected,intent){
  if(readOnly)throw Error('Read-only diagnostic');db.exec('BEGIN IMMEDIATE');
  try{
   const row=read(id);if(!row||digest(row)!==expected){db.exec('ROLLBACK');return false;}
   // Existing domain decision must already have computed the monetary intent.
   if(!['paid','cancelled'].includes(row.status)||row.stripePaymentIntentId!==intent.paymentIntentId
    ||row.stripeEnvironmentId!==intent.environmentId||row.stripeConnectAccountId!==intent.accountId
    ||typeof row.appointmentAt!=='string'||!Number.isFinite(Date.parse(row.appointmentAt))||intent.appointmentAt!==row.appointmentAt
    ||![0,50,100].includes(intent.refundPercent)||Math.round(row.financials.grossCents*intent.refundPercent/100)!==intent.amountCents
    ||!Number.isSafeInteger(intent.amountCents)||intent.amountCents<=0||intent.amountCents>row.financials.grossCents
    ||eurosToCents(intent.refundAmount)!==intent.amountCents||refundedCommissionCents(row.financials,intent.amountCents)!==intent.feeCents
    ||!Number.isSafeInteger(intent.decidedAt)||intent.decidedAt>Date.now()
    ||intent.idempotencyKey!==(row.stripeEnvironmentId==='legacy-test'?`gym-refund-${row.id}-${intent.amountCents}`:`gym-refund-${row.stripeEnvironmentId}-${row.id}-${intent.amountCents}`))throw Error('Invalid existing cancellation decision');
   const prior=db.prepare('SELECT body FROM cancellation_intents WHERE reservation_id=?').get(id);
   if(prior){if(prior.body!==JSON.stringify(intent))throw Error('Immutable intent conflict');db.exec('COMMIT');return true;}
   db.prepare('INSERT INTO cancellation_intents VALUES (?,?)').run(id,JSON.stringify(intent));db.exec('COMMIT');return true;
  }catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}
 }
 return {read,authorize,environment,revision:id=>db.prepare('SELECT revision FROM reservations WHERE id=?').get(id)?.revision,binding:(env,coach)=>db.prepare('SELECT account FROM bindings WHERE environment=? AND coach=?').get(env,coach)?.account,
  compareAndSwap,recordCancellationIntent,intent:id=>{const r=db.prepare('SELECT body FROM cancellation_intents WHERE reservation_id=?').get(id);return r?JSON.parse(r.body):null;},close:()=>db.close()};
}
