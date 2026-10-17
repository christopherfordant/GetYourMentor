import { expect,test } from "@playwright/test";
import type { Reservation } from "../lib/domain";
import { confirmDemoReservationPayment,memoryReservations,updatePersistedReservation,getPersistedReservation } from "../lib/repositories/reservation-repository";
import { payReservation } from "../lib/reservations";
import { reservationToRow } from "../lib/repositories/reservation-mapper";
const row=(id:string,patch:Partial<Reservation>={}):Reservation=>({id,ownerEmail:"proof@example.com",coachId:"steven-fordant",coachName:"Steven Fordant",sport:"basketball",city:"Paris",service:"Preuve fictive",duration:"1 heure",price:35,slots:[new Date(Date.now()+500*86400000).toISOString()],status:"accepted",createdAt:new Date().toISOString(),...patch});
const envNames=["NODE_ENV","DEPLOY_ENV","GETYOURMENTOR_ALLOW_DEMO","GETYOURMENTOR_ACCEPTANCE_MODE","NEXT_PUBLIC_APP_URL","PAYMENT_PROVIDER","SESSION_SECRET","SITE_ID","SUPABASE_URL","NEXT_PUBLIC_SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","SUPABASE_ANON_KEY","STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET","RESEND_API_KEY","NETLIFY_BLOBS_CONTEXT"];
function environment(hosted=false){const saved=Object.fromEntries(envNames.map(key=>[key,process.env[key]]));for(const key of envNames)delete process.env[key];Object.assign(process.env,{NODE_ENV:"development",GETYOURMENTOR_ALLOW_DEMO:"true",PAYMENT_PROVIDER:"local"});if(hosted)Object.assign(process.env,{NODE_ENV:"production",DEPLOY_ENV:"demo",NEXT_PUBLIC_APP_URL:"https://proof-fictif.netlify.app",SITE_ID:"fictitious-site",SESSION_SECRET:"fictitious-session-secret-not-used-1234567890"});return ()=>{for(const key of envNames){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key];}};}

test("mémoire : échec sans preuve, historique absent et protection des mises à jour",async()=>{
 const restore=environment();const prefix=`proof-unit-${Date.now()}`;
 try{
  const invalid=row(`${prefix}-requested`,{status:"requested"});memoryReservations.push(invalid);await expect(confirmDemoReservationPayment(invalid.id,invalid.ownerEmail)).rejects.toThrow();expect(invalid.demoPaymentConfirmation).toBeUndefined();
  const past=row(`${prefix}-past`,{slots:["2020-01-01T10:00:00Z"]});memoryReservations.push(past);await expect(confirmDemoReservationPayment(past.id,past.ownerEmail)).rejects.toThrow();expect(past.demoPaymentConfirmation).toBeUndefined();
  const legacy=row(`${prefix}-legacy`,{status:"paid",slots:[new Date(Date.now()+501*86400000).toISOString()]});memoryReservations.push(legacy);const old=await confirmDemoReservationPayment(legacy.id,legacy.ownerEmail);expect(old?.confirmedNow).toBe(false);expect(old?.reservation.demoPaymentConfirmation).toBeUndefined();
  const valid=row(`${prefix}-valid`,{slots:[new Date(Date.now()+502*86400000).toISOString()]});memoryReservations.push(valid);const first=await confirmDemoReservationPayment(valid.id,valid.ownerEmail);expect(first?.confirmedNow).toBe(true);const proof=first!.reservation.demoPaymentConfirmation;expect(proof).toMatchObject({mode:"simulated"});expect(proof?.confirmedAt).toMatch(/Z$/);
  await expect(confirmDemoReservationPayment(valid.id,"foreign@example.com")).rejects.toThrow();
  const stripe=row(`${prefix}-stripe`,{slots:[new Date(Date.now()+503*86400000).toISOString()]});memoryReservations.push(stripe);const realPath=await payReservation(stripe.id,stripe.ownerEmail,"pi_fictitious_unit_only");expect(realPath?.stripePaymentIntentId).toBe("pi_fictitious_unit_only");expect(realPath?.demoPaymentConfirmation).toBeUndefined();
  const mapped=reservationToRow(first!.reservation);expect(mapped).not.toHaveProperty("demo_payment_confirmation");expect(mapped).not.toHaveProperty("demoPaymentConfirmation");
  const cancelled=await updatePersistedReservation(valid.id,{status:"cancelled",demo_payment_confirmation:{mode:"simulated",confirmedAt:"forged",reference:"forged"}});expect(cancelled?.demoPaymentConfirmation).toEqual(proof);expect((await getPersistedReservation(valid.id))?.demoPaymentConfirmation).toEqual(proof);
 }finally{for(let i=memoryReservations.length-1;i>=0;i--)if(memoryReservations[i].id.startsWith(prefix))memoryReservations.splice(i,1);restore();}
});

