import { expect, test } from "@playwright/test";
import { financialSnapshot, refundedCommissionCents, validateCommissionBps } from "../lib/domain/commission";

test("commission : bornes, centimes et remboursements conservent l'équilibre", () => {
  for (const bad of [-1, 10001, 12.5, NaN, Infinity, "1500", null]) expect(() => validateCommissionBps(bad)).toThrow();
  for (const bps of [0, 1, 1000, 1500, 9999, 10000]) {
    for (const price of [0, 0.01, 0.03, 0.10, 19.99, 35, 99_999_999]) {
      const s = financialSnapshot(price, bps, 1);
      expect(s.platformFeeCents + s.coachAmountCents).toBe(s.grossCents);
      expect(s.platformFeeCents).toBeGreaterThanOrEqual(0);
      expect(s.platformFeeCents).toBeLessThanOrEqual(s.grossCents);
      expect(refundedCommissionCents(s, s.grossCents)).toBe(s.platformFeeCents);
      expect(refundedCommissionCents(s, 0)).toBe(0);
    }
  }
  expect(financialSnapshot(35, 1500, 1)).toMatchObject({ grossCents: 3500, platformFeeCents: 525, coachAmountCents: 2975 });
  expect(financialSnapshot(0.03, 1500, 1).platformFeeCents).toBe(0);
  expect(financialSnapshot(0.10, 1500, 1).platformFeeCents).toBe(2);
  expect(refundedCommissionCents(financialSnapshot(35, 1500, 1), 1750)).toBe(263);
});

test("seul l'admin ajuste le taux ; les réservations engagées gardent leur historique", async ({ request }, info) => {
  expect((await request.get("/api/admin/commission")).status()).toBe(401);
  const sportif = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", password: "demo-password", role: "sportif" } });
  expect((await request.patch("/api/admin/commission", { headers: { Cookie: sportif.headers()["set-cookie"].split(";")[0] }, data: { bps: 0, version: 1 } })).status()).toBe(401);
  const login = await request.post("/api/auth/sign-in", { data: { email: "admin@example.com", password: "demo-password", role: "admin" } });
  const headers = { Cookie: login.headers()["set-cookie"].split(";")[0] };
  const original = (await (await request.get("/api/admin/commission", { headers })).json()).data;
  const old = (await (await request.post("/api/reservations", { headers: { Cookie: sportif.headers()["set-cookie"].split(";")[0] }, data: { coachId: "steven-fordant", service: "Commission historique", duration: "1 heure", slots: [new Date(Date.now() + 60 * 86400000 + (info.project.name.includes("mobile") ? 86400000 : 0)).toISOString()], price: 1, commissionBps: 0 } })).json()).data;
  const changed = await request.patch("/api/admin/commission", { data: { bps: 1234, version: original.version }, headers });
  expect(changed.status()).toBe(200);
  const settings = (await changed.json()).data;
  expect(settings.history.at(-1)).toMatchObject({ fromBps: original.bps, toBps: 1234 });
  expect((await request.patch("/api/admin/commission", { data: { bps: 0, version: original.version }, headers })).status()).toBe(409);
  expect((await request.patch("/api/admin/commission", { data: { bps: -1, version: settings.version }, headers })).status()).toBe(400);
  expect((await request.patch("/api/admin/commission", { data: { bps: 100, version: settings.version }, headers: { ...headers, origin: "https://untrusted.example" } })).status()).toBe(403);
  const newer = (await (await request.post("/api/reservations", { headers: { Cookie: sportif.headers()["set-cookie"].split(";")[0] }, data: { coachId: "steven-fordant", service: "Nouvelle commission", duration: "1 heure", slots: [new Date(Date.now() + 62 * 86400000 + (info.project.name.includes("mobile") ? 86400000 : 0)).toISOString()], price: 1 } })).json()).data;
  expect(newer.financials).toMatchObject({ grossCents: 3500, commissionBps: 1234, platformFeeCents: 432, coachAmountCents: 3068 });
  const previous = (await (await request.get(`/api/reservations/${old.id}`, { headers })).json()).data;
  expect(previous.financials).toEqual(old.financials);
  expect((await request.patch("/api/admin/commission", { data: { bps: original.bps, version: settings.version }, headers })).status()).toBe(200);
});

test("l'interface admin permet de régler la commission", async ({ page }) => {
  await page.goto("/compte?mode=admin");
  await page.locator("#account-email").fill("admin@example.com");
  await page.locator("#account-password").fill("demo-password");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  const section = page.locator("[data-admin-commission]");
  await expect(section.getByLabel("Commission (%)")).toBeEnabled();
  const previous = await section.getByLabel("Commission (%)").inputValue();
  await section.getByLabel("Commission (%)").fill("12,34");
  await section.getByRole("button", { name: "Enregistrer la commission" }).click();
  await expect(section.getByRole("status")).toContainText("Commission enregistrée");
  await section.getByLabel("Commission (%)").fill(previous);
  await section.getByRole("button", { name: "Enregistrer la commission" }).click();
  await expect(section.getByRole("button", { name: "Enregistrer la commission" })).toBeEnabled();
});
