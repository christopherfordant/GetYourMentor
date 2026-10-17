import { expect, test } from "@playwright/test";

test("retours : confidentialité, modération serveur et votes concurrents uniques", async ({ request }, info) => {
  expect((await request.get("/api/feedback")).status()).toBe(401);
  const login = async (role: string) => {
    const response = await request.post("/api/auth/sign-in", { data: { email: `beta-${info.project.name}-${role}@example.com`, role, password: "demo-password" } });
    expect(response.status()).toBe(200); return { Cookie: response.headers()["set-cookie"].split(";")[0] };
  };
  const athlete=await login("sportif"), coach=await login("coach"), club=await login("club");
  const adminResponse=await request.post("/api/auth/sign-in",{data:{email:"admin@example.com",role:"admin",password:"demo-password"}});
  const admin={Cookie:adminResponse.headers()["set-cookie"].split(";")[0]};
  const data={kind:"suggestion",title:"Titre privé",body:"Détail privé à ne pas exposer",requestId:`idea-${info.project.name}`,owner:"club:forged@example.com",published:true};
  const first=await request.post("/api/feedback",{headers:athlete,data});expect(first.status()).toBe(201);const id=(await first.json()).data.id;
  const repeat=await request.post("/api/feedback",{headers:athlete,data});expect((await repeat.json()).data.id).toBe(id);
  expect((await request.post("/api/feedback",{headers:athlete,data:{...data,body:"Contenu différent"}})).status()).toBe(409);
  for(const headers of [coach,club]){
    const mine=await request.get("/api/feedback?view=mine",{headers});expect((await mine.json()).data.some((r:{id:string})=>r.id===id)).toBe(false);
    expect((await request.get("/api/feedback?view=admin",{headers})).status()).toBe(403);
    expect((await request.patch("/api/feedback",{headers,data:{id,action:"moderate",status:"resolved",published:false}})).status()).toBe(403);
  }
  expect((await request.patch("/api/feedback",{headers:coach,data:{id,action:"vote"}})).status()).toBe(404);
  const publish={id,action:"moderate",status:"reviewing",published:true,publicTitle:"Accès au planning",publicSummary:"Simplifier l’accès aux prochaines séances."};
  expect((await request.patch("/api/feedback",{headers:admin,data:{...publish,publicTitle:""}})).status()).toBe(400);
  expect((await request.patch("/api/feedback",{headers:admin,data:publish})).status()).toBe(200);
  const votes=await Promise.all(Array.from({length:20},()=>request.patch("/api/feedback",{headers:coach,data:{id,action:"vote"}})));
  expect(votes.every(r=>r.status()===200)).toBe(true);
  for(const headers of [athlete,club])expect((await request.patch("/api/feedback",{headers,data:{id,action:"vote"}})).status()).toBe(200);
  const listed=await request.get("/api/feedback?view=suggestions",{headers:club});const rows=(await listed.json()).data;const idea=rows.find((r:{id:string})=>r.id===id);
  expect(idea).toMatchObject({title:publish.publicTitle,body:publish.publicSummary,votes:3,voted:true});
  expect(Object.keys(idea).sort()).toEqual(["id","title","body","status","createdAt","votes","voted"].sort());
  expect(JSON.stringify(idea)).not.toContain(data.body);expect(JSON.stringify(idea)).not.toContain("@example.com");
  const own=await request.get("/api/feedback",{headers:athlete});expect((await own.json()).data.find((r:{id:string})=>r.id===id).body).toBe(data.body);
  expect((await request.patch("/api/feedback",{headers:admin,data:{...publish,published:false}})).status()).toBe(200);
  expect((await request.patch("/api/feedback",{headers:athlete,data:{id,action:"vote"}})).status()).toBe(404);
  for(const kind of ["bug","positive"]){
    const response=await request.post("/api/feedback",{headers:club,data:{kind,title:kind,body:"Retour privé",requestId:`${kind}-${info.project.name}`}});expect(response.status()).toBe(201);
    const fid=(await response.json()).data.id;
    expect((await request.patch("/api/feedback",{headers:admin,data:{...publish,id:fid}})).status()).toBe(400);
  }
  expect((await request.post("/api/feedback",{headers:{...club,Origin:"https://foreign.example"},data:{...data,requestId:"origin"}})).status()).toBe(403);
  expect((await request.post("/api/feedback",{headers:club,data:"not-json"})).status()).toBe(400);
  expect((await request.post("/api/feedback",{headers:club,data:{...data,body:"x".repeat(2001),requestId:"long"}})).status()).toBe(400);
  expect((await request.post("/api/feedback",{headers:club,data:{...data,body:"x".repeat(17000),requestId:"huge"}})).status()).toBe(413);
});