test("adaptateur Blobs hors ligne : CAS, relecture, annulation et échec de stockage",async()=>{
 const restore=environment(true),originalFetch=globalThis.fetch;
 const contextGlobal=globalThis as typeof globalThis & {netlifyBlobsContext?:string};const oldContext=contextGlobal.netlifyBlobsContext;
 contextGlobal.netlifyBlobsContext=Buffer.from(JSON.stringify({siteID:"fictitious-site",token:"fictitious-token",edgeURL:"https://blobs.invalid",uncachedEdgeURL:"https://blobs.invalid"})).toString("base64");
 let state={reservations:[row("hosted-proof")],coaches:[],users:{},clubs:[],messages:[],reviews:[]},version=1,conflicts=0,forceConflict=true,failAllWrites=false,calls=0;
 globalThis.fetch=async(input,init)=>{
  const url=typeof input==="string"?input:input instanceof URL?input.href:input.url;expect(new URL(url).origin).toBe("https://blobs.invalid");calls++;
  const method=(init?.method ?? "GET").toUpperCase();
  if(method==="GET")return new Response(JSON.stringify(state),{headers:{ETag:`version-${version}`,"Content-Type":"application/json"}});
  if(method!=="PUT")throw new Error("Requête réseau imprévue");
  const body=await new Response(init?.body).text();const expected=new Headers(init?.headers).get("if-match");
  if(forceConflict||failAllWrites||expected!==`version-${version}`){forceConflict=false;conflicts++;return new Response("",{status:412});}
  state=JSON.parse(body);version++;return new Response("",{headers:{ETag:`version-${version}`}});
 };
 try{
  const settled=await Promise.allSettled(Array.from({length:4},()=>confirmDemoReservationPayment("hosted-proof","proof@example.com")));
  const attempts=settled.map(result=>{if(result.status!=="fulfilled")throw result.reason;return result.value;});
  expect(attempts.filter(result=>result?.confirmedNow)).toHaveLength(1);const proof=attempts[0]!.reservation.demoPaymentConfirmation;expect(attempts.every(result=>JSON.stringify(result?.reservation.demoPaymentConfirmation)===JSON.stringify(proof))).toBe(true);expect(conflicts).toBeGreaterThan(0);
  expect((await getPersistedReservation("hosted-proof"))?.demoPaymentConfirmation).toEqual(proof);
  await updatePersistedReservation("hosted-proof",{status:"cancelled",refund_amount:35,refund_status:"succeeded"});expect((await getPersistedReservation("hosted-proof"))?.demoPaymentConfirmation).toEqual(proof);
  state.reservations.push(row("hosted-failed",{slots:[new Date(Date.now()+501*86400000).toISOString()]}));failAllWrites=true;
  await expect(confirmDemoReservationPayment("hosted-failed","proof@example.com")).rejects.toThrow("occupée");expect(state.reservations.find(r=>r.id==="hosted-failed")?.status).toBe("accepted");expect(state.reservations.find(r=>r.id==="hosted-failed")?.demoPaymentConfirmation).toBeUndefined();expect(calls).toBeGreaterThan(0);
 }finally{globalThis.fetch=originalFetch;if(oldContext===undefined)delete contextGlobal.netlifyBlobsContext;else contextGlobal.netlifyBlobsContext=oldContext;restore();}
});

