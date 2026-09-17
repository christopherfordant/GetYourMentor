import { expect, test } from "@playwright/test";

test("le parcours crée une demande avant tout paiement", async ({ request }, testInfo) => {
  const slots = testInfo.project.name === "mobile-chromium" ? ["2026-09-23 18:00", "2026-09-24 18:00"] : ["2026-09-21 18:00", "2026-09-22 18:00"];
  const coaches = await request.get("/api/coaches?sport=basketball&city=Marseille");
  expect(coaches.ok()).toBeTruthy();
  const { data } = await coaches.json();
  expect(data).toHaveLength(1);
  expect(data[0].name).toBe("Steven Fordant");

  const reservation = await request.post("/api/reservations", {
    data: {
      coachId: data[0].id,
      service: "Coaching individuel",
      duration: "1 heure",
      price: 0,
      slots,
    },
  });

  expect(reservation.status()).toBe(201);
  const result = await reservation.json();
  expect(result.data.status).toBe("requested");
  expect(result.data.slots).toHaveLength(2);
  expect(result.data.price).toBe(data[0].priceFrom);

  const payerBefore = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", password: "demo-password", role: "sportif" } });
  const payerBeforeCookie = payerBefore.headers()["set-cookie"].split(";")[0];
  const paymentBeforeAcceptance = await request.post(`/api/reservations/${result.data.id}/payment`, { headers: { Cookie: payerBeforeCookie, "x-reservation-claim-token": result.data.claimToken } });
  expect(paymentBeforeAcceptance.status()).toBe(409);

  const signIn = await request.post("/api/auth/sign-in", {
    data: { email: "coach@example.com", password: "demo-password", role: "coach" },
  });
  expect(signIn.status()).toBe(200);
  const sessionCookie = signIn.headers()["set-cookie"].split(";")[0];

  const accepted = await request.patch(`/api/reservations/${result.data.id}`, {
    data: { status: "accepted" },
    headers: { Cookie: sessionCookie },
  });
  expect(accepted.status()).toBe(200);
  const acceptedResult = await accepted.json();
  expect(acceptedResult.data.status).toBe("accepted");
  expect(acceptedResult.data.reservationCode).toMatch(/^GYM-/);

  const payer = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", password: "demo-password", role: "sportif" } });
  const payerCookie = payer.headers()["set-cookie"].split(";")[0];
  const missingClaim = await request.post(`/api/reservations/${result.data.id}/payment`, { headers: { Cookie: payerCookie } });
  expect(missingClaim.status()).toBe(403);
  const paid = await request.post(`/api/reservations/${result.data.id}/payment`, { headers: { Cookie: payerCookie, "x-reservation-claim-token": result.data.claimToken } });
  expect(paid.status()).toBe(200);
  expect((await paid.json()).data.status).toBe("paid");
});

test("le remboursement suit la fenêtre d’annulation", async ({ request }) => {
  const signIn = await request.post("/api/auth/sign-in", {
    data: { email: "coach@example.com", password: "demo-password", role: "coach" },
  });
  const sessionCookie = signIn.headers()["set-cookie"].split(";")[0];

  async function createPaid(appointmentAt: string) {
    const created = await request.post("/api/reservations", {
      data: { coachId: "steven-fordant", service: "Coaching", duration: "1 heure", price: 40, slots: [appointmentAt], appointmentAt },
    });
    const reservation = (await created.json()).data;
    const accepted = await request.patch(`/api/reservations/${reservation.id}`, {
      data: { status: "accepted" },
      headers: { Cookie: sessionCookie },
    });
    expect(accepted.status()).toBe(200);
    const payer = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", password: "demo-password", role: "sportif" } });
    const payerCookie = payer.headers()["set-cookie"].split(";")[0];
    const paid = await request.post(`/api/reservations/${reservation.id}/payment`, { headers: { Cookie: payerCookie, "x-reservation-claim-token": reservation.claimToken } });
    expect(paid.status()).toBe(200);
    return { id: reservation.id, payerCookie };
  }

  const fullRefundTarget = await createPaid(new Date(Date.now() + 72 * 3_600_000).toISOString());
  const fullRefund = await request.post(`/api/reservations/${fullRefundTarget.id}/cancel`, { headers: { Cookie: fullRefundTarget.payerCookie } });
  expect(fullRefund.status()).toBe(200);
  expect((await fullRefund.json()).data.refundPercent).toBe(100);

  const partialRefundTarget = await createPaid(new Date(Date.now() + 36 * 3_600_000).toISOString());
  const partialRefund = await request.post(`/api/reservations/${partialRefundTarget.id}/cancel`, { headers: { Cookie: partialRefundTarget.payerCookie } });
  expect(partialRefund.status()).toBe(200);
  expect((await partialRefund.json()).data.refundPercent).toBe(50);
});

test("un créneau déjà demandé est bloqué pour le même coach", async ({ request }, testInfo) => {
  const slot = testInfo.project.name === "mobile-chromium" ? "2026-09-28 10:00" : "2026-09-27 10:00";
  const first = await request.post("/api/reservations", {
    data: { coachId: "madison-seck", service: "Coaching football", duration: "1 heure", price: 40, slots: [slot] },
  });
  expect(first.status()).toBe(201);

  const conflict = await request.post("/api/reservations", {
    data: { coachId: "madison-seck", service: "Coaching football", duration: "1 heure", price: 40, slots: [slot] },
  });
  expect(conflict.status()).toBe(409);
});

