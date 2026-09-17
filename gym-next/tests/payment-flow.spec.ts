import { expect, test } from "@playwright/test";

test("le paiement est verrouillé avant acceptation puis confirmé après", async ({ page, request }) => {
  const created = await request.post("/api/reservations", {
    data: {
      coachId: "steven-fordant",
      service: "Coaching basketball",
      duration: "1 heure",
      price: 35,
      slots: ["2026-09-25 18:00"],
    },
  });
  expect(created.status()).toBe(201);
  const reservation = (await created.json()).data;

  const paymentUrl = `/paiement?coach=Steven%20Fordant&city=Marseille&service=Coaching%20basketball&duration=1%20heure&price=35&slot=18:00&reservationId=${reservation.id}`;
  await page.goto("/compte", { waitUntil: "networkidle" });
  await page.locator("#account-email").fill("sportif@example.com");
  await page.locator("#account-password").fill("demo-password");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await page.goto(paymentUrl, { waitUntil: "networkidle" });
  await expect(page.locator('[data-payment-status]')).toHaveText("En attente de validation par le coach.");
  await expect(page.getByRole("button", { name: "Paiement indisponible" })).toBeDisabled();

  const signIn = await request.post("/api/auth/sign-in", {
    data: { email: "coach@example.com", password: "demo-password", role: "coach" },
  });
  const sessionCookie = signIn.headers()["set-cookie"].split(";")[0];
  const accepted = await request.patch(`/api/reservations/${reservation.id}`, {
    data: { status: "accepted" },
    headers: { Cookie: sessionCookie },
  });
  expect(accepted.status()).toBe(200);

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Payer et confirmer" })).toBeEnabled();
  const paymentResponse = page.waitForResponse((response) => response.url().includes(`/api/reservations/${reservation.id}/payment`) && response.request().method() === "POST");
  await page.getByRole("button", { name: "Payer et confirmer" }).click();
  expect((await paymentResponse).json()).resolves.toMatchObject({ data: { confirmationStatus: "queued" } });
  await expect(page.getByRole("button", { name: "Paiement confirme" })).toBeVisible();
  await page.locator('[data-review-form] textarea').fill("Très bonne séance");
  await page.getByRole("button", { name: "Publier mon avis" }).click();
  await expect(page.locator('[data-review-success]')).toHaveText("Merci pour votre avis.");

  await page.goto("/compte", { waitUntil: "networkidle" });
  const athleteReservation = page.locator(`[data-athlete-reservation="${reservation.id}"]`);
  await expect(athleteReservation).toBeVisible();
  await athleteReservation.getByRole("button", { name: "Annuler la réservation", exact: true }).click();
  await expect(athleteReservation.locator("[data-athlete-reservation-status]")).toHaveText("Statut : cancelled");
  await expect(athleteReservation).toContainText("Remboursement : 100%");
});
