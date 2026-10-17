import { expect,test } from "@playwright/test";
import type { Reservation } from "../lib/domain";
import { coachMonthlyFinance,hasCoherentDemoPayment } from "../lib/domain/coach-finance";
import { financialSnapshot } from "../lib/domain/commission";
const now=Date.parse("2026-10-18T12:00:00Z");
const proof={mode:"simulated" as const,confirmedAt:"2026-10-16T11:00:00.000Z",reference:"demo-pay-12345678-1234-4234-8234-123456789abc"};
const row=(patch:Partial<Reservation>={}):Reservation=>({id:"cancelled-proof",coachId:"steven-fordant",coachName:"Steven Fordant",sport:"basketball",city:"Paris",service:"Fictif",duration:"1 heure",price:100,slots:[],status:"cancelled",createdAt:"2026-10-15T12:00:00Z",acceptedAt:"2026-10-16T10:00:00Z",cancelledAt:"2026-10-16T12:00:00Z",financials:financialSnapshot(100,1000,1),refundAmount:0,refundStatus:"not_required",demoPaymentConfirmation:proof,...patch});

test("preuve cohérente : remboursement nul, partiel, total et en attente",()=>{
 const source=row(),unchanged=JSON.stringify(source);
 expect(hasCoherentDemoPayment(source,now)).toBe(true);
 expect(hasCoherentDemoPayment(row({acceptedAt:undefined}),now)).toBe(true);expect(hasCoherentDemoPayment(row({acceptedAt:null as unknown as string}),now)).toBe(true);
 const zero=coachMonthlyFinance([source,source,row({id:"other",coachId:"other-coach"})],"steven-fordant",now);expect(zero.documented).toBe(1);expect(zero.ambiguousCancelled).toBe(0);expect(zero.totals).toEqual({grossCents:10000,refundCents:0,feeCents:1000,coachCents:9000});expect(JSON.stringify(source)).toBe(unchanged);
 const partial=coachMonthlyFinance([row({refundAmount:50,refundStatus:"succeeded"})],"steven-fordant",now);expect(partial.totals).toEqual({grossCents:10000,refundCents:5000,feeCents:500,coachCents:4500});
 const full=coachMonthlyFinance([row({refundAmount:100,refundStatus:"succeeded"})],"steven-fordant",now);expect(full.totals).toMatchObject({refundCents:10000,feeCents:0,coachCents:0});
 const pending=coachMonthlyFinance([row({refundAmount:50,refundStatus:"pending"})],"steven-fordant",now);expect(pending.pendingRefunds).toBe(1);expect(pending.totals?.refundCents).toBe(0);
 expect(coachMonthlyFinance([row({refundAmount:undefined})],"steven-fordant",now).missing).toBe(1);
 expect(coachMonthlyFinance([row({createdAt:"2026-09-29T12:00:00Z"})],"steven-fordant",now).documented).toBe(0);
});

test("preuve absente, malformée ou chronologie impossible : annulation ambiguë",()=>{
 const invalid:unknown[]=[undefined,null,[],{}, {...proof,mode:"stripe"},{...proof,reference:"forged"},{...proof,confirmedAt:"invalid"},{...proof,confirmedAt:123},{...proof,confirmedAt:"2026-02-30T11:00:00.000Z"},{...proof,confirmedAt:"2026-10-16T13:00:00.000Z"},{...proof,confirmedAt:"2026-10-16T09:00:00.000Z"},{...proof,confirmedAt:"2026-10-19T12:00:00.000Z"},{...proof,confirmedAt:"2026-10-16T11:00:00+00:00"}];
 for(const value of invalid){const r=row({demoPaymentConfirmation:value as Reservation["demoPaymentConfirmation"]});expect(hasCoherentDemoPayment(r,now)).toBe(false);const result=coachMonthlyFinance([r],"steven-fordant",now);expect(result.ambiguousCancelled).toBe(1);expect(result.totals).toBeNull();}
 for(const patch of [{cancelledAt:undefined},{cancelledAt:"invalid"},{acceptedAt:"invalid"},{acceptedAt:"2026-10-10T11:00:00Z"},{createdAt:"2026-10-17T12:00:00Z"}])expect(hasCoherentDemoPayment(row(patch),now)).toBe(false);
 // Independent historical evidence remains usable, even when the new field is absent/bad.
 for(const patch of [{stripePaymentIntentId:"pi_historical"},{refundStatus:"succeeded" as const,refundAmount:50}])expect(coachMonthlyFinance([row({...patch,demoPaymentConfirmation:undefined})],"steven-fordant",now).documented).toBe(1);
});

