import { expect, test } from "@playwright/test";

test("l’espace sportif affiche la progression fidélité", async ({ page, request }, testInfo) => {
  const athleteEmail = `loyalty-${Date.now()}@example.com`;
  const slots = testInfo.project.name === "mobile-chromium" ? ["2026-10-11 18:00", "2026-10-12 18:00", "2026-10-13 18:00"] : ["2026-10-01 18:00", "2026-10-02 18:00", "2026-10-03 18:00"];
  for (const slot of slots) {
    const created = await request.post("/api/reservations", {
      data: { coachId: "steven-fordant", service: "Coaching", duration: "1 heure", price: 35, slots: [slot] },
    });
    const reservation = (await created.json()).data;
    const coach = await request.post("/api/auth/sign-in", { data: { email: "coach@example.com", password: "demo-password", role: "coach" } });
    const coachCookie = coach.headers()["set-cookie"].split(";")[0];
    await request.patch(`/api/reservations/${reservation.id}`, { headers: { Cookie: coachCookie }, data: { status: "accepted" } });
    const payer = await request.post("/api/auth/sign-in", { data: { email: athleteEmail, password: "demo-password", role: "sportif" } });
    const payerCookie = payer.headers()["set-cookie"].split(";")[0];
    await request.post(`/api/reservations/${reservation.id}/payment`, { headers: { Cookie: payerCookie } });
  }

  await page.goto("/compte", { waitUntil: "networkidle" });
  await page.locator("#account-email").fill(athleteEmail);
  await page.locator("#account-password").fill("demo-password");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.locator("[data-athlete-dashboard]")).toBeVisible();
  const firstReservation = page.locator("[data-athlete-reservation]").first();
  await expect(firstReservation.locator("[data-athlete-reschedule]")).toBeVisible();
  await firstReservation.locator("[data-reschedule-slot]").fill(testInfo.project.name === "mobile-chromium" ? "2026-10-11 19:00" : "2026-10-01 19:00");
  const rescheduleResponse = page.waitForResponse((response) => response.url().includes("/reschedule") && response.request().method() === "POST");
  await firstReservation.getByRole("button", { name: "Déplacer", exact: true }).click();
  expect((await rescheduleResponse).status()).toBe(200);
  await expect(page.locator("[data-loyalty-count]")).toHaveText("3 séances payées");
});
