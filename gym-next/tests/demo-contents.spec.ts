import { expect, test } from "@playwright/test";

test("contenus : propriétaire, brouillons, achat atomique et accès protégé",async({request},info)=>{
 const login=async(role:string,email=`${role}@example.com`)=>{const r=await request.post("/api/auth/sign-in",{data:{role,email,password:"demo-password"}});expect(r.status()).toBe(200);return {Cookie:r.headers()["set-cookie"].split(";")[0],"x-forwarded-for":info.project.name.includes("mobile")?"192.0.2.121":"192.0.2.120"};};
 expect((await request.get("/api/contents",{headers:{Cookie:""}})).status()).toBe(401);
 const coach=await login("coach"),athlete=await login("sportif",`content-buyer-${info.project.name}@example.com`),other=await login("sportif",`content-other-${info.project.name}@example.com`),club=await login("club"),admin=await login("admin");
 const commission=await(await request.get("/api/admin/commission",{headers:admin})).json();
 const body={action:"create",requestId:`content-${info.project.name}`,title:`Ressource ${info.project.name}`,summary:"Présentation fictive publique",body:"SECRET-FICTIF <script>window.contentLeak=true</script>",priceCents:1001,demoAcknowledged:true,owner:"forged",premiumEnabled:true};
 for(const headers of [athlete,club,admin])expect((await request.post("/api/contents",{headers,data:body})).status()).toBe(403);
 const signup=await request.post("/api/auth/sign-up",{data:{role:"coach",email:`content-foreign-${info.project.name}@example.com`,password:"demo-password",firstName:"Contenu",lastName:`Fictif-${info.project.name}`,phone:"0600000000",termsAccepted:true}});expect(signup.status()).toBe(201);const foreignCoach={Cookie:signup.headers()["set-cookie"].split(";")[0]};
 const foreignCreate=await request.post("/api/contents",{headers:foreignCoach,data:{...body,requestId:`foreign-${info.project.name}`,title:"Brouillon coach non validé"}});expect(foreignCreate.status()).toBe(200);const foreignId=(await foreignCreate.json()).data.owned[0].id;
 expect((await request.post("/api/contents",{headers:foreignCoach,data:{action:"publish",id:foreignId,expectedVersion:1}})).status()).toBe(403);
 expect((await request.get(`/api/contents/${foreignId}`,{headers:coach})).status()).toBe(404);
 expect((await request.post("/api/contents",{headers:coach,data:{...body,priceCents:-1}})).status()).toBe(400);
 expect((await request.post("/api/contents",{headers:coach,data:{...body,demoAcknowledged:false}})).status()).toBe(400);
 const created=await request.post("/api/contents",{headers:coach,data:body});expect(created.status()).toBe(200);const own=(await created.json()).data.owned.find((r:{title:string})=>r.title===body.title);expect(own).toBeTruthy();
 expect(JSON.stringify((await(await request.get("/api/contents",{headers:athlete})).json()).data)).not.toContain(own.id);
 for(const headers of [athlete,other,club,admin])expect((await request.get(`/api/contents/${own.id}?download=1`,{headers})).status()).toBe(404);
 expect((await request.post("/api/contents",{headers:coach,data:body})).status()).toBe(200);
 expect((await request.post("/api/contents",{headers:coach,data:{...body,title:"Autre titre"}})).status()).toBe(409);
 expect((await request.post("/api/contents",{headers:athlete,data:{action:"publish",id:own.id,expectedVersion:1}})).status()).toBe(403);
 expect((await request.post("/api/contents",{headers:coach,data:{action:"publish",id:own.id,expectedVersion:1}})).status()).toBe(200);
 const listed=await(await request.get("/api/contents",{headers:athlete})).json();const row=listed.data.catalogue.find((r:{id:string})=>r.id===own.id);expect(row.version).toBe(2);expect(JSON.stringify(row)).not.toContain("SECRET-FICTIF");expect(JSON.stringify(row)).not.toContain("@example.com");expect(row.owner).toBeUndefined();
 const purchase={action:"purchase",id:row.id,expectedVersion:row.version,expectedPriceCents:1001,demoAcknowledged:true,commissionBps:0,sellerCents:1001};
 expect((await request.post("/api/contents",{headers:athlete,data:{...purchase,expectedPriceCents:1}})).status()).toBe(409);
 expect((await request.post("/api/contents",{headers:athlete,data:{...purchase,demoAcknowledged:false}})).status()).toBe(400);
 const races=await Promise.all(Array.from({length:6},()=>request.post("/api/contents",{headers:athlete,data:purchase})));expect(races.every(r=>r.status()===200)).toBe(true);
 const receipts=(await races[0].json()).data.library.filter((r:{contentId:string})=>r.contentId===row.id);expect(receipts).toHaveLength(1);expect(receipts[0]).toMatchObject({priceCents:1001,commissionCents:200,sellerCents:801,commissionBps:2000});expect(receipts[0].buyer).toBeUndefined();
 const download=await request.get(`/api/contents/${row.id}?download=1`,{headers:athlete});expect(download.status()).toBe(200);expect(download.headers()["content-type"]).toContain("text/plain");expect(download.headers()["content-disposition"]).toContain("attachment");expect(download.headers()["cache-control"]).toContain("no-store");expect(await download.text()).toContain("SECRET-FICTIF");
 expect((await request.get(`/api/contents/${row.id}`,{headers:other})).status()).toBe(404);
 expect((await request.post("/api/contents",{headers:coach,data:{action:"withdraw",id:row.id,expectedVersion:1}})).status()).toBe(409);
 expect((await request.post("/api/contents",{headers:coach,data:{action:"withdraw",id:row.id,expectedVersion:2}})).status()).toBe(200);
 expect((await request.post("/api/contents",{headers:other,data:purchase})).status()).toBe(404);
 expect((await request.get(`/api/contents/${row.id}`,{headers:athlete})).status()).toBe(200);
 expect((await request.post("/api/contents",{headers:coach,data:JSON.stringify({padding:"x".repeat(21000)})})).status()).toBe(413);
 expect((await request.post("/api/contents",{headers:{...coach,Origin:"https://foreign.example"},data:body})).status()).toBe(403);
 expect(await(await request.get("/api/admin/commission",{headers:admin})).json()).toEqual(commission);
});

