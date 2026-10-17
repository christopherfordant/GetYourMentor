import { expect,test } from "@playwright/test";
import { personalSessionSummary } from "../lib/domain/progress-summary";
import type { Reservation } from "../lib/domain";
import { isIsolatedDemoFeatureEnabled } from "../lib/runtime";

test("suivi : créneau écoulé, annulations, groupe et horaire inconnu",()=>{
 const now=Date.parse("2026-10-17T12:00:00Z");
 const row=(id:string,patch:Partial<Reservation>={}):Reservation=>({id,ownerEmail:"fictif@example.com",coachId:"steven-fordant",coachName:"Coach fictif",sport:"basketball",city:"Paris",service:"Séance fictive",duration:"1 heure",price:35,slots:["2026-10-17T11:00:00Z"],status:"paid",createdAt:"2026-10-01T12:00:00Z",...patch});
 const group=row("group",{participantCount:4});
 expect(personalSessionSummary([group,group,row("future",{slots:["2026-10-18T11:00:00Z"]}),row("ongoing",{slots:["2026-10-17T11:30:00Z"]}),row("unknown",{slots:["11:00"]}),row("cancelled",{status:"cancelled"}),row("accepted",{status:"accepted"}),row("requested",{status:"requested"}),row("rejected",{status:"rejected"})],now)).toEqual({elapsedPaid:1,upcomingOrOngoingPaid:2,paidUnknownSchedule:1,acceptedUnpaid:1,requested:1,cancelled:1});
 expect(personalSessionSummary([row("exact")],now-1).elapsedPaid).toBe(0);
 expect(personalSessionSummary([row("selected",{slots:["invalid","invalid"],appointmentAt:"2026-10-17T11:00:00Z"})],now).elapsedPaid).toBe(1);
});

test("garde démo partagée : refus production et mélange Supabase",()=>{
 const names=["NODE_ENV","CI","GETYOURMENTOR_ACCEPTANCE_MODE","GETYOURMENTOR_ALLOW_DEMO","DEPLOY_ENV","SUPABASE_URL","NEXT_PUBLIC_SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"];
 const saved=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 try{for(const name of names)delete process.env[name];Object.assign(process.env,{NODE_ENV:"production"});process.env.GETYOURMENTOR_ALLOW_DEMO="true";expect(isIsolatedDemoFeatureEnabled()).toBe(false);Object.assign(process.env,{NODE_ENV:"development"});expect(isIsolatedDemoFeatureEnabled()).toBe(true);for(const name of ["SUPABASE_URL","NEXT_PUBLIC_SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"]){process.env[name]="fictif";expect(isIsolatedDemoFeatureEnabled()).toBe(false);delete process.env[name];}}
 finally{for(const name of names){if(saved[name]===undefined)delete process.env[name];else process.env[name]=saved[name];}}
});