test("API : confirmation serveur unique, champs forgés et conservation après remboursement",async({request},info)=>{
 const login=async(role:string,email=`${role}@example.com`)=>{const r=await request.post("/api/auth/sign-in",{data:{role,email,password:"demo-password"}});expect(r.status()).toBe(200);return {Cookie:r.headers()["set-cookie"].split(";")[0]};};
 const athlete=await login("sportif",`proof-${info.project.name}@example.com`),foreign=await login("sportif",`proof-other-${info.project.name}@example.com`),coach=await login("coach");
 const created=await request.post("/api/reservations",{headers:athlete,data:{coachId:"steven-fordant",service:"Paiement fictif daté",duration:"1 heure",slots:[new Date(Date.now()+(info.project.name.includes("mobile")?504:503)*86400000).toISOString()],demoPaymentConfirmation:{reference:"forged"}}});expect(created.status()).toBe(201);const initial=(await created.json()).data;expect(initial.demoPaymentConfirmation).toBeUndefined();const endpoint=`/api/reservations/${initial.id}/payment`;
 expect((await request.post(endpoint,{headers:athlete})).status()).toBe(409);expect((await(await request.get(`/api/reservations/${initial.id}`,{headers:athlete})).json()).data.demoPaymentConfirmation).toBeUndefined();
 expect((await request.post(endpoint,{headers:foreign})).status()).toBe(403);expect((await request.get(`/api/reservations/${initial.id}`,{headers:foreign})).status()).toBe(403);
 expect((await request.patch(`/api/reservations/${initial.id}`,{headers:coach,data:{status:"accepted"}})).status()).toBe(200);
 const before=Date.now();const attempts=await Promise.all(Array.from({length:6},()=>request.post(endpoint,{headers:athlete,data:{confirmedAt:"2000-01-01T00:00:00Z",reference:"forged",ownerEmail:"foreign@example.com",demoPaymentConfirmation:{mode:"simulated",confirmedAt:"forged",reference:"forged"}}})));expect(attempts.every(r=>r.status()===200)).toBe(true);
 const rows=await Promise.all(attempts.map(async r=>(await r.json()).data));const proof=rows[0].demoPaymentConfirmation;expect(proof.mode).toBe("simulated");expect(proof.reference).toMatch(/^demo-pay-[a-f0-9-]{36}$/);expect(Date.parse(proof.confirmedAt)).toBeGreaterThanOrEqual(before);expect(Date.parse(proof.confirmedAt)).toBeLessThanOrEqual(Date.now());expect(new Set(rows.map(r=>JSON.stringify(r.demoPaymentConfirmation))).size).toBe(1);expect(rows.every(r=>r.status==="paid")).toBe(true);expect(rows[0].financials).toEqual(initial.financials);
 expect((await(await request.post(endpoint,{headers:athlete})).json()).data.demoPaymentConfirmation).toEqual(proof);expect((await request.post(endpoint,{headers:foreign})).status()).toBe(403);
 const cancelled=await request.post(`/api/reservations/${initial.id}/cancel`,{headers:athlete});expect(cancelled.status()).toBe(200);const final=(await cancelled.json()).data;expect(final).toMatchObject({status:"cancelled",refundStatus:"succeeded",refundPercent:100,demoPaymentConfirmation:proof});expect((await(await request.get(`/api/reservations/${initial.id}`,{headers:athlete})).json()).data.demoPaymentConfirmation).toEqual(proof);expect((await request.post(endpoint,{headers:athlete})).status()).toBe(409);
});
