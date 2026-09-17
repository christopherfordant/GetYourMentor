import { expect, test } from "@playwright/test";

test("le tableau de bord admin expose les indicateurs MVP", async ({ page, request }, testInfo) => {
  const anonymous = await request.get("/api/admin/overview");
  expect(anonymous.status()).toBe(401);
  const anonymousUpdate = await request.patch("/api/admin/coaches/steven-fordant", { data: { verified: false } });
  expect(anonymousUpdate.status()).toBe(401);
  const created = await request.post("/api/reservations", {
    data: { coachId: "steven-fordant", service: "Admin demo reservation", duration: "1 heure", price: 35, slots: [testInfo.project.name === "mobile-chromium" ? "2027-01-04 10:00" : "2027-01-03 10:00"] },
  });
  expect(created.status()).toBe(201);

  await page.goto("/compte?mode=admin", { waitUntil: "networkidle" });
  await page.locator("#account-email").fill("admin@example.com");
  await page.locator("#account-password").fill("demo-password");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.locator("[data-admin-dashboard]")).toBeVisible();
  await expect(page.locator("[data-admin-coaches]")).toHaveText(/^[3-9][0-9]*$/);
  await expect(page.locator("[data-admin-verified]")).toHaveText("3");
  const coach = page.locator('[data-admin-coach="steven-fordant"]');
  await expect(coach).toContainText("Vérifié");
  await expect(coach.locator("[data-admin-coach-completeness]")).toHaveText("Profil incomplet");
  await coach.getByRole("button", { name: "Retirer la vérification", exact: true }).click();
  await expect(coach.locator("[data-admin-coach-status]")).toHaveText("À vérifier");
  await expect(page.locator("[data-admin-verified]")).toHaveText("2");
  expect((await request.get("/api/coaches/steven-fordant")).status()).toBe(404);
  expect((await request.post("/api/reservations", {
    data: { coachId: "steven-fordant", service: "Profil non vérifié", duration: "1 heure", slots: ["2027-01-05 10:00"] },
  })).status()).toBe(404);
  await expect(page.locator("[data-admin-reservation-list]")).toBeVisible();
  await page.locator("[data-admin-reservation-search]").fill("Admin demo reservation");
  await expect(page.locator("[data-admin-reservation-list] [data-admin-reservation]").first()).toBeVisible();
  await coach.getByRole("button", { name: "Vérifier", exact: true }).click();
  await expect(page.locator("[data-admin-verified]")).toHaveText("3");
});
