import { expect, test } from "@playwright/test";

test("aperçus : droits serveur, isolation, version et aucune activation financière", async ({request},info)=>{
  expect((await request.get("/api/offers/preview")).status()).toBe(401);
  const login=async(role:string,email=`offers-${info.project.name}-${role}@example.com`)=>{
    const response=await request.post("/api/auth/sign-in",{data:{role,email,password:"demo-password"}});expect(response.status()).toBe(200);return {Cookie:response.headers()["set-cookie"].split(";")[0]};
  };
  const coach=await login("coach"),club=await login("club"),athlete=await login("sportif"),other=await login("coach",`other-offers-${info.project.name}@example.com`),admin=await login("admin","admin@example.com");
  const commissionBefore=await(await request.get("/api/admin/commission",{headers:admin})).json();
  const input={action:"select",planId:"coach-premium",expectedVersion:0,requestId:`choose-${info.project.name}`,owner:"forged@example.com",premiumEnabled:true,sessionCommissionBps:0};
  for(const headers of [athlete,admin])expect((await request.post("/api/offers/preview",{headers,data:input})).status()).toBe(403);
  expect((await request.post("/api/offers/preview",{headers:club,data:input})).status()).toBe(403);
  const selected=await request.post("/api/offers/preview",{headers:coach,data:input});expect(selected.status()).toBe(200);const own=(await selected.json()).data;
  expect(own.preview).toMatchObject({planId:"coach-premium",version:1});expect(own.effective).toMatchObject({premiumEnabled:false,billingEnabled:false,sessionCommissionBps:commissionBefore.data.bps});
  expect(Object.keys(own.preview).sort()).toEqual(["planId","version","updatedAt"].sort());
  expect((await(await request.post("/api/offers/preview",{headers:coach,data:input})).json()).data.preview.version).toBe(1);
  expect((await request.post("/api/offers/preview",{headers:coach,data:{...input,action:"clear"}})).status()).toBe(409);
  expect((await request.post("/api/offers/preview",{headers:coach,data:{action:"clear",expectedVersion:0,requestId:"stale-clear"}})).status()).toBe(409);
  const foreign=await request.get("/api/offers/preview?email=forged@example.com",{headers:other});expect((await foreign.json()).data.preview).toMatchObject({planId:null,version:0});
  const parallel=await Promise.all(Array.from({length:6},(_,i)=>request.post("/api/offers/preview",{headers:other,data:{...input,requestId:`race-${i}-${info.project.name}`}})));
  expect(parallel.filter(r=>r.status()===200)).toHaveLength(1);expect(parallel.filter(r=>r.status()===409)).toHaveLength(5);
  expect((await request.post("/api/offers/preview",{headers:coach,data:{action:"clear",expectedVersion:1,requestId:"clear-success"}})).status()).toBe(200);
  const duplicates=await Promise.all(Array.from({length:6},()=>request.post("/api/offers/preview",{headers:coach,data:{...input,expectedVersion:2,requestId:"parallel-repeat"}})));
  expect(duplicates.every(r=>r.status()===200)).toBe(true);
  const saved=await request.get("/api/offers/preview",{headers:coach});expect((await saved.json()).data.preview.version).toBe(3);
  const structure=await request.post("/api/offers/preview",{headers:club,data:{action:"select",planId:"structure",expectedVersion:0,requestId:"club-preview"}});expect(structure.status()).toBe(200);expect((await structure.json()).data.effective.premiumEnabled).toBe(false);
  expect((await request.post("/api/offers/preview",{headers:{...club,Origin:"https://foreign.example"},data:input})).status()).toBe(403);
  expect((await request.post("/api/offers/preview",{headers:club,data:"not-json"})).status()).toBe(400);
  expect((await request.post("/api/offers/preview",{headers:club,data:{padding:"x".repeat(5000)}})).status()).toBe(413);
  const commissionAfter=await(await request.get("/api/admin/commission",{headers:admin})).json();expect(commissionAfter).toEqual(commissionBefore);
});

for(const role of ["coach","club"]){
  test(`interface ${role} : réponse perdue, aperçu réversible et responsive`,async({page},info)=>{
    await page.goto(`/compte?mode=${role}`);await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);const dismiss=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});if(await dismiss.isVisible())await dismiss.click();
    await page.locator("#account-email").fill(`offers-ui-${role}-${info.project.name}@example.com`);await page.locator("#account-password").fill("demo-password");await page.getByRole("button",{name:"Se connecter",exact:true}).click();await page.getByRole("link",{name:"Offres et aperçu de démonstration"}).click();
    const root=page.locator("[data-offer-explorer]");await expect(root).toHaveAttribute("aria-busy","false");
    await expect(root).toContainText("19,99");await expect(root).toContainText("29,99");await expect(root).toContainText("3,99");await expect(root).toContainText("aucun total récurrent calculé");
    let first=true;const keys:string[]=[];
    await page.route("**/api/offers/preview",async route=>{
      if(route.request().method()==="POST"){keys.push(route.request().postDataJSON().requestId);if(first){first=false;await route.fetch();await route.abort();return;}}
      await route.continue();
    });
    const choose=root.getByRole("button",{name:"Choisir cet aperçu uniquement",exact:true});await choose.focus();await expect(choose).toBeFocused();await page.keyboard.press("Enter");await expect(root.getByRole("alert")).toBeVisible();await expect(choose).toBeEnabled();await choose.click();await expect(root.getByText("Aperçu enregistré. Aucun abonnement ni avantage Premium activé.",{exact:true})).toBeVisible();expect(keys).toHaveLength(2);expect(keys[0]).toBe(keys[1]);
    await expect(root.getByRole("button",{name:"Aperçu sélectionné",exact:true})).toBeDisabled();await expect(root.locator("[data-effective-commission]")).toContainText("15 %");
    for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);if(info.project.name==="desktop-chromium"&&[390,1440].includes(width))await page.screenshot({path:`../docs/assets/offres-demo-2026-10-17/${role}-${width}.png`,fullPage:true});}
    await root.getByRole("button",{name:"Effacer mon aperçu",exact:true}).click();await expect(root.locator("[data-selected-offer]")).toContainText("Aucun aperçu sélectionné");await page.reload();await expect(root).toHaveAttribute("aria-busy","false");await expect(root.locator("[data-selected-offer]")).toContainText("Aucun aperçu sélectionné");
    let fail=true;await page.route("**/api/offers/preview",async route=>{if(route.request().method()==="GET"&&fail){fail=false;await route.abort();}else await route.continue();});
    await root.getByRole("button",{name:"Actualiser mon aperçu"}).click();await expect(root.getByRole("alert")).toBeVisible();await root.getByRole("button",{name:"Actualiser mon aperçu"}).click();await expect(root).toHaveAttribute("aria-busy","false");await expect(root.getByRole("alert")).toHaveCount(0);
  });
}
