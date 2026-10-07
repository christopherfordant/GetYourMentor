import http from "node:http";
import { chromium } from "@playwright/test";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PAD_PLAYWRIGHT_BRIDGE_PORT || 8765);
const TOKEN = process.env.PAD_PLAYWRIGHT_BRIDGE_TOKEN || "getyourmentor-local-bridge";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};

const authorized = (req) => req.headers.authorization === `Bearer ${TOKEN}`;
const readBody = async (req) => {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
};

const server = http.createServer(async (req, res) => {
  if (!authorized(req)) return json(res, 401, { error: "Unauthorized" });
  try {
    if (req.method === "GET" && req.url === "/health") {
      return json(res, 200, { ok: true, url: page.url(), title: await page.title() });
    }
    if (req.method === "POST" && req.url === "/navigate") {
      const { url } = await readBody(req);
      if (!url || !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)) {
        return json(res, 400, { error: "Only localhost URLs are allowed" });
      }
      const response = await page.goto(url, { waitUntil: "networkidle" });
      return json(res, 200, { ok: true, status: response?.status() ?? null, url: page.url() });
    }
    if (req.method === "POST" && req.url === "/evaluate") {
      const { expression } = await readBody(req);
      if (typeof expression !== "string" || expression.length > 2000) return json(res, 400, { error: "Invalid expression" });
      const value = await page.evaluate((source) => Function(`return (${source})`)(), expression);
      return json(res, 200, { ok: true, value });
    }
    if (req.method === "POST" && req.url === "/screenshot") {
      const { path = "playwright-artifacts/pad-bridge.png", fullPage = false } = await readBody(req);
      await page.screenshot({ path, fullPage: Boolean(fullPage) });
      return json(res, 200, { ok: true, path });
    }
    return json(res, 404, { error: "Not found" });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, HOST, () => console.log(`PAD ↔ Playwright bridge listening on http://${HOST}:${PORT}`));
process.on("SIGINT", async () => { await browser.close(); server.close(); process.exit(0); });
process.on("SIGTERM", async () => { await browser.close(); server.close(); process.exit(0); });
