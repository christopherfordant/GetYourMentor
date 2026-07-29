const { chromium } = require("@playwright/test");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(
    "http://127.0.0.1:3001/coach?sport=metiers-de-la-forme&city=Lyon&coach=Studio+Form+Marseille",
    { waitUntil: "networkidle" },
  );

  const data = await page.evaluate(() => {
    const gallery = document.querySelector(".booking-gallery-profile .booking-gallery-main");
    const score = document.querySelector(".booking-score-panel-side");
    const pane = document.querySelector(".booking-pane-side");
    const hero = document.querySelector(".booking-profile-hero");
    const profileTop = document.querySelector(".booking-profile-top");
    const tabs = document.querySelector(".booking-tabs-profile");

    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };

    return {
      gallery: rect(gallery),
      score: rect(score),
      pane: rect(pane),
      hero: rect(hero),
      profileTop: rect(profileTop),
      tabs: rect(tabs),
      scrollY: window.scrollY,
      scoreStyle: score ? window.getComputedStyle(score).cssText : null,
      paneStyle: pane ? window.getComputedStyle(pane).cssText : null,
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
