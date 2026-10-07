import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
try {
  await page.goto("http://127.0.0.1:3014/", { waitUntil: "commit", timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.locator("[data-gsap-scene=experiences]").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: ".playwright-cli/experience-current.png" });
  console.log(JSON.stringify({ media: await page.locator(".experienceMedia").boundingBox(), gallery: await page.locator(".experienceGallery img").count(), arrows: await page.locator(".experienceControls button").count() }));
} finally { await browser.close(); }