test("objectif : droits, isolation, conflit et enregistrement sans doublon",async({request},info)=>{
 const login=async(role:string,email=`progress-${role}-${info.project.name}@example.com`)=>{const r=await request.post("/api/auth/sign-in",{data:{role,email,password:"demo-password"}});expect(r.status()).toBe(200);return {Cookie:r.headers()["set-cookie"].split(";")[0],"x-forwarded-for":info.project.name.includes("mobile")?"192.0.2.131":"192.0.2.130"};};
 expect((await request.get("/api/progress",{headers:{Cookie:""}})).status()).toBe(401);
 const athlete=await login("sportif"),other=await login("sportif",`progress-other-${info.project.name}@example.com`);
 const save={action:"save",title:"Objectif fictif régulier",targetSessions:5,demoAcknowledged:true,expectedVersion:0,requestId:`progress-${info.project.name}`,owner:"forged",elapsedPaid:99,premium:true};
 for(const role of ["coach","club","admin"]){const headers=await login(role,`${role}@example.com`);expect((await request.get("/api/progress",{headers})).status()).toBe(403);expect((await request.post("/api/progress",{headers,data:save})).status()).toBe(403);}
 expect((await request.post("/api/progress",{headers:athlete,data:{...save,targetSessions:0}})).status()).toBe(400);
 expect((await request.post("/api/progress",{headers:athlete,data:{...save,targetSessions:1.5}})).status()).toBe(400);
 expect((await request.post("/api/progress",{headers:athlete,data:{...save,demoAcknowledged:false}})).status()).toBe(400);
 const response=await request.post("/api/progress",{headers:athlete,data:save});expect(response.status()).toBe(200);const data=(await response.json()).data;expect(data.goal).toMatchObject({title:save.title,targetSessions:5,version:1});expect(data.attendanceVerified).toBe(false);expect(data.summary.elapsedPaid).toBe(0);expect(data.goal.owner).toBeUndefined();expect(data.goal.requestId).toBeUndefined();
 expect((await(await request.post("/api/progress",{headers:athlete,data:save})).json()).data.goal.version).toBe(1);
 expect((await request.post("/api/progress",{headers:athlete,data:{...save,title:"Autre objectif"}})).status()).toBe(409);
 const foreign=(await(await request.get("/api/progress?ownerEmail=forged",{headers:other})).json()).data;expect(foreign.goal.title).toBeNull();
 const races=await Promise.all(Array.from({length:5},(_,i)=>request.post("/api/progress",{headers:other,data:{...save,requestId:`race-${i}-${info.project.name}`}})));expect(races.filter(r=>r.status()===200)).toHaveLength(1);expect(races.filter(r=>r.status()===409)).toHaveLength(4);
 const reservation=await request.post("/api/reservations",{headers:athlete,data:{coachId:"steven-fordant",service:"Repère de suivi fictif",duration:"1 heure",slots:[new Date(Date.now()+(info.project.name.includes("mobile")?406:405)*86400000).toISOString()]}});expect(reservation.status()).toBe(201);
 expect((await(await request.get("/api/progress",{headers:athlete})).json()).data.summary.requested).toBe(1);expect((await(await request.get("/api/progress",{headers:other})).json()).data.summary.requested).toBe(0);
 expect((await request.post("/api/progress",{headers:athlete,data:{action:"clear",expectedVersion:0,requestId:"stale"}})).status()).toBe(409);
 const clear={action:"clear",expectedVersion:1,requestId:"clear-success"};expect((await request.post("/api/progress",{headers:athlete,data:clear})).status()).toBe(200);const cleared=(await(await request.post("/api/progress",{headers:athlete,data:clear})).json()).data;expect(cleared.goal).toMatchObject({title:null,version:2});expect(cleared.summary.requested).toBe(1);
 expect((await request.post("/api/progress",{headers:{...athlete,Origin:"https://foreign.example"},data:save})).status()).toBe(403);
 expect((await request.post("/api/progress",{headers:athlete,data:"invalid"})).status()).toBe(400);
 expect((await request.post("/api/progress",{headers:athlete,data:{padding:"x".repeat(5000)}})).status()).toBe(413);
});

test("objectif : réponse perdue, clavier, compte et quatre largeurs",async({page},info)=>{
 await page.goto("/compte?mode=sportif");await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);const consent=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});if(await consent.isVisible())await consent.click();
 await page.locator("#account-email").fill(`progress-ui-${info.project.name}@example.com`);await page.locator("#account-password").fill("demo-password");await page.getByRole("button",{name:"Se connecter",exact:true}).click();await page.getByRole("link",{name:"Mon suivi personnel de démonstration"}).click();
 const root=page.locator("[data-personal-progress]");await expect(root).toHaveAttribute("aria-busy","false");await root.getByLabel("Intitulé fictif",{exact:true}).fill("Objectif fictif de régularité");await root.getByLabel("Nombre total de séances visé").fill("8");await root.getByRole("checkbox").check();
 let first=true;const ids:string[]=[];await page.route("**/api/progress",async route=>{if(route.request().method()==="POST"){ids.push(route.request().postDataJSON().requestId);if(first){first=false;await route.fetch();await route.abort();return;}}await route.continue();});
 const save=root.getByRole("button",{name:"Enregistrer l’objectif fictif"});await save.focus();await page.keyboard.press("Enter");await expect(root.getByRole("alert")).toBeVisible();await save.click();await expect(root.getByRole("status")).toContainText("Objectif fictif enregistré");expect(ids[0]).toBe(ids[1]);await expect(root.getByRole("progressbar")).toHaveAttribute("max","8");await page.reload();await expect(root.getByRole("progressbar")).toHaveAttribute("max","8");
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);expect(await root.getByRole("checkbox").locator("..").evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(" ").length)).toBe(2);if(info.project.name==="desktop-chromium"&&[390,1440].includes(width))await page.screenshot({path:`../docs/assets/suivi-demo-2026-10-17/sportif-${width}.png`,fullPage:true});}
 await root.getByRole("button",{name:"Effacer mon objectif"}).click();await expect(root).toContainText("Aucun objectif enregistré");await page.reload();await expect(root).toContainText("Aucun objectif enregistré");
});