test("contenus : création, publication et bibliothèque sur quatre largeurs",async({page,request},info)=>{
 const login=async(role:string,email:string)=>{const r=await request.post("/api/auth/sign-in",{data:{role,email,password:"demo-password"}});expect(r.status()).toBe(200);const cookie=r.headers()["set-cookie"].split(";")[0];await page.context().addCookies([{name:"gym_session",value:cookie.slice(cookie.indexOf("=")+1),url:"http://127.0.0.1:3001",httpOnly:true}]);};
 await login("coach","coach@example.com");await page.goto("/contenus");await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);const dismiss=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});if(await dismiss.isVisible())await dismiss.click();
 const root=page.locator("[data-content-explorer]");await expect(root).toHaveAttribute("aria-busy","false");
 const title=`Texte fictif UI ${info.project.name}`;await root.getByLabel("Titre",{exact:true}).fill(title);await root.getByLabel("Présentation publique").fill("Présentation fictive sans conseil médical");await root.getByLabel("Texte réservé aux accès autorisés").fill("Texte fictif privé sans donnée réelle.");await root.getByLabel("Prix fictif en euros").fill("12,50");await root.getByLabel("Je confirme une ressource fictive",{exact:false}).check();
 let first=true;const ids:string[]=[];await page.route("**/api/contents",async route=>{if(route.request().method()==="POST"&&route.request().postDataJSON().action==="create"){ids.push(route.request().postDataJSON().requestId);if(first){first=false;await route.fetch();await route.abort();return;}}await route.continue();});
 await root.getByRole("button",{name:"Enregistrer le brouillon"}).click();await expect(root.getByRole("alert")).toBeVisible();await root.getByRole("button",{name:"Enregistrer le brouillon"}).click();await expect(root.getByRole("alert")).toHaveCount(0);expect(ids).toHaveLength(2);expect(ids[0]).toBe(ids[1]);
 const card=root.locator("section").filter({has:page.getByRole("heading",{name:"Mes ressources",exact:true})}).locator("article").filter({has:page.getByRole("heading",{name:title,exact:true})});await expect(card).toHaveCount(1);await card.getByRole("button",{name:"Publier dans la démo",exact:true}).click();await expect(card).toContainText("Publiée dans la démo");
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);if(info.project.name==="desktop-chromium"&&[390,1440].includes(width))await page.screenshot({path:`../docs/assets/contenus-demo-2026-10-17/coach-${width}.png`,fullPage:true});}
 await login("sportif",`content-ui-${info.project.name}@example.com`);await page.reload();await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);const consentAgain=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});if(await consentAgain.isVisible())await consentAgain.click();await expect(root).toHaveAttribute("aria-busy","false");const sale=root.locator("article").filter({has:page.getByRole("heading",{name:title,exact:true})});await sale.getByRole("checkbox").check();const buy=sale.getByRole("button",{name:"Simuler l’achat"});await buy.focus();await page.keyboard.press("Enter");await expect(root.getByRole("status")).toContainText("Achat simulé enregistré");
 const library=root.locator("section").filter({has:page.getByRole("heading",{name:"Ma bibliothèque",exact:true})});await library.getByRole("button",{name:"Lire la ressource"}).click();await expect(root.locator("[data-content-reader]")).toContainText("Texte fictif privé sans donnée réelle.");await expect(root.getByRole("heading",{name:"Préparer une ressource fictive"})).toHaveCount(0);
 const dl=page.waitForEvent("download");await library.getByRole("link",{name:"Télécharger le texte"}).click();expect((await dl).suggestedFilename()).toMatch(/^ressource-demo-.*\.txt$/);
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);if(info.project.name==="desktop-chromium"&&[390,1440].includes(width))await page.screenshot({path:`../docs/assets/contenus-demo-2026-10-17/sportif-${width}.png`,fullPage:true});}
 await page.reload();await expect(library.getByRole("button",{name:"Lire la ressource"})).toBeVisible();
 await login("coach","coach@example.com");await page.reload();await expect(root).toHaveAttribute("aria-busy","false");
 await root.getByLabel("Titre",{exact:true}).fill(`Brouillon UI à supprimer ${info.project.name}`);await root.getByLabel("Présentation publique").fill("Présentation fictive");await root.getByLabel("Texte réservé aux accès autorisés").fill("Texte de test supprimable.");await root.getByLabel("Prix fictif en euros").fill("1,00");await root.getByLabel("Je confirme une ressource fictive",{exact:false}).check();await root.getByRole("button",{name:"Enregistrer le brouillon"}).click();
 const draft=root.locator("article").filter({has:page.getByRole("heading",{name:`Brouillon UI à supprimer ${info.project.name}`,exact:true})});await expect(draft).toBeVisible();
 if(info.project.name==="desktop-chromium")for(const width of [390,1440]){await page.setViewportSize({width,height:1000});await page.screenshot({path:`../docs/assets/gestion-contenus-2026-10-17/brouillon-${width}.png`,fullPage:true});}
 page.once("dialog",dialog=>dialog.dismiss());await draft.getByRole("button",{name:"Supprimer le brouillon"}).click();await expect(draft).toBeVisible();
 page.once("dialog",dialog=>dialog.accept());await draft.getByRole("button",{name:"Supprimer le brouillon"}).click();await expect(draft).toHaveCount(0);

});


