import { chromium } from "@playwright/test";
import path from "node:path";
import os from "node:os";

const url = "https://mentor-homepage.preview.emergentagent.com/";
// Emergent renders only after its client-side preview handshake. A headless
// context receives the HTTP shell but never hydrates, so use a visible,
// persistent context for the audit. Set EMERGENT_HEADLESS=1 for diagnostics.
const headless = process.env.EMERGENT_HEADLESS === "1";
const context = await chromium.launchPersistentContext(
  path.join(os.tmpdir(), "getyourmentor-emergent-playwright"),
  {
    channel: "msedge",
    headless,
    viewport: { width: 1440, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  },
);
const page = context.pages()[0] ?? await context.newPage();

try {
  const response = await page.goto(url, { waitUntil: "commit", timeout: 60000 });
  await page.waitForFunction(() => document.body?.innerText?.trim().length > 0, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const shell = await page.locator("body").innerText().catch(() => "");
  if (!shell.trim() || /^Loading\.\.\.$/.test(shell.trim())) {
    console.error(JSON.stringify({
      error: "Emergent preview did not hydrate in this browser context",
      status: response?.status() ?? null,
      title: await page.title(),
      body: shell.slice(0, 200),
      next: "Run this script visibly and complete any preview/login/consent prompt in the opened Edge window.",
    }, null, 2));
    throw new Error("Emergent preview did not hydrate");
  }

  const header = await page.locator("header, main > div").first().evaluate((element) => ({
    text: element.innerText,
    rect: (() => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })(),
  }));

  const controls = await page.locator("header button, header a").evaluateAll((elements) => elements.map((element) => ({
    tag: element.tagName,
    text: element.innerText.trim(),
    aria: element.getAttribute("aria-label"),
    href: element.getAttribute("href"),
  })));

  const language = page.getByRole("button", { name: /sélecteur de langue|langue|FR/i }).first();
  let languageState = { found: await language.count() > 0 };
  if (languageState.found) {
    await language.evaluate((element) => element.click());
    await page.waitForTimeout(250);
    languageState = {
      ...languageState,
      bodyExcerpt: (await page.locator("body").innerText()).slice(0, 700),
      menus: await page.locator("[role=menu], select, option").count(),
    };
  }

  const links = await page.locator("header a").evaluateAll((elements) => elements.map((element) => ({
    text: element.innerText.trim(),
    href: element.href,
  })));

  console.log(JSON.stringify({ url: page.url(), title: await page.title(), header, controls, languageState, links }, null, 2));
} finally {
  await context.close();
}
