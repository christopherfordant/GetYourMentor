const { chromium } = require("@playwright/test");
const path = require("node:path");

const baseUrl = "http://127.0.0.1:3001";
const outputDir = path.join(process.cwd(), "playwright-artifacts");

const pages = [
  {
    name: "audit-directory.png",
    url: `${baseUrl}/coachs?sport=football&city=Paris`,
  },
  {
    name: "audit-coach.png",
    url: `${baseUrl}/coach?sport=metiers-de-la-forme&city=Lyon&coach=Studio+Form+Marseille`,
  },
  {
    name: "audit-slot.png",
    url:
      `${baseUrl}/creneau?sport=metiers-de-la-forme&city=Lyon&coach=Studio+Form+Marseille` +
      `&service=Coaching+remise+en+forme&duration=45min&price=48+EUR&slot=10%3A00` +
      `&mentor=Studio+Form+Marseille`,
  },
  {
    name: "audit-recap.png",
    url:
      `${baseUrl}/recapitulatif?sport=metiers-de-la-forme&city=Lyon&coach=Studio+Form+Marseille` +
      `&service=Coaching+remise+en+forme&duration=45min&price=48+EUR&slot=10%3A00` +
      `&mentor=Studio+Form+Marseille`,
  },
  {
    name: "audit-payment.png",
    url:
      `${baseUrl}/paiement?sport=metiers-de-la-forme&city=Lyon&coach=Studio+Form+Marseille` +
      `&service=Coaching+remise+en+forme&duration=45min&price=48+EUR&slot=10%3A00` +
      `&mentor=Studio+Form+Marseille`,
  },
];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  for (const entry of pages) {
    console.log(`snapshot: ${entry.url}`);
    await page.goto(entry.url, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(outputDir, entry.name),
      fullPage: false,
    });
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
