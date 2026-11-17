import { expect, test } from "@playwright/test";
import sitemap from "../app/sitemap";

test("le sitemap ne référence pas l'hôte d'une démonstration", () => {
  const keys = ["DEPLOY_ENV", "GETYOURMENTOR_ALLOW_DEMO", "PAYMENT_PROVIDER", "SESSION_SECRET", "SITE_ID", "NEXT_PUBLIC_APP_URL", "SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY"];
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  Object.assign(process.env, {
    DEPLOY_ENV: "demo", GETYOURMENTOR_ALLOW_DEMO: "true", PAYMENT_PROVIDER: "local",
    SESSION_SECRET: "demo-only-session-secret-with-more-than-32-characters", SITE_ID: "86e0379e-4d1a-4cf0-936c-1439397354f4",
    NEXT_PUBLIC_APP_URL: "https://gym-demo-preview-20261117--getyourmentor-demo-20261014.netlify.app",
  });
  try { expect(sitemap()).toEqual([]); }
  finally {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test("la page d'accueil expose les métadonnées SEO essentielles", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveTitle(/GetYourMentor/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /coach sportif/);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toBeTruthy();
  expect(new URL(canonical!).pathname).toBe("/");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /GetYourMentor/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});

test("robots et sitemap référencent les routes publiques", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  const robotsText = await robots.text();
  expect(robotsText).toContain("Disallow: /api/");
  expect(robotsText).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("<loc>");
  expect(sitemapText).toContain("/recherche");
  expect(sitemapText).toContain("/inscription-club");
});

test("chaque route publique conserve son propre canonical", async ({ page }) => {
  const routes = [
    ["/recherche?sport=football&city=Paris", "/recherche"],
    ["/coachs?sport=basketball&city=Lyon", "/coachs"],
    ["/coach?sport=fitness&city=Paris&coach=Sarah%20Benali", "/coach"],
    ["/inscription-club", "/inscription-club"],
  ] as const;

  for (const [route, expectedPath] of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(new URL(canonical!).pathname).toBe(expectedPath);
  }
});
