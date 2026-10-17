const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('../gym-next/node_modules/@playwright/test');
const root = path.resolve(__dirname, '..');
const out = path.resolve(root, process.argv[3] || 'docs/assets/retours-beta-2026-10-17');
const input = path.resolve(root, process.argv[2] || 'docs/maquettes/retours-beta/index.html');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const checks = [];
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(input).href);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      if (overflow) throw new Error(`Mockup overflow at ${width}`);
      checks.push({ width, overflow });
      if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(out, `maquette-${width}.png`), fullPage: true });
    }
    fs.writeFileSync(path.join(out, 'maquette-checks.json'), JSON.stringify({ mode: 'local mockup only', checks }, null, 2) + '\n');
    process.stdout.write('Mockup: 4 widths, no overflow; browser closed.\n');
  } finally { await browser.close(); }
})().catch(error => { process.stderr.write(error.message + '\n'); process.exitCode = 1; });