test("contenus : suppression propriétaire et téléchargements bornés",async({request},info)=>{
 const login=async(role:string,email=`${role}@example.com`)=>{const r=await request.post("/api/auth/sign-in",{data:{role,email,password:"demo-password"}});expect(r.status()).toBe(200);return {Cookie:r.headers()["set-cookie"].split(";")[0],"x-forwarded-for":info.project.name.includes("mobile")?"192.0.2.125":"192.0.2.124"};};
 const coach=await login("coach"),foreign=await login("coach",`delete-foreign-${info.project.name}@example.com`),buyer=await login("sportif",`download-buyer-${info.project.name}@example.com`);
 const create=await request.post("/api/contents",{headers:coach,data:{action:"create",requestId:`delete-${info.project.name}`,title:`Brouillon supprimable ${info.project.name}`,summary:"Exemple de démonstration",body:"Texte fictif sans données personnelles.",priceCents:1500,demoAcknowledged:true}});expect(create.status()).toBe(200);const row=(await create.json()).data.owned.find((r:{title:string})=>r.title===`Brouillon supprimable ${info.project.name}`);
 const input={action:"delete",id:row.id,expectedVersion:1};
 expect((await request.post("/api/contents",{headers:foreign,data:input})).status()).toBe(404);
 expect((await request.post("/api/contents",{headers:buyer,data:input})).status()).toBe(403);
 expect((await request.post("/api/contents",{headers:coach,data:{...input,expectedVersion:0}})).status()).toBe(409);
 expect((await request.post("/api/contents",{headers:coach,data:{...input,action:"publish"}})).status()).toBe(200);
 expect((await request.post("/api/contents",{headers:coach,data:{...input,expectedVersion:2}})).status()).toBe(409);
 expect((await request.post("/api/contents",{headers:coach,data:{...input,action:"withdraw",expectedVersion:2}})).status()).toBe(200);
 expect((await request.post("/api/contents",{headers:coach,data:{...input,expectedVersion:3}})).status()).toBe(200);
 expect((await request.get(`/api/contents/${row.id}`,{headers:coach})).status()).toBe(404);
 const fresh=await request.post("/api/contents",{headers:coach,data:{action:"create",requestId:`retained-${info.project.name}`,title:`Texte acquis conservé ${info.project.name}`,summary:"Exemple de démonstration",body:"Texte fictif conservé après retrait.",priceCents:1500,demoAcknowledged:true}});const retained=(await fresh.json()).data.owned.find((r:{title:string})=>r.title===`Texte acquis conservé ${info.project.name}`);
 expect((await request.post("/api/contents",{headers:coach,data:{action:"publish",id:retained.id,expectedVersion:1}})).status()).toBe(200);
 expect((await request.post("/api/contents",{headers:buyer,data:{action:"purchase",id:retained.id,expectedVersion:2,expectedPriceCents:1500,demoAcknowledged:true}})).status()).toBe(200);
 const endpoint=`/api/contents/${retained.id}?download=1`;
 const head=await request.head(endpoint,{headers:buyer});expect(head.status()).toBe(200);expect(await head.body()).toHaveLength(0);
 let own=(await(await request.get("/api/contents",{headers:coach})).json()).data.owned.find((r:{id:string})=>r.id===retained.id);expect(own.downloads).toBe(0);
 for(let i=0;i<30;i++)expect((await request.get(endpoint,{headers:buyer})).status()).toBe(200);
 expect((await request.get(endpoint,{headers:buyer})).status()).toBe(429);
 own=(await(await request.get("/api/contents",{headers:coach})).json()).data.owned.find((r:{id:string})=>r.id===retained.id);expect(own.downloads).toBe(30);
 expect((await request.post("/api/contents",{headers:coach,data:{action:"withdraw",id:retained.id,expectedVersion:2}})).status()).toBe(200);
 expect((await request.post("/api/contents",{headers:coach,data:{action:"delete",id:retained.id,expectedVersion:3}})).status()).toBe(409);
 expect((await request.get(`/api/contents/${retained.id}`,{headers:buyer})).status()).toBe(200);
});
