import { expect,test } from "@playwright/test";
import type { Reservation } from "../lib/domain";
import { coachMonthlyFinance } from "../lib/domain/coach-finance";
import { financialSnapshot } from "../lib/domain/commission";
test.use({timezoneId:"America/Los_Angeles"});
const row=(id:string,patch:Partial<Reservation>={}):Reservation=>({id,coachId:"steven-fordant",coachName:"Steven Fordant",sport:"basketball",city:"Paris",service:"Fictif",duration:"1 heure",price:999,slots:[],status:"paid",createdAt:"2026-10-15T12:00:00Z",financials:financialSnapshot(100,1000,1),...patch});

test("période Paris : bornes mensuelles, année et changement d’heure",()=>{
 for(const [now,before,start,end,next] of [
 ["2026-10-18T12:00:00Z","2026-09-30T21:59:59Z","2026-09-30T22:00:00Z","2026-10-31T22:59:59Z","2026-10-31T23:00:00Z"],
 ["2027-01-15T12:00:00Z","2026-12-31T22:59:59Z","2026-12-31T23:00:00Z","2027-01-31T22:59:59Z","2027-01-31T23:00:00Z"]]){
 const result=coachMonthlyFinance([row("before",{createdAt:before}),row("start",{createdAt:start}),row("end",{createdAt:end}),row("next",{createdAt:next})],"steven-fordant",Date.parse(now));expect(result.documented).toBe(2);expect(result.totals?.grossCents).toBe(20000);
 }
});

test("montants historiques, remboursements, doublons et informations absentes",()=>{
 const paid=row("paid"),cancelled=row("cancelled",{status:"cancelled",financials:financialSnapshot(50,1500,2),refundAmount:25,refundStatus:"succeeded",refundedPlatformFeeCents:375});
 const result=coachMonthlyFinance([paid,paid,cancelled,row("foreign",{coachId:"madison-seck"}),row("requested",{status:"requested"}),row("accepted",{status:"accepted"}),row("rejected",{status:"rejected"})],"steven-fordant",Date.parse("2026-10-18T12:00:00Z"));expect(result.documented).toBe(2);expect(result.totals).toEqual({grossCents:15000,refundCents:2500,feeCents:1375,coachCents:11125});
 const unknown=coachMonthlyFinance([row("legacy",{financials:undefined}),row("ambiguous",{status:"cancelled",refundAmount:0,refundStatus:"not_required"}),row("bad-date",{createdAt:"invalid"})],"steven-fordant",Date.parse("2026-10-18T12:00:00Z"));expect(unknown.totals).toBeNull();expect(unknown).toMatchObject({missing:1,ambiguousCancelled:1,undated:1});
 const pending=coachMonthlyFinance([row("pending",{status:"cancelled",refundAmount:100,refundStatus:"pending"})],"steven-fordant",Date.parse("2026-10-18T12:00:00Z"));expect(pending.pendingRefunds).toBe(1);expect(pending.totals?.refundCents).toBe(0);
 const full=coachMonthlyFinance([row("full",{status:"cancelled",refundAmount:100,refundStatus:"succeeded"})],"steven-fordant",Date.parse("2026-10-18T12:00:00Z"));expect(full.totals).toMatchObject({refundCents:10000,feeCents:0,coachCents:0});
 const cent=coachMonthlyFinance([row("tiny",{financials:financialSnapshot(0.10,1500,1)})],"steven-fordant",Date.parse("2026-10-18T12:00:00Z"));expect(cent.totals).toMatchObject({grossCents:10,feeCents:2,coachCents:8});
 for(const patch of [{refundAmount:150},{refundAmount:1.001},{refundedPlatformFeeCents:1001}])expect(coachMonthlyFinance([row("bad",{status:"cancelled",refundAmount:50,refundStatus:"succeeded",...patch})],"steven-fordant",Date.parse("2026-10-18T12:00:00Z")).totals).toBeNull();
});

test("API existante : réservations propres et refus du coach étranger",async({request},info)=>{
 const login=async(role:string,email=`${role}@example.com`)=>{const r=await request.post("/api/auth/sign-in",{data:{role,email,password:"demo-password"}});expect(r.status()).toBe(200);return {Cookie:r.headers()["set-cookie"].split(";")[0]};};
 const athlete=await login("sportif"),coach=await login("coach");const created=await request.post("/api/reservations",{headers:athlete,data:{coachId:"steven-fordant",service:"Isolation montants",duration:"1 heure",slots:[new Date(Date.now()+(info.project.name.includes("mobile")?451:450)*86400000).toISOString()]}});expect(created.status()).toBe(201);const reservation=(await created.json()).data;
 const signup=await request.post("/api/auth/sign-up",{data:{role:"coach",email:`finance-foreign-${info.project.name}@example.com`,password:"demo-password",firstName:"Finance",lastName:`Fictif-${info.project.name}`,phone:"0600000000",termsAccepted:true}});expect(signup.status()).toBe(201);const foreign={Cookie:signup.headers()["set-cookie"].split(";")[0]};
 const own=(await(await request.get("/api/reservations",{headers:coach})).json()).data;expect(own.some((r:{id:string})=>r.id===reservation.id)).toBe(true);
 expect((await(await request.get("/api/reservations",{headers:foreign})).json()).data).toEqual([]);expect((await request.get("/api/reservations?coachId=steven-fordant",{headers:foreign})).status()).toBe(403);
});

test("carte coach : sous-total exact, erreur explicite et quatre largeurs",async({page},info)=>{
 const createdAt=new Date().toISOString();let failed=false;
 await page.route("**/api/reservations",async route=>{if(route.request().method()!=="GET")return route.continue();if(failed)return route.abort();await route.fulfill({json:{data:[row("paid-ui",{createdAt}),row("refund-ui",{createdAt,status:"cancelled",financials:financialSnapshot(50,1500,2),refundAmount:25,refundStatus:"succeeded",refundedPlatformFeeCents:375}),row("legacy-ui",{createdAt,financials:undefined}),row("foreign-ui",{createdAt,coachId:"madison-seck"})]}});});
 await page.goto("/compte?mode=coach");await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);const consent=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});if(await consent.isVisible())await consent.click();await page.locator("#account-email").fill("coach@example.com");await page.locator("#account-password").fill("demo-password");await page.getByRole("button",{name:"Se connecter",exact:true}).click();
 const card=page.locator("#coach-payments");await expect(card.locator('[data-finance-amount="grossCents"]')).toContainText("150,00");await expect(card.locator('[data-finance-amount="coachCents"]')).toContainText("111,25");await expect(card).toContainText("Sous-total partiel");await expect(card).toContainText("pas sur la date de paiement");await expect(card).toContainText("aucun reversement bancaire réel");
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);if(info.project.name==="desktop-chromium"&&[390,1440].includes(width)){await card.scrollIntoViewIfNeeded();await page.screenshot({path:`../docs/assets/coach-finance-2026-10-18/coach-${width}.png`,fullPage:true});await card.screenshot({path:`../docs/assets/coach-finance-2026-10-18/carte-${width}.png`});}}
 failed=true;await page.reload();await expect(card.getByRole("alert")).toContainText("Montants indisponibles");await expect(card.locator("[data-finance-amount]")).toHaveCount(0);
});
