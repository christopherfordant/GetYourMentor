import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
const failedRequests = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("requestfailed", (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));

try {
  await page.goto("http://127.0.0.1:3014/", { waitUntil: "commit", timeout: 30000 });
  await page.waitForTimeout(3500);
  const report = await page.evaluate(() => ({
    title: document.title,
    bodyText: document.body.innerText.slice(0, 250),
    stylesheetCount: document.styleSheets.length,
    hero: (() => { const e = document.querySelector("[data-gsap-hero]"); const r = e?.getBoundingClientRect(); return { rect: r?.toJSON(), display: e ? getComputedStyle(e).display : null }; })(),
    experience: (() => { const e = document.querySelector("[data-gsap-scene=experiences]"); const r = e?.getBoundingClientRect(); return { rect: r?.toJSON(), display: e ? getComputedStyle(e).display : null }; })(),
    images: [...document.images].map((image) => ({ src: image.currentSrc || image.src, complete: image.complete, width: image.naturalWidth, height: image.naturalHeight })),
  }));
  console.log(JSON.stringify({ report, consoleErrors, failedRequests }, null, 2));
} finally {
  await browser.close();
}

