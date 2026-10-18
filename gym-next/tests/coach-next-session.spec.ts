import { expect, test, type Page } from "@playwright/test";
import type { Reservation } from "../lib/domain";
import { coachNextSession } from "../lib/domain/coach-next-session";
import { formatBookingSlot } from "../lib/domain/booking-time";
const now=Date.parse("2026-10-18T12:00:00Z");
const row=(id:string,start:string,patch:Partial<Reservation>={}):Reservation=>({id,coachId:"steven-fordant",coachName:"Steven Fordant",sport:"basketball",city:"Marseille",service:id,duration:"1 heure",price:35,status:"accepted",createdAt:"2026-10-01T12:00:00Z",slots:[start],...patch});
async function login(page:Page,email="coach@example.com") {
 await page.goto("/compte?mode=coach");await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);const refuse=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});if(await refuse.isVisible())await refuse.click();await page.locator("#account-email").fill(email);await page.locator("#account-password").fill("demo-password");await page.getByRole("button",{name:"Se connecter",exact:true}).click();
}
test("prochaine séance : tri, statuts, fin exacte, doublons et propriétaire",()=>{
 const past=row("past","2026-10-17T12:00:00Z"),later=row("later","2026-10-19T12:00:00Z"),soon=row("soon","2026-10-18T13:00:00Z",{status:"paid"}),ongoing=row("ongoing","2026-10-18T11:30:00Z");
 const records=[past,later,row("cancel","2026-10-18T12:01:00Z",{status:"cancelled"}),row("request","2026-10-18T12:02:00Z",{status:"requested"}),row("rejected","2026-10-18T12:02:00Z",{status:"rejected"}),row("foreign","2026-10-18T12:03:00Z",{coachId:"foreign"}),soon,soon];const before=JSON.stringify(records);
 expect(coachNextSession(records,"steven-fordant",now).next?.reservation.id).toBe("soon");expect(coachNextSession([...records,ongoing],"steven-fordant",now)).toMatchObject({ongoing:true,next:{reservation:{id:"ongoing"}}});expect(coachNextSession([ongoing],"steven-fordant",Date.parse("2026-10-18T12:30:00Z")).next).toBeNull();expect(coachNextSession([ongoing],"steven-fordant",Date.parse("2026-10-18T11:30:00Z")).ongoing).toBe(true);expect(JSON.stringify(records)).toBe(before);
});
test("horaires : rendez-vous retenu, propositions multiples, date invalide et DST",()=>{
 const proposed=["2026-10-18T13:00:00Z","2026-10-18T14:00:00Z"];
 const unknown=[row("multiple",proposed[0],{slots:proposed}),row("invalid","2026-02-30T13:00:00Z"),row("duration",proposed[0],{duration:"invalid"}),row("no-offset","2026-10-18T13:00:00"),row("bad-agreed",proposed[0],{appointmentAt:"invalid"})];expect(coachNextSession(unknown,"steven-fordant",now)).toMatchObject({next:null,unknownSchedule:5});
 expect(coachNextSession([row("agreed",proposed[0],{slots:proposed,appointmentAt:proposed[1]})],"steven-fordant",now).next?.start).toBe(Date.parse(proposed[1]));
 const dst=coachNextSession([row("later","2026-10-25T02:30:00+01:00"),row("first","2026-10-25T02:30:00+02:00")],"steven-fordant",Date.parse("2026-10-24T12:00:00Z"));expect(dst.next?.reservation.id).toBe("first");expect(formatBookingSlot("2026-10-25T00:30:00Z")).toContain("02:30");expect(coachNextSession([],"steven-fordant",now)).toMatchObject({next:null,unknownSchedule:0});
});
test("carte : vraie prochaine séance, clavier, quatre largeurs et états distincts",async({page},info)=>{
 await page.clock.install({time:new Date(now)});let mode:"rows"|"empty"|"error"="rows";
 const records=[row("Passée","2026-10-17T12:00:00Z"),row("Plus tard","2026-10-20T12:00:00Z"),row("Annulée","2026-10-18T12:10:00Z",{status:"cancelled"}),row("Première séance","2026-10-18T13:00:00Z"),row("Horaire incertain","invalid")];
 await page.route("**/api/reservations",route=>mode==="error"?route.abort():route.fulfill({json:{data:mode==="empty"?[]:records}}));
 await login(page);const card=page.locator('[data-coach-display-block="next-session"]');await expect(card).toContainText("Première séance");await expect(card).toContainText("Acceptée · paiement en attente");await expect(card).toContainText("horaire non déterminé");await expect(card).not.toContainText("Plus tard");await expect(card).toContainText(formatBookingSlot("2026-10-18T13:00:00Z"));
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);if(width===1440)expect((await card.locator("time").boundingBox())!.height).toBeLessThan(50);if(info.project.name==="desktop-chromium"&&[390,1440].includes(width)){await card.scrollIntoViewIfNeeded();await card.screenshot({path:`../docs/assets/coach-next-2026-10-18/carte-${width}.png`});}}
 const link=card.getByRole("link",{name:"Suivre les demandes et paiements"});await link.focus();await expect(link).toBeFocused();await page.keyboard.press("Enter");await expect(page).toHaveURL(/#coach-requests$/);
 await page.clock.fastForward(61*60*1000);await expect(card).toContainText("Séance en cours");await page.clock.fastForward(60*60*1000);await expect(card).toContainText("Plus tard");
 mode="empty";await page.reload();await expect(card).toContainText("Aucune séance datée à venir ou en cours.");mode="error";await page.reload();await expect(card.getByRole("alert")).toContainText("Planning indisponible");await expect(card.locator("[data-coach-next-empty]")).toHaveCount(0);
});
test("parcours enregistré : demande, acceptation, lecture coach et annulation",async({page,request},info)=>{
 const email=`next-session-${info.project.name}@example.com`;
 const signup=await request.post("/api/auth/sign-up",{data:{role:"coach",email,password:"demo-password",firstName:"Planning",lastName:`Fictif-${info.project.name}`,phone:"0600000000",termsAccepted:true}});expect(signup.status()).toBe(201);const account=(await signup.json()).data,coach={Cookie:signup.headers()["set-cookie"].split(";")[0]};
 expect((await request.patch(`/api/coaches/${account.coachId}`,{headers:coach,data:{priceFrom:35}})).status()).toBe(200);
 const adminLogin=await request.post("/api/auth/sign-in",{data:{role:"admin",email:"admin@example.com",password:"demo-password"}});expect(adminLogin.status()).toBe(200);const admin={Cookie:adminLogin.headers()["set-cookie"].split(";")[0]};expect((await request.patch(`/api/admin/coaches/${account.coachId}`,{headers:admin,data:{verified:true}})).status()).toBe(200);
 const sign=await request.post("/api/auth/sign-in",{data:{role:"sportif",email:"sportif@example.com",password:"demo-password"}});const athlete={Cookie:sign.headers()["set-cookie"].split(";")[0]};
 const start=new Date(Date.now()+100*86400000).toISOString();const created=await request.post("/api/reservations",{headers:athlete,data:{coachId:account.coachId,service:"Planning enregistré",duration:"1 heure",slots:[start]}});expect(created.status()).toBe(201);const reservation=(await created.json()).data;
 expect((await request.patch(`/api/reservations/${reservation.id}`,{headers:coach,data:{status:"accepted"}})).status()).toBe(200);
 await login(page,email);const card=page.locator('[data-coach-display-block="next-session"]');await expect(card).toContainText("Planning enregistré");await expect(card).toContainText(formatBookingSlot(start));
 expect((await request.post(`/api/reservations/${reservation.id}/cancel`,{headers:athlete})).status()).toBe(200);await page.reload();await expect(card).toContainText("Aucune séance datée à venir ou en cours.");
});
