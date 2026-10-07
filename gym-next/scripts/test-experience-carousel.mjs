import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
try {
  await page.goto(process.env.BASE_URL ?? "http://127.0.0.1:3017/", { waitUntil: "commit", timeout: 30000 });
  await page.waitForTimeout(2200);
  await page.locator("[data-gsap-scene=experiences]").scrollIntoViewIfNeeded();
  const next = page.getByRole("button", { name: "Expérience suivante" });
  const counters = [];
  for (let i = 0; i < 5; i += 1) {
    counters.push(await page.locator(".experienceCounter").innerText());
    await next.click();
    await page.waitForTimeout(120);
  }
  await page.screenshot({ path: ".playwright-cli/experience-coverflow.png" });
  console.log(JSON.stringify({ counters, visibleSlides: await page.locator(".experienceSlide").count(), activeSlides: await page.locator(".experienceSlideActive").count() }));
} finally { await browser.close(); }
