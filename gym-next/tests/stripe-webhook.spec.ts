import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

test("le webhook Stripe signé confirme une réservation", async ({ request }, testInfo) => {
  const slot = new Date(Date.now() + (150 + (testInfo.project.name.includes("mobile") ? 1 : 0)) * 86400000).toISOString();
  const client=await request.post('/api/auth/sign-in',{data:{email:'sportif@example.com',password:'demo-password',role:'sportif'}});
  expect(client.status()).toBe(200);
  const clientCookie=client.headers()['set-cookie'].split(';')[0];
  const created = await request.post("/api/reservations", {
    headers:{Cookie:clientCookie},
    data: { coachId: "steven-fordant", service: "Webhook Stripe", duration: "1 heure", price: 35, slots: [slot] },
  });
  expect(created.status()).toBe(201);
  const reservation = (await created.json()).data;
  const coach = await request.post("/api/auth/sign-in", { data: { email: "coach@example.com", password: "demo-password", role: "coach" } });
  const coachCookie = coach.headers()["set-cookie"].split(";")[0];
  const accepted = await request.patch(`/api/reservations/${reservation.id}`, { data: { status: "accepted" }, headers: { Cookie: coachCookie } });
  expect(accepted.status()).toBe(200);

  const payload = JSON.stringify({ id: `evt_${reservation.id}`, type: "checkout.session.completed", livemode: false, data: { object: { id: `cs_${reservation.id}`, mode: "payment", status: "complete", payment_status: "paid", amount_total: 3500, currency: "eur", customer_details: { email: "sportif@example.com" }, payment_intent: `pi_${reservation.id}`, metadata: { reservation_id: reservation.id } } } });
  const timestamp = Math.floor(Date.now() / 1000);
  async function signed(body:string,time=timestamp){
    const digest=createHmac('sha256','test-webhook-secret').update(`${time}.${body}`).digest('hex');
    return request.post('/api/webhooks/stripe',{data:body,headers:{'Content-Type':'application/json','stripe-signature':`t=${time},v1=${digest}`}});
  }
  expect((await signed(payload,timestamp-600)).status()).toBe(400);
  const bad=JSON.parse(payload);bad.livemode=true;
  expect((await signed(JSON.stringify(bad))).status()).toBe(400);
  bad.livemode=false;bad.data.object.amount_total=1;
  expect((await signed(JSON.stringify(bad))).status()).toBe(409);
  bad.data.object.amount_total=3500;bad.data.object.currency='usd';
  expect((await signed(JSON.stringify(bad))).status()).toBe(409);
  bad.data.object.currency='eur';bad.data.object.customer_details.email='other@test.invalid';
  expect((await signed(JSON.stringify(bad))).status()).toBe(409);
  bad.data.object.customer_details.email='sportif@example.com';bad.data.object.payment_status='unpaid';
  expect((await (await signed(JSON.stringify(bad))).json()).processed).toBe(false);
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
  const updatedBody = (await updated.json()).data;
  expect(updatedBody.status).toBe("paid");
  expect(updatedBody.stripePaymentIntentId).toBe(`pi_${reservation.id}`);

  const malformedPayload = "not-json";
  const malformedSignature = createHmac("sha256", "test-webhook-secret").update(`${timestamp}.${malformedPayload}`).digest("hex");
  const malformedWebhook = await request.post("/api/webhooks/stripe", {
    data: malformedPayload,
    headers: { "Content-Type": "application/json", "stripe-signature": `t=${timestamp},v1=${malformedSignature}` },
  });
  expect(malformedWebhook.status()).toBe(400);
});