test("parcours réel de démo : paiement, annulation sans remboursement et synthèse coach",async({page,request},info)=>{
 const email=`cancel-finance-${info.project.name}@example.com`;
 const signup=await request.post("/api/auth/sign-up",{data:{role:"coach",email,password:"demo-password",firstName:"Annulation",lastName:`Fictif-${info.project.name}`,phone:"0600000000",termsAccepted:true}});expect(signup.status()).toBe(201);const account=(await signup.json()).data,coach={Cookie:signup.headers()["set-cookie"].split(";")[0]};expect(account.coachId).toBeTruthy();
 expect((await request.patch(`/api/coaches/${account.coachId}`,{headers:coach,data:{priceFrom:35}})).status()).toBe(200);
 const login=async(role:string,identity=`${role}@example.com`)=>{const r=await request.post("/api/auth/sign-in",{data:{role,email:identity,password:"demo-password"}});expect(r.status()).toBe(200);return {Cookie:r.headers()["set-cookie"].split(";")[0]};};
 const admin=await login("admin"),athlete=await login("sportif",`buyer-${email}`),foreign=await login("coach");
 expect((await request.patch(`/api/admin/coaches/${account.coachId}`,{headers:admin,data:{verified:true}})).status()).toBe(200);
 const create=async(hours:number)=>{const r=await request.post("/api/reservations",{headers:athlete,data:{coachId:account.coachId,service:"Séance de démonstration",duration:"1 heure",slots:[new Date(Date.now()+hours*3600000).toISOString()],demoPaymentConfirmation:proof}});expect(r.status()).toBe(201);return (await r.json()).data;};
 const paid=await create(6);expect(paid.demoPaymentConfirmation).toBeUndefined();expect((await request.patch(`/api/reservations/${paid.id}`,{headers:coach,data:{status:"accepted"}})).status()).toBe(200);
 const payment=await request.post(`/api/reservations/${paid.id}/payment`,{headers:athlete,data:{demoPaymentConfirmation:proof}});expect(payment.status()).toBe(200);const confirmed=(await payment.json()).data;expect(confirmed.demoPaymentConfirmation.reference).not.toBe(proof.reference);
 const cancel=await request.post(`/api/reservations/${paid.id}/cancel`,{headers:athlete});expect(cancel.status()).toBe(200);const cancelled=(await cancel.json()).data;expect(cancelled).toMatchObject({status:"cancelled",refundAmount:0,refundStatus:"not_required",demoPaymentConfirmation:confirmed.demoPaymentConfirmation});
 expect(coachMonthlyFinance([cancelled],account.coachId).totals).toEqual({grossCents:3500,refundCents:0,feeCents:525,coachCents:2975});
 const unpaid=await create(10);expect((await request.post(`/api/reservations/${unpaid.id}/cancel`,{headers:athlete})).status()).toBe(200);
 const own=(await(await request.get("/api/reservations",{headers:coach})).json()).data;expect(own).toHaveLength(2);const summary=coachMonthlyFinance(own,account.coachId);expect(summary.documented).toBe(1);expect(summary.ambiguousCancelled).toBe(1);expect(summary.totals?.coachCents).toBe(2975);
 expect((await request.get(`/api/reservations?coachId=${account.coachId}`,{headers:foreign})).status()).toBe(403);
 // No route interception: the account reads the reservations persisted by the preceding HTTP flow.
 await page.goto("/compte?mode=coach");await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);const consent=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});if(await consent.isVisible())await consent.click();await page.locator("#account-email").fill(email);await page.locator("#account-password").fill("demo-password");await page.getByRole("button",{name:"Se connecter",exact:true}).click();
 const card=page.locator("#coach-payments");await expect(card.locator('[data-finance-amount="grossCents"]')).toContainText("35,00");await expect(card.locator('[data-finance-amount="refundCents"]')).toContainText("0,00");await expect(card.locator('[data-finance-amount="coachCents"]')).toContainText("29,75");await expect(card).toContainText("paiement antérieur non attesté");await expect(card).toContainText("Période fondée sur la création");
 if(info.project.name==="desktop-chromium")for(const width of [390,1440]){await page.setViewportSize({width,height:1000});await card.scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);await card.screenshot({path:`../docs/assets/cancel-finance-2026-10-18/carte-${width}.png`});}
});
