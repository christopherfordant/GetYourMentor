import http from 'node:http';
const id=value=>typeof value==='string'?value:value?.id;
const identifier=(value,prefix)=>{const v=id(value);if(typeof v!=='string'||!new RegExp('^'+prefix+'[A-Za-z0-9_]+$').test(v))throw Error('Provider reference invalid');return v;};
export function localReadProvider({environment,store,apiKey,timeoutMs=2000,maxPages=3,signal}){
 const origin=new URL(environment.origin);
 if(origin.protocol!=='http:'||origin.hostname!=='127.0.0.1'||!origin.port||origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/'
  ||Number(origin.port)<1024||!/^sk_test_[A-Za-z0-9_]+$/.test(apiKey??'')||!Number.isInteger(timeoutMs)||timeoutMs<20||timeoutMs>5000||!Number.isInteger(maxPages)||maxPages<1||maxPages>5)throw Error('Loopback test configuration required');
 async function snapshot(row){
  let requests=0;const deadline=AbortSignal.any([AbortSignal.timeout(timeoutMs),...(signal?[signal]:[])]);
  async function get(path){
   if(++requests>40||!path.startsWith('/v1/'))throw Error('Read budget exceeded');deadline.throwIfAborted();
   return await new Promise((resolve,reject)=>{
    const request=http.request(new URL(path,origin),{method:'GET',agent:false,headers:{Authorization:'Bearer '+apiKey,'Stripe-Version':'2026-10-28.endive'},signal:deadline},response=>{
     if(response.statusCode!==200){request.destroy();response.resume();reject(Error('Provider read unavailable'));return;}
     let size=0;const chunks=[];
     response.on('data',chunk=>{size+=chunk.length;if(size>1024*1024){request.destroy(Error('Provider response too large'));return;}chunks.push(chunk);});
     response.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{reject(Error('Provider response invalid'));}});
     response.on('error',()=>reject(Error('Provider response interrupted')));response.on('aborted',()=>reject(Error('Provider response interrupted')));
    });request.on('error',()=>reject(Error('Provider read unavailable')));request.end();
   });
  }
  async function object(value,prefix,path,kind){const key=identifier(value,prefix);const result=typeof value==='object'&&value!==null?structuredClone(value):await get(path+encodeURIComponent(key));if(result.id!==key||result.object!==kind)throw Error('Provider object mismatch');return result;}
  async function list(path){
   const data=[],seen=new Set();let cursor;
   for(let page=0;page<maxPages;page++){
    const u=new URL(path,origin);u.searchParams.set('limit','100');if(cursor)u.searchParams.set('starting_after',cursor);
    const result=await get(u.pathname+u.search);if(result.object!=='list'||!Array.isArray(result.data)||result.data.length>100||typeof result.has_more!=='boolean')throw Error('Provider list invalid');
    for(const item of result.data){if(typeof item.id!=='string'||seen.has(item.id))throw Error('Pagination inconsistent');seen.add(item.id);data.push(item);}
    if(!result.has_more)return {data,has_more:false};if(!result.data.length)return {data,has_more:true};cursor=result.data.at(-1).id;
   }
   return {data,has_more:true};
  }
  if(row.stripeEnvironmentId!==environment.id)throw Error('Reservation environment mismatch');
  const bound=store.binding(environment.id,row.coachId);if(!bound||bound!==row.stripeConnectAccountId)throw Error('Coach binding mismatch');
  const account=await get('/v1/account');if(account.object!=='account'||account.id!==environment.platform)throw Error('Platform mismatch');
  const checkout=await object(row.stripeCheckoutSessionId,'cs_test_','/v1/checkout/sessions/','checkout.session');
  const result={environmentId:environment.id,platformAccountId:account.id,platformVerified:true,boundCoachId:row.coachId,boundAccountId:bound,livemode:checkout.livemode,checkout};
  // Unpaid sessions have no necessary PI yet; planner will leave them unchanged.
  if(checkout.payment_status!=='paid'||checkout.status!=='complete')return result;
  const intent=await object(checkout.payment_intent,'pi_','/v1/payment_intents/','payment_intent');checkout.payment_intent=intent.id;
  const charge=await object(intent.latest_charge,'ch_','/v1/charges/','charge');intent.latest_charge=charge;
  intent.transfer_data={...intent.transfer_data,destination:id(intent.transfer_data?.destination)};
  charge.payment_intent=id(charge.payment_intent);charge.transfer=id(charge.transfer);charge.application_fee=id(charge.application_fee)??null;
  const refunds=await list('/v1/refunds?payment_intent='+encodeURIComponent(intent.id));
  for(const refund of refunds.data){refund.payment_intent=id(refund.payment_intent);refund.transfer_reversal=id(refund.transfer_reversal);}
  Object.assign(result,{intent,refunds});
  if(refunds.data.some(r=>r.status==='succeeded')){
   const transfer=await object(charge.transfer,'tr_','/v1/transfers/','transfer');transfer.destination=id(transfer.destination);transfer.source_transaction=id(transfer.source_transaction);
   transfer.reversals=await list('/v1/transfers/'+encodeURIComponent(transfer.id)+'/reversals');
   for(const reversal of transfer.reversals.data){reversal.transfer=id(reversal.transfer);reversal.source_refund=id(reversal.source_refund);}
   result.transfer=transfer;
   if(row.financials?.platformFeeCents>0){const fee=await object(charge.application_fee,'fee_','/v1/application_fees/','application_fee');fee.account=id(fee.account);fee.charge=id(fee.charge);fee.originating_transaction=id(fee.originating_transaction);fee.refunds=await list('/v1/application_fees/'+encodeURIComponent(fee.id)+'/refunds');for(const refund of fee.refunds.data)refund.fee=id(refund.fee);result.fee=fee;}
  }
  return result;
 }
 return {readSnapshot:snapshot};
}
