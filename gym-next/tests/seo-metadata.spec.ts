import { expect, test } from "@playwright/test";

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
