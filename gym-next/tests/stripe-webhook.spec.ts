import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

test("le webhook Stripe signé confirme une réservation", async ({ request }, testInfo) => {
  const slot = `stripe-${testInfo.project.name}-${Date.now()}`;
  const created = await request.post("/api/reservations", {
    data: { coachId: "steven-fordant", service: "Webhook Stripe", duration: "1 heure", price: 35, slots: [slot] },
  });
  expect(created.status()).toBe(201);
  const reservation = (await created.json()).data;
  const coach = await request.post("/api/auth/sign-in", { data: { email: "coach@example.com", password: "demo-password", role: "coach" } });
  const coachCookie = coach.headers()["set-cookie"].split(";")[0];
  const accepted = await request.patch(`/api/reservations/${reservation.id}`, { data: { status: "accepted" }, headers: { Cookie: coachCookie } });
  expect(accepted.status()).toBe(200);

  const payload = JSON.stringify({ type: "checkout.session.completed", data: { object: { metadata: { reservation_id: reservation.id } } } });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", "test-webhook-secret").update(`${timestamp}.${payload}`).digest("hex");
  const webhook = await request.post("/api/webhooks/stripe", {
    data: payload,
    headers: { "Content-Type": "application/json", "stripe-signature": `t=${timestamp},v1=${signature}` },
  });
  expect(webhook.status()).toBe(200);
  const duplicateWebhook = await request.post("/api/webhooks/stripe", {
    data: payload,
    headers: { "Content-Type": "application/json", "stripe-signature": `t=${timestamp},v1=${signature}` },
  });
  expect(duplicateWebhook.status()).toBe(200);
  const payer = await request.post("/api/auth/sign-in", { data: { email: "sportif@example.com", password: "demo-password", role: "sportif" } });
  const payerCookie = payer.headers()["set-cookie"].split(";")[0];
  const updated = await request.get(`/api/reservations/${reservation.id}`, { headers: { Cookie: payerCookie } });
  expect((await updated.json()).data.status).toBe("paid");

  const malformedPayload = "not-json";
  const malformedSignature = createHmac("sha256", "test-webhook-secret").update(`${timestamp}.${malformedPayload}`).digest("hex");
  const malformedWebhook = await request.post("/api/webhooks/stripe", {
    data: malformedPayload,
    headers: { "Content-Type": "application/json", "stripe-signature": `t=${timestamp},v1=${malformedSignature}` },
  });
  expect(malformedWebhook.status()).toBe(400);
});
