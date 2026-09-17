import { expect, test } from "@playwright/test";

test("un créneau occupé est désactivé dans le calendrier", async ({ page, request }) => {
  const slot = test.info().project.name === "mobile-chromium" ? "11:00" : "10:00";
  const created = await request.post("/api/reservations", {
    data: { coachId: "steven-fordant", service: "Coaching basketball", duration: "1 heure", price: 35, slots: [slot] },
  });
  expect(created.status()).toBe(201);

  await page.goto("/creneau?sport=basketball&city=Marseille&coach=Steven%20Fordant", { waitUntil: "networkidle" });
  const bookedSlot = page.locator(`[data-slot="${slot}"][data-slot-booked="true"]`).first();
  await expect(bookedSlot).toBeDisabled();
  await expect(bookedSlot).toHaveText(`${slot} (pris)`);
});
