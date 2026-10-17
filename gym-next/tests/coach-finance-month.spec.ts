import { expect,test } from "@playwright/test";
import type { Reservation } from "../lib/domain";
import { coachMonthKey,coachMonthlyFinance,isCoachMonth } from "../lib/domain/coach-finance";
import { financialSnapshot } from "../lib/domain/commission";
test.use({timezoneId:"America/Los_Angeles"});
const row=(id:string,createdAt:string,patch:Partial<Reservation>={}):Reservation=>({id,createdAt,coachId:"steven-fordant",coachName:"Steven Fordant",sport:"basketball",city:"Paris",service:"Fictif",duration:"1 heure",price:35,slots:[],status:"paid",financials:financialSnapshot(35,1500,1),...patch});

test("période explicite : validation, défaut et bornes de mois Paris",()=>{
 const now=Date.parse("2026-10-18T12:00:00Z");expect(isCoachMonth("2100-01")).toBe(true);
 expect(coachMonthlyFinance([],"steven-fordant",now).period).toBe("2026-10");expect(coachMonthlyFinance([],"steven-fordant",now).invalidPeriod).toBe(false);
 for(const value of [null,"",202610,"2026-1","2026-00","2026-13","1999-12","10000-01","2026-10&coach=other"]){expect(isCoachMonth(value)).toBe(false);expect(coachMonthlyFinance([],"steven-fordant",now,value)).toMatchObject({period:"2026-10",invalidPeriod:true});}
 for(const valid of ["2000-01","2026-12","9999-12"])expect(isCoachMonth(valid)).toBe(true);
 for(const [period,before,start,end,next] of [["2026-10","2026-09-30T21:59:59Z","2026-09-30T22:00:00Z","2026-10-31T22:59:59Z","2026-10-31T23:00:00Z"],["2027-01","2026-12-31T22:59:59Z","2026-12-31T23:00:00Z","2027-01-31T22:59:59Z","2027-01-31T23:00:00Z"]]){
  const result=coachMonthlyFinance([row("before",before),row("start",start),row("end",end),row("next",next)],"steven-fordant",now,period);expect(result.period).toBe(period);expect(result.documented).toBe(2);expect(result.totals?.grossCents).toBe(7000);
 }
});

test("mois sélectionné distinct de l’instant de validation ; historique et données manquantes",()=>{
 const now=Date.parse("2026-10-18T12:00:00Z"),proof={mode:"simulated" as const,confirmedAt:"2026-10-16T11:00:00.000Z",reference:"demo-pay-12345678-1234-4234-8234-123456789abc"};
 const paidThenCancelled=row("proof","2026-09-15T12:00:00Z",{status:"cancelled",acceptedAt:"2026-10-16T10:00:00Z",cancelledAt:"2026-10-17T12:00:00Z",demoPaymentConfirmation:proof,refundAmount:0,refundStatus:"not_required"});
 const before=JSON.stringify(paidThenCancelled);const result=coachMonthlyFinance([paidThenCancelled,paidThenCancelled,row("foreign","2026-09-15T12:00:00Z",{coachId:"other"})],"steven-fordant",now,"2026-09");expect(result.documented).toBe(1);expect(result.totals?.coachCents).toBe(2975);expect(JSON.stringify(paidThenCancelled)).toBe(before);
 expect(coachMonthlyFinance([paidThenCancelled],"steven-fordant",now,"2026-10").documented).toBe(0);
 expect(coachMonthlyFinance([{...paidThenCancelled,demoPaymentConfirmation:{...proof,confirmedAt:"2026-11-01T12:00:00.000Z"},cancelledAt:"2026-11-02T12:00:00Z"}],"steven-fordant",now,"2026-09").ambiguousCancelled).toBe(1);
 const unknown=coachMonthlyFinance([row("unknown","invalid")],"steven-fordant",now,"2026-09");expect(unknown.undated).toBe(1);expect(unknown.totals).toBeNull();
 const empty=coachMonthlyFinance([paidThenCancelled],"steven-fordant",now,"2025-01");expect(empty.documented).toBe(0);expect(empty.totals?.grossCents).toBe(0);
});

test("sélecteur natif : appliquer, mois courant, erreur et cohérence des deux résumés",async({page},info)=>{
 const current=coachMonthKey(),[year,month]=current.split("-").map(Number),previous=new Date(Date.UTC(year,month-2,15,12)).toISOString().slice(0,7),empty=`${year+1}-01`;let failed=false;
 const records=[row("current",`${current}-15T12:00:00Z`),row("previous",`${previous}-15T12:00:00Z`,{price:40,financials:financialSnapshot(40,1500,1)}),row("missing",`${previous}-16T12:00:00Z`,{financials:undefined}),row("foreign",`${previous}-15T12:00:00Z`,{coachId:"foreign",financials:financialSnapshot(9999,1500,1)})];
 await page.route("**/api/reservations",async route=>{if(route.request().method()!=="GET")return route.continue();if(failed)return route.abort();await route.fulfill({json:{data:records}});});
 await page.goto("/compte?mode=coach&keep=preserve");await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);const consent=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});if(await consent.isVisible())await consent.click();await page.locator("#account-email").fill("coach@example.com");await page.locator("#account-password").fill("demo-password");await page.getByRole("button",{name:"Se connecter",exact:true}).click();
 const card=page.locator("#coach-payments"),input=card.getByLabel("Mois de création",{exact:true}),overview=page.locator("[data-coach-finance-overview]"),apply=card.getByRole("button",{name:"Appliquer le mois"});const url=page.url(),mutations:string[]=[];page.on("request",request=>{if(request.url().includes("/api/reservations")&&request.method()!=="GET")mutations.push(request.method());});
 await expect(input).toHaveValue(current);await expect(overview).toContainText("29,75");await input.fill(previous);await expect(overview).toContainText("29,75");await apply.focus();await expect(apply).toBeFocused();await page.keyboard.press("Enter");await expect(overview).toContainText("34,00");await expect(card.locator('[data-finance-amount="coachCents"]')).toHaveText(await overview.innerText());await expect(card).toContainText("Sous-total partiel");await expect(card).toContainText("Période fondée sur la création");
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);if(info.project.name==="desktop-chromium"&&[390,1440].includes(width)){await card.scrollIntoViewIfNeeded();await card.screenshot({path:`../docs/assets/finance-month-2026-10-18/carte-${width}.png`});}}
 await input.fill(empty);await apply.click();await expect(overview).toContainText("0,00");await expect(card).toContainText("0 réservation(s) documentée(s)");
 await input.fill("");await apply.click();await expect(card.getByRole("alert")).toContainText("Choisis un mois valide");await expect(overview).toContainText("0,00");await card.getByRole("button",{name:"Mois courant",exact:true}).click();await expect(input).toHaveValue(current);await expect(overview).toContainText("29,75");await expect(card.getByRole("alert")).toHaveCount(0);expect(page.url()).toBe(url);expect(mutations).toEqual([]);
 failed=true;await page.reload();await expect(card.getByRole("alert")).toContainText("Montants indisponibles");await input.fill(previous);await apply.click();await expect(overview).toHaveText("Indisponible");await expect(card.locator("[data-finance-amount]")).toHaveCount(0);
});
