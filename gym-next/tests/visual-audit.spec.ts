import { expect, test } from "@playwright/test";

const routes = [
  { slug: "home", path: "/" },
  { slug: "recherche-football", path: "/recherche?sport=football" },
  { slug: "coachs-paris", path: "/coachs?sport=football&city=Paris" },
  { slug: "coach-fitness", path: "/coach?sport=metiers-de-la-forme&city=Lyon&coach=Studio%20Form%20Marseille" },
  { slug: "creneau", path: "/creneau?sport=metiers-de-la-forme&city=Lyon&coach=Studio%20Form%20Marseille&service=Coaching%20remise%20en%20forme&duration=30min&price=35" },
  { slug: "compte", path: "/compte" },
  { slug: "inscription-club", path: "/inscription-club" },
];

for (const route of routes) {
  test(`audit visuel ${route.slug}`, async ({ page }, testInfo) => {
    await page.goto(route.path, { waitUntil: "networkidle" });
    await expect(page.locator("body")).toBeVisible();

    await page.screenshot({
      path: `playwright-artifacts/${testInfo.project.name}-${route.slug}.png`,
      fullPage: true,
    });

    const bodyText = (await page.locator("body").innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(20);
  });
}
