import { expect, test } from "@playwright/test";

test("un avis est possible uniquement après paiement", async ({ request }, testInfo) => {
  const slot = testInfo.project.name === "mobile-chromium" ? "2026-09-27 18:00" : "2026-09-26 18:00";
  const created = await request.post("/api/reservations", {
    data: { coachId: "steven-fordant", service: "Coaching", duration: "1 heure", price: 40, slots: [slot] },
  });
  const reservation = (await created.json()).data;

  const sportif = await request.post("/api/auth/sign-in", {
    data: { email: "sportif@example.com", password: "demo-password", role: "sportif" },
  });
  const sportifCookie = sportif.headers()["set-cookie"].split(";")[0];
  const beforePayment = await request.post("/api/reviews", {
    headers: { Cookie: sportifCookie },
    data: { reservationId: reservation.id, rating: 5, comment: "Très bonne séance" },
  });
  expect(beforePayment.status()).toBe(409);

  const coach = await request.post("/api/auth/sign-in", {
    data: { email: "coach@example.com", password: "demo-password", role: "coach" },
  });
  const coachCookie = coach.headers()["set-cookie"].split(";")[0];
  const accepted = await request.patch(`/api/reservations/${reservation.id}`, {
    headers: { Cookie: coachCookie },
    data: { status: "accepted" },
  });
  expect(accepted.status()).toBe(200);
  const payer = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", password: "demo-password", role: "sportif" } });
  const payerCookie = payer.headers()["set-cookie"].split(";")[0];
  const paid = await request.post(`/api/reservations/${reservation.id}/payment`, { headers: { Cookie: payerCookie } });
  expect(paid.status()).toBe(200);

  const review = await request.post("/api/reviews", {
    headers: { Cookie: sportifCookie },
    data: { reservationId: reservation.id, rating: 5, comment: "Très bonne séance" },
  });
  expect(review.status()).toBe(201);
  expect((await review.json()).data.rating).toBe(5);

  const duplicate = await request.post("/api/reviews", {
    headers: { Cookie: sportifCookie },
    data: { reservationId: reservation.id, rating: 4, comment: "Deuxième avis" },
  });
  expect(duplicate.status()).toBe(409);
});

test("un sportif ne peut pas noter la réservation payée d'un autre compte", async ({ request }, testInfo) => {
  const slot = testInfo.project.name === "mobile-chromium" ? "2027-05-13 10:00" : "2027-05-12 10:00";
  const created = await request.post("/api/reservations", {
    data: { coachId: "steven-fordant", service: "Avis propriétaire", duration: "1 heure", price: 35, slots: [slot] },
  });
  expect(created.status()).toBe(201);
  const reservation = (await created.json()).data;
  const owner = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", password: "demo-password", role: "sportif" } });
  const ownerCookie = owner.headers()["set-cookie"].split(";")[0];
  const coach = await request.post("/api/auth/sign-in", { data: { email: "coach@example.com", password: "demo-password", role: "coach" } });
  const coachCookie = coach.headers()["set-cookie"].split(";")[0];
  await request.patch(`/api/reservations/${reservation.id}`, { data: { status: "accepted" }, headers: { Cookie: coachCookie } });
  await request.post(`/api/reservations/${reservation.id}/payment`, { headers: { Cookie: ownerCookie } });
  const other = await request.post("/api/auth/sign-in", { data: { email: "another-sportif@example.com", password: "demo-password", role: "sportif" } });
  const otherCookie = other.headers()["set-cookie"].split(";")[0];
  const review = await request.post("/api/reviews", { data: { reservationId: reservation.id, rating: 5, comment: "Usurpation" }, headers: { Cookie: otherCookie } });
  expect(review.status()).toBe(403);
});