test("interface : envoi interrompu, reprise sans doublon, publication et vote", async ({ page, request }, info) => {
  const email=`beta-ui-${info.project.name}@example.com`;
  await page.goto("/compte?mode=sportif");
  const dismiss=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);if(await dismiss.isVisible())await dismiss.click();
  await page.locator("#account-email").fill(email);await page.locator("#account-password").fill("demo-password");await page.getByRole("button",{name:"Se connecter",exact:true}).click();
  await page.getByRole("link",{name:"Retours bêta et suggestions"}).click();
  const root=page.locator("[data-beta-feedback]");await expect(root).toHaveAttribute("aria-busy","false");
  let failLoad=true;
  await page.route("**/api/feedback?view=mine",async route=>{if(failLoad){failLoad=false;await route.abort();}else await route.continue();});
  await root.getByRole("button",{name:"Actualiser les retours"}).click();await expect(root.getByRole("alert")).toBeVisible();
  await root.getByRole("button",{name:"Actualiser les retours"}).click();await expect(root.getByRole("alert")).toHaveCount(0);await expect(root).toHaveAttribute("aria-busy","false");
  const form=root.getByRole("form",{name:"Partager un retour"});await form.getByLabel("Titre",{exact:true}).fill(`Idée UI ${info.project.name}`);await form.getByLabel("Ton message",{exact:true}).fill("Texte privé de recette");
  await form.getByRole("combobox").focus();await page.keyboard.press("Tab");await expect(form.getByLabel("Titre",{exact:true})).toBeFocused();await page.keyboard.press("Tab");await expect(form.getByRole("textbox",{name:"Ton message",exact:true})).toBeFocused();
  let first=true;const keys:string[]=[];
  await page.route("**/api/feedback",async route=>{
    if(route.request().method()==="POST") {keys.push(route.request().postDataJSON().requestId);if(first){first=false;await route.fetch();await route.abort();return;}}
    await route.continue();
  });
  await form.getByRole("button",{name:"Envoyer mon retour"}).click();await expect(form.getByRole("button")).toBeEnabled();await expect(form.getByLabel("Ton message")).toHaveValue("Texte privé de recette");
  await form.getByRole("button",{name:"Envoyer mon retour"}).click();await expect(root.getByText("Ton retour est enregistré. Il reste privé.",{exact:true})).toBeVisible();await expect(root).toHaveAttribute("aria-busy","false");expect(keys).toHaveLength(2);expect(keys[0]).toBe(keys[1]);
  await expect(root.locator("[data-feedback]")).toHaveCount(1);
  // Chromium accepts Secure cookies on loopback; APIRequestContext requires an explicit cookie over HTTP.
  const sessionCookie=(await page.context().cookies()).find(cookie=>cookie.name==="gym_session");expect(sessionCookie).toBeDefined();
  const mine=await page.request.get("/api/feedback",{headers:{Cookie:`gym_session=${sessionCookie!.value}`}});expect(mine.status(),await mine.text()).toBe(200);const id=(await mine.json()).data[0].id;
  const admin=await request.post("/api/auth/sign-in",{data:{role:"admin",email:"admin@example.com",password:"demo-password"}});const cookie=admin.headers()["set-cookie"].split(";")[0];const [name,...value]=cookie.split("=");await page.context().addCookies([{name,value:value.join("="),url:"http://127.0.0.1:3001"}]);
  await page.reload();await expect(root).toHaveAttribute("aria-busy","false");const item=root.locator(`[data-feedback="${id}"]`);const moderation=item.getByRole("form");
  await moderation.getByLabel("Titre partagé",{exact:true}).fill("Suggestion publique de recette");await moderation.getByLabel("Résumé partagé",{exact:true}).fill("Résumé sans détail privé.");await moderation.getByLabel("Publier pour les membres connectés").check();await moderation.getByRole("button",{name:"Enregistrer la modération"}).click();await expect(moderation.getByRole("status")).toContainText("Modération enregistrée");
  const club=await request.post("/api/auth/sign-in",{data:{role:"club",email:`beta-ui-club-${info.project.name}@example.com`,password:"demo-password"}});const c=club.headers()["set-cookie"].split(";")[0];const [cn,...cv]=c.split("=");await page.context().addCookies([{name:cn,value:cv.join("="),url:"http://127.0.0.1:3001"}]);await page.reload();
  const idea=root.locator(`[data-suggestion="${id}"]`);await expect(idea).toBeVisible();await expect(root).not.toContainText("Texte privé de recette");await idea.getByRole("button",{name:"Soutenir cette idée"}).click();await expect(idea.getByRole("button",{name:"Vote enregistré"})).toBeDisabled();
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
    if(info.project.name==="desktop-chromium"&&[390,1440].includes(width))await page.screenshot({path:`../docs/assets/retours-beta-2026-10-17/beta-${width}.png`,fullPage:true});
  }
  expect((await request.patch("/api/feedback",{headers:{Cookie:cookie},data:{action:"moderate",id,status:"reviewing",published:true,publicTitle:"x".repeat(120),publicSummary:"Texte long de recette."}})).status()).toBe(200);
  await page.reload();await expect(root).toHaveAttribute("aria-busy","false");
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);}
});