test("un paiement sans session sportif est refusé", async ({ request }, testInfo) => {
  const slot = testInfo.project.name === "mobile-chromium" ? "2026-11-04 18:00" : "2026-11-03 18:00";
  const created = await request.post("/api/reservations", {
    data: { coachId: "studio-form-marseille", service: "Coaching fitness", duration: "1 heure", price: 35, slots: [slot] },
  });
  expect(created.status()).toBe(201);
  const reservation = (await created.json()).data;
  const coach = await request.post("/api/auth/sign-in", { data: { email: "coach@example.com", password: "demo-password", role: "coach" } });
  const coachCookie = coach.headers()["set-cookie"].split(";")[0];
  await request.patch(`/api/reservations/${reservation.id}`, { headers: { Cookie: coachCookie }, data: { status: "accepted" } });

  const payment = await request.post(`/api/reservations/${reservation.id}/payment`);
  expect(payment.status()).toBe(401);
});

test("un profil coach inconnu renvoie une réponse 404", async ({ request }) => {
  const response = await request.get("/api/coaches/coach-inconnu");
  expect(response.status()).toBe(404);
});

test("une réservation vers un coach inconnu est refusée", async ({ request }) => {
  const response = await request.post("/api/reservations", {
    data: { coachId: "coach-inconnu", service: "Coaching", duration: "1 heure", price: 35, slots: ["2026-12-22 10:00"] },
  });
  expect(response.status()).toBe(404);
});

test("un coach ne peut pas traiter la réservation d'un autre coach", async ({ request }, testInfo) => {
  const slot = testInfo.project.name === "mobile-chromium" ? "2026-12-24 10:00" : "2026-12-21 10:00";
  const created = await request.post("/api/reservations", {
    data: { coachId: "madison-seck", service: "Coaching football", duration: "1 heure", price: 40, slots: [slot] },
  });
  expect(created.status()).toBe(201);
  const reservation = (await created.json()).data;
  const coach = await request.post("/api/auth/sign-in", { data: { email: "coach@example.com", password: "demo-password", role: "coach" } });
  const coachCookie = coach.headers()["set-cookie"].split(";")[0];
  const result = await request.patch(`/api/reservations/${reservation.id}`, { headers: { Cookie: coachCookie }, data: { status: "accepted" } });
  expect(result.status()).toBe(403);
});

test("un coach ne peut pas modifier le profil d'un autre coach", async ({ request }) => {
  const coach = await request.post("/api/auth/sign-in", { data: { email: "coach@example.com", password: "demo-password", role: "coach" } });
  const coachCookie = coach.headers()["set-cookie"].split(";")[0];
  const result = await request.patch("/api/coaches/madison-seck", {
    headers: { Cookie: coachCookie },
    data: { description: "Modification non autorisée" },
  });
  expect(result.status()).toBe(403);
});

test("les réservations publiques sont limitées aux créneaux occupés", async ({ request }) => {
  const publicAll = await request.get("/api/reservations");
  expect(publicAll.status()).toBe(401);

  const publicAvailability = await request.get("/api/reservations?coachId=steven-fordant");
  expect(publicAvailability.status()).toBe(200);
  const payload = await publicAvailability.json();
  expect(payload.data).toEqual(expect.any(Array));
  expect(payload.data.every((item: Record<string, unknown>) => "slots" in item && "status" in item && !("ownerEmail" in item))).toBeTruthy();
});

test("les données bancaires ne sortent pas des endpoints coach publics", async ({ request }) => {
  const list = await request.get("/api/coaches?sport=basketball&city=Marseille");
  expect(list.status()).toBe(200);
  expect((await list.json()).data.every((coach: Record<string, unknown>) => !("bankAccountLast4" in coach))).toBeTruthy();

  const profile = await request.get("/api/coaches/steven-fordant");
  expect(profile.status()).toBe(200);
  expect((await profile.json()).data).not.toHaveProperty("bankAccountLast4");
});

test("les champs de créneau sont bornés côté serveur", async ({ request }) => {
  const response = await request.post("/api/reservations", {
    data: { coachId: "steven-fordant", service: "Coaching", duration: "1 heure", slots: ["x".repeat(257)] },
  });
  expect(response.status()).toBe(400);
});

test("un sportif peut déplacer une réservation acceptée vers un créneau libre", async ({ request }, testInfo) => {
  const sourceSlot = testInfo.project.name === "mobile-chromium" ? "2026-12-20 10:00" : "2026-12-19 10:00";
  const targetSlot = testInfo.project.name === "mobile-chromium" ? "2026-12-20 11:00" : "2026-12-19 11:00";
  const athlete = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", password: "demo-password", role: "sportif" } });
  const athleteCookie = athlete.headers()["set-cookie"].split(";")[0];
  const created = await request.post("/api/reservations", {
    headers: { Cookie: athleteCookie },
    data: { coachId: "steven-fordant", service: "Coaching basketball", duration: "1 heure", price: 35, slots: [sourceSlot] },
  });
  expect(created.status()).toBe(201);
  const reservation = (await created.json()).data;
  const coach = await request.post("/api/auth/sign-in", { data: { email: "coach@example.com", password: "demo-password", role: "coach" } });
  const coachCookie = coach.headers()["set-cookie"].split(";")[0];
  const accepted = await request.patch(`/api/reservations/${reservation.id}`, { headers: { Cookie: coachCookie }, data: { status: "accepted" } });
  expect(accepted.status()).toBe(200);
  const moved = await request.post(`/api/reservations/${reservation.id}/reschedule`, { headers: { Cookie: athleteCookie }, data: { slots: [targetSlot] } });
  expect(moved.status()).toBe(200);
  expect((await moved.json()).data.slots).toEqual([targetSlot]);
});
