import {expect,test} from "@playwright/test";

async function dismiss(page: import("@playwright/test").Page) {
  await expect(page.locator(".cookie-consent-banner,.cookie-preferences-trigger")).toHaveCount(1);
  const refuse=page.getByRole("button",{name:"Refuser le non nécessaire",exact:true});
  if(await refuse.isVisible()) await refuse.click();
}

for(const route of ["/","/recherche?sport=football","/compte"]) {
  test(`footer compact, contrôles séparés et flèche centrée : ${route}`,async({page},info)=>{
    await page.emulateMedia({reducedMotion:"reduce"});await page.goto(route);await dismiss(page);
    const utilities=page.locator("[data-footer-utilities]");
    await expect(utilities.locator(".cookie-preferences-trigger")).toHaveCount(1);
    await expect(page.locator(".cookie-preferences-trigger")).toHaveCount(1);
    await expect(page.locator("footer").getByRole("link",{name:/^Retour en haut/})).toHaveCount(0);
    for(const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
      const footer=page.locator("footer");const rect=await footer.boundingBox();expect(rect!.height).toBeLessThan(route==="/compte"?600:380);
      const button=utilities.getByRole("link",{name:"Remonter en haut de la page",exact:true});
      await expect(button).toBeVisible();
      const {outer,inner}=await button.evaluate(element=>({outer:element.getBoundingClientRect().toJSON(),inner:element.querySelector("svg")!.getBoundingClientRect().toJSON()}));
      expect(Math.abs((outer!.x+outer!.width/2)-(inner!.x+inner!.width/2))).toBeLessThan(.6);
      expect(Math.abs((outer!.y+outer!.height/2)-(inner!.y+inner!.height/2))).toBeLessThan(.6);
      expect(outer!.width).toBeGreaterThanOrEqual(44);expect(outer!.height).toBeGreaterThanOrEqual(44);
      const controls=await utilities.locator(".cookie-preferences-trigger,.back-to-top").evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}));
      const links=await footer.locator("a:not(.back-to-top)").evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,href:e.getAttribute("href")};}));
      for(const a of controls)for(const b of links)expect(a.x+a.w<=b.x+1||b.x+b.w<=a.x+1||a.y+a.h<=b.y+1||b.y+b.h<=a.y+1).toBe(true);
      expect(links.some(link=>/^#(?:instagram|facebook|youtube|x)$/.test(link.href??""))).toBe(false);
      if([390,1440].includes(width))await page.screenshot({path:`playwright-artifacts/footer-auth/${route==="/"?"home":route.startsWith("/compte")?"compte":"recherche"}-${width}-${info.project.name}.png`,animations:"disabled"});
    }
    const prefs=utilities.getByRole("button",{name:"Préférences cookies",exact:true});
    await prefs.focus();await prefs.press("Enter");await expect(page.locator(".cookie-consent-banner")).toBeVisible();
    await dismiss(page);await expect(prefs).toBeFocused();
    await utilities.getByRole("link",{name:"Remonter en haut de la page",exact:true}).press("Enter");
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(2);
  });
}

test("sur une page courte, le footer termine le viewport",async({page})=>{
  await page.setViewportSize({width:1440,height:1600});await page.goto("/coachs?sport=football&city=VilleSansCoach");await dismiss(page);
  await expect(page.locator("[data-directory-empty]")).toBeVisible();
  await expect.poll(async()=>{const r=await page.locator("footer").boundingBox();return Math.abs(r!.y+r!.height-1600);}).toBeLessThan(3);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThanOrEqual(1601);
});

test("connexion email préservée ; Google identifié mais désactivé",async({page})=>{
  await page.goto("/compte");await dismiss(page);
  const email=page.getByRole("button",{name:"Se connecter",exact:true});await expect(email.locator("svg")).toHaveCount(1);
  const google=page.getByRole("button",{name:"Continuer avec Google",exact:true});await expect(google).toBeDisabled();await expect(google.locator("img")).toHaveAttribute("src","/design_assets/providers/google-g.png");
  const icon=await google.locator("img").boundingBox(),text=await google.locator("span").boundingBox();expect(icon!.x+icon!.width).toBeLessThan(text!.x);
  await expect(page.getByRole("button",{name:/Gmail/})).toHaveCount(0);
  await expect(page.getByText("Connexion Google indisponible pour le moment. Utilise ton adresse email.",{exact:true}).filter({visible:true})).toBeVisible();
  await page.getByRole("button",{name:"Nouveau ? Inscription",exact:true}).click();
  const role=page.locator('[data-account-role="sportif"]'); if(await role.isVisible()) await role.click();
  await expect(google).toBeDisabled();await expect(page.getByRole("button",{name:"Continuer avec Google",exact:true})).toHaveCount(1);
});
