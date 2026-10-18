import {expect,test,type Page} from "@playwright/test";
import {parsePlanningData} from "../components/account-legacy/planning-data";
const offer=(title="Séance fictive")=>({id:title,coachId:"steven-fordant",title,duration:"1 heure",slots:["2028-10-18T12:00:00Z"],createdAt:"2026-10-18T12:00:00Z",capacity:4});
const affiliation={id:"planning-fixture",structureEmail:"club@example.com",requestedBy:"club",createdAt:"2026-10-18T12:00:00Z",coachId:"steven-fordant",coachName:"Steven Fordant",status:"accepted",structureConsent:true,coachConsent:true};
function deferred(){let resolve!:()=>void;const promise=new Promise<void>(r=>resolve=r);return {promise,resolve};}
async function login(page:Page,role:string){
 await page.goto(`/compte?mode=${role}`);await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);const refuse=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});if(await refuse.isVisible())await refuse.click();await page.locator("#account-email").fill(`${role}@example.com`);await page.locator("#account-password").fill("demo-password");await page.getByRole("button",{name:"Se connecter",exact:true}).click();await expect(page.locator("[data-account-session]")).toBeVisible();
}
async function fixture(page:Page,role:string){
 const state={offers:[] as ReturnType<typeof offer>[],failure:"" as ""|"http"|"network"|"malformed",target:"offers",posts:0,reads:0,postHold:null as null|{started:ReturnType<typeof deferred>;release:ReturnType<typeof deferred>},post:"refused" as "refused"|"success-read-error"|"uncertain",hold:null as null|{started:ReturnType<typeof deferred>;release:ReturnType<typeof deferred>;finished:ReturnType<typeof deferred>}};
 const path=role==="coach"?"/api/coaches/sessions":"/api/structures/offers";
 const install=async(resource:string,pattern:string)=>page.route(pattern,async route=>{
  if(route.request().method()==="POST"){
   state.posts++;const postGate=state.postHold;state.postHold=null;if(postGate){postGate.started.resolve();await postGate.release.promise;}
   if(state.post==="refused")return route.fulfill({status:409,json:{error:"Profil ou affiliation à vérifier"}});
   if(state.post==="uncertain")return route.fulfill({status:201,json:{unexpected:true}});
   const created=offer("Séance publiée fictive");state.offers=[created];state.failure="http";state.target="offers";return route.fulfill({status:201,json:{data:created}});
  }
  if(resource==="offers")state.reads++;
  const data=resource==="offers"?structuredClone(state.offers):resource==="reservations"?[]:[affiliation];const failure=state.target===resource?state.failure:"";
  const gate=resource==="offers"?state.hold:null;if(gate){state.hold=null;gate.started.resolve();await gate.release.promise;}
  try{
   if(failure==="network")await route.abort();else if(failure==="http")await route.fulfill({status:503,json:{error:"Lecture indisponible"}});else if(failure==="malformed")await route.fulfill({json:{data:[{slots:null}]}});else await route.fulfill({json:{data,...(resource==="affiliations"?{candidates:[]}: {})}});
  }catch{/* An obsolete browser request may already be aborted. */}finally{gate?.finished.resolve();}
 });
 await install("offers",`**${path}**`);
 if(role==="club"){await install("reservations","**/api/structures/reservations");await install("affiliations","**/api/affiliations");}
 return {state,freeze:()=>{const gate={started:deferred(),release:deferred(),finished:deferred()};state.hold=gate;return gate;}};
}
test("contrats de lecture : enveloppes, champs et consentements",()=>{
 expect(parsePlanningData({data:[]})).toEqual({offers:[],reservations:[],coaches:[]});
 expect(parsePlanningData({data:[offer()]},{data:[]},{data:[affiliation,affiliation,{...affiliation,coachId:"pending",status:"pending"}]}).coaches).toEqual([{id:"steven-fordant",name:"Steven Fordant"}]);
 for(const bad of [null,{}, {data:null},{data:[{...offer(),slots:null}]},{data:[{...offer(),title:undefined}]},{data:[{...offer(),capacity:"4"}]}])expect(()=>parsePlanningData(bad)).toThrow();
 expect(()=>parsePlanningData({data:[]},{data:[{price:35}]})).toThrow();expect(()=>parsePlanningData({data:[]},{data:[]},{data:[{...affiliation,coachConsent:"true"}]})).toThrow();
 expect(parsePlanningData({data:[]},{data:[]},{data:[{...affiliation,coachConsent:false}]}).coaches).toEqual([]);
});
for(const role of ["coach","club"]){
 const selector=role==="coach"?"[data-coach-sessions]":"[data-structure-sessions]";
 test(`${role} : chargement, vide réel, actualisation, erreurs et quatre largeurs`,async({page},info)=>{
  const {state,freeze}=await fixture(page,role);const gate=freeze();await login(page,role);const card=page.locator(selector),publish=card.getByRole("button",{name:"Publier la séance",exact:true});await gate.started.promise;await expect(card).toContainText("Chargement du planning…");await expect(card).not.toContainText("Aucune séance publiée");await expect(publish).toBeDisabled();gate.release.resolve();await expect(card).toContainText("Aucune séance publiée.");await expect(publish).toBeEnabled();
  state.offers=[offer()];const refresh=card.getByRole("button",{name:"Actualiser le planning",exact:true});await refresh.focus();await page.keyboard.press("Enter");await expect(card).toContainText("Séance fictive");
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);if(info.project.name==="desktop-chromium"&&[390,1440].includes(width)){await page.setViewportSize({width,height:2400});await card.evaluate(element=>window.scrollTo(0,Math.max(0,element.getBoundingClientRect().top+window.scrollY-160)));await card.locator("img").evaluateAll(async images=>{await Promise.all(images.map(i=>(i as HTMLImageElement).decode()));});await card.screenshot({path:`../docs/assets/planning-states-2026-10-18/${role}-${width}.png`});}}
  state.failure="http";await refresh.click();await expect(card.locator("[data-planning-error]")).toContainText("n’ont pas pu être actualisées");await expect(card).toContainText("Séance fictive");await expect(publish).toBeDisabled();await expect(card).not.toContainText("Aucune séance publiée");
  if(info.project.name==="desktop-chromium"){await page.setViewportSize({width:390,height:2400});await card.evaluate(element=>window.scrollTo(0,Math.max(0,element.getBoundingClientRect().top+window.scrollY-160)));await card.screenshot({path:`../docs/assets/planning-states-2026-10-18/${role}-erreur-390.png`});}
  for(const failure of ["network","malformed"] as const){state.failure=failure;await card.getByRole("button",{name:"Réessayer",exact:true}).click();await expect(card.locator("[data-planning-error]")).toBeVisible();await expect(publish).toBeDisabled();}
  state.failure="";await card.getByRole("button",{name:"Réessayer",exact:true}).click();await expect(publish).toBeEnabled();
  if(role==="club"){for(const target of ["affiliations","reservations"]){state.target=target;state.failure="malformed";await refresh.click();await expect(card.locator("[data-planning-error]")).toBeVisible();await expect(publish).toBeDisabled();await expect(card).not.toContainText("Un accord réciproque avec un coach est nécessaire");state.failure="";await card.getByRole("button",{name:"Réessayer",exact:true}).click();await expect(publish).toBeEnabled();}}
  state.target="offers";state.failure="http";await page.reload();await expect(card.locator("[data-planning-error]")).toContainText("Aucune donnée du planning n’a pu être vérifiée");await expect(card).not.toContainText("Aucune séance publiée");await expect(card).not.toContainText("Aucune demande pour vos séances");expect(state.posts).toBe(0);
 });
 test(`${role} : publication refusée, succès suivi d’échec de lecture, résultat incertain sans double envoi`,async({page})=>{
  const {state}=await fixture(page,role);await login(page,role);const card=page.locator(selector),publish=card.getByRole("button",{name:"Publier la séance",exact:true});await expect(publish).toBeEnabled();await card.getByLabel("Nom de la séance",{exact:true}).fill("Publication fictive");await card.getByLabel("Créneau de la séance",{exact:true}).fill(new Date(Date.now()+60*86400000).toISOString().slice(0,16));if(role==="coach")await card.getByLabel("Lieu de rendez-vous",{exact:true}).fill("Terrain fictif");
  const postGate={started:deferred(),release:deferred()};state.postHold=postGate;const reads=state.reads;await publish.click();await postGate.started.promise;await page.evaluate(()=>window.dispatchEvent(new Event("gym-affiliations-updated")));await expect(card.locator("[data-planning-error]")).toContainText("affiliations ont changé");expect(state.reads).toBe(reads);postGate.release.resolve();await expect(card.locator("[data-planning-publication]")).toContainText("Publication refusée");await expect(publish).toBeEnabled();expect(state.reads).toBe(reads+1);expect(state.posts).toBe(1);await expect(card).not.toContainText("Séance publiée. Un élève");
  state.post="success-read-error";await card.locator("form").evaluate(form=>{(form as HTMLFormElement).requestSubmit();(form as HTMLFormElement).requestSubmit();});await expect(card.locator("[data-planning-publication]")).toContainText("Séance publiée. Un élève");await expect(card.locator("[data-planning-error]")).toBeVisible();expect(state.posts).toBe(2);await expect(publish).toBeDisabled();
  state.failure="";await card.getByRole("button",{name:"Réessayer",exact:true}).click();await expect(card).toContainText("Séance publiée fictive");await expect(publish).toBeEnabled();expect(state.posts).toBe(2);
  state.post="uncertain";await publish.click();await expect(card.locator("[data-planning-publication]")).toContainText("non confirmé");await expect(publish).toBeDisabled();expect(state.posts).toBe(3);await card.getByRole("button",{name:"Actualiser le planning",exact:true}).click();await expect(publish).toBeEnabled();expect(state.posts).toBe(3);
 });
 test(`${role} : réponse obsolète ignorée et déconnexion pendant une lecture`,async({page})=>{
  const {state,freeze}=await fixture(page,role);state.offers=[offer("Ancienne séance fictive")];await login(page,role);const card=page.locator(selector);await expect(card).toContainText("Ancienne séance fictive");
  const old=freeze();await card.getByRole("button",{name:"Actualiser le planning",exact:true}).click();await old.started.promise;await expect(card).toContainText("Actualisation du planning…");state.offers=[offer("Nouvelle séance fictive")];await page.evaluate(()=>window.dispatchEvent(new Event("gym-affiliations-updated")));await expect(card).toContainText("Nouvelle séance fictive");old.release.resolve();await old.finished.promise;await expect(card).not.toContainText("Ancienne séance fictive");
  const closing=freeze();await card.getByRole("button",{name:"Actualiser le planning",exact:true}).click();await closing.started.promise;await page.getByRole("button",{name:"Se déconnecter",exact:true}).click();await expect(card).toHaveCount(0);closing.release.resolve();await closing.finished.promise;await page.unrouteAll({behavior:"wait"});const other=role==="coach"?"club":"coach";await login(page,other);await expect(page.locator(other==="coach"?"[data-coach-sessions]":"[data-structure-sessions]")).toBeVisible();await expect(page.locator("main")).not.toContainText("Nouvelle séance fictive");
 });
}
