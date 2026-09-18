import { expect, test } from "@playwright/test";

test("un compte club retrouve sa demande d'affiliation", async ({ page }) => {
  const email = `club-dashboard-${Date.now()}@example.com`;
  await page.goto("/compte?mode=club");
  const signUp = await page.evaluate(async (body) => {
    const response = await fetch("/api/auth/sign-up", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { status: response.status, payload: await response.json() };
  }, {
    email,
    password: "club-pass-123",
    role: "club",
    firstName: "Camille",
    lastName: "Martin",
    phone: "0600000000",
    termsAccepted: true,
  });
  expect(signUp.status).toBe(201);

  const lead = await page.evaluate(async (formValues) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(formValues)) form.append(key, value);
    const response = await fetch("/api/clubs/leads", { method: "POST", body: form });
    return { status: response.status, payload: await response.json() };
  }, { clubName: "Club Horizon", managerName: "Camille Martin", email, phone: "0600000000" });
  expect(lead.status).toBe(201);

  const currentLead = await page.evaluate(async () => {
    const response = await fetch("/api/clubs/me");
    return { status: response.status, payload: await response.json() };
  });
  expect(currentLead.status).toBe(200);
  expect(currentLead.payload.data).toMatchObject({ clubName: "Club Horizon", status: "pending" });
});
