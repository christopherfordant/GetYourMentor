import { expect, test } from "@playwright/test";
import { slotInstant, normalizeSlots, durationMinutes, intervalsOverlap, demoCalendarWeeks } from "../lib/domain/booking-time";
import { refundPercentForAppointment } from "../lib/domain/booking-rules";

test("dates strictes, fuseaux, durée, changement d'heure et limites de remboursement", () => {
  const now = Date.parse("2026-10-16T12:00:00Z");
  for (const value of ["10:00", "2027-02-29T10:00:00Z", "2026-02-30T10:00:00Z", "2027-01-01", "2027-01-01T10:00:00", "2027-01-01T24:00:00Z", "2027-01-01T10:00:00+14:30"]) expect(slotInstant(value)).toBeNull();
  expect(normalizeSlots(["2026-10-17T14:00:00+02:00", "2026-10-17T12:00:00Z"], now)).toEqual(["2026-10-17T12:00:00.000Z"]);
  expect(normalizeSlots(["2026-10-16T11:00:00Z"], now)).toBeNull();
  expect(durationMinutes("1h30")).toBe(90); expect(durationMinutes("30min")).toBe(30);
  expect(durationMinutes("1 heure")).toBe(60); expect(durationMinutes("0min")).toBeNull();
  expect(intervalsOverlap(["2026-10-17T10:00:00Z"], "1 heure", ["2026-10-17T12:30:00+02:00"], "30min")).toBe(true);
  expect(intervalsOverlap(["2026-10-17T10:00:00Z"], "1 heure", ["2026-10-17T11:00:00Z"], "30min")).toBe(false);
  expect(demoCalendarWeeks(Date.parse("2026-10-24T12:00:00Z"))[0][0].slots[0]).toBe("2026-10-25T08:00:00.000Z");
  for (const [hours, percent] of [[48 + 1 / 3600, 100], [48, 50], [24, 50], [24 - 1 / 3600, 0]]) {
    expect(refundPercentForAppointment(new Date(now + hours * 3600000).toISOString(), new Date(now))).toBe(percent);
  }
});

test("capacité collective atomique, concurrence, isolation, refus et annulation libèrent les places", async ({ browser }, info) => {
  const baseURL = "http://127.0.0.1:3001";
  const contexts = await Promise.all(Array.from({ length: 5 }, () => browser.newContext({ baseURL })));
  const cookies = new Map<object, string>();
  const clients = contexts.map(context => new Proxy(context.request, { get(target, property) {
    const method = Reflect.get(target, property);
    if (["get", "post", "patch"].includes(String(property))) return (url: string, options: Record<string, unknown> = {}) => method.call(target, url, { ...options, headers: { Cookie: cookies.get(target) ?? "" } });
    return typeof method === "function" ? method.bind(target) : method;
  } }));
  const [club, coach, a, b, c] = clients;
  const login = async (api: typeof club, role: string, email: string) => {
    const response = await api.post("/api/auth/sign-in", { data: { email, role, password: "demo-password" } });
    expect(response.status()).toBe(200);
    cookies.set(contexts[clients.indexOf(api)].request, response.headers()["set-cookie"].split(";")[0]);
  };
  const slot = new Date(Date.now() + (80 + (info.project.name.includes("mobile") ? 1 : 0)) * 86400000).toISOString();
  try {
    await login(club, "club", "club@example.com"); await login(coach, "coach", "coach@example.com");
    for (const [index, api] of [a, b, c].entries()) await login(api, "sportif", `capacity-${info.project.name}-${index}@example.com`);
    const published = await club.post("/api/structures/offers", { data: { title: "Séance collective démo", duration: "1 heure", slots: [slot], capacity: 2 } });
    expect(published.status()).toBe(201); const offer = (await published.json()).data;
    const body = { structureOfferId: offer.id, slots: [slot], capacity: 999, price: 0 };
    const responses = await Promise.all([a.post("/api/reservations", { data: body }), b.post("/api/reservations", { data: body }), c.post("/api/reservations", { data: body })]);
    expect(responses.map(r => r.status()).sort()).toEqual([201, 201, 409]);
    const winner = responses.findIndex(r => r.status() === 201); const loser = responses.findIndex(r => r.status() === 409);
    const reservation = (await responses[winner].json()).data;
    expect(reservation.financials.commissionBps).toBe(1500);
    expect((await [a, b, c][loser].get(`/api/reservations/${reservation.id}`)).status()).toBe(403);
    expect((await club.patch(`/api/reservations/${reservation.id}`, { data: { status: "accepted" } })).status()).toBe(401);
    expect((await [a, b, c][winner].post(`/api/reservations/${reservation.id}/payment`)).status()).toBe(409);
    expect((await [a, b, c][winner].post("/api/reservations", { data: body })).status()).toBe(409);
    expect((await coach.patch(`/api/reservations/${reservation.id}`, { data: { status: "rejected" } })).status()).toBe(200);
    const replacement = await [a, b, c][loser].post("/api/reservations", { data: body }); expect(replacement.status()).toBe(201);
    const next = (await replacement.json()).data;
    expect((await [a, b, c][loser].post(`/api/reservations/${next.id}/cancel`)).status()).toBe(200);
    expect((await [a, b, c][loser].post(`/api/reservations/${next.id}/cancel`)).status()).toBe(200);
    expect((await [a, b, c][loser].post("/api/reservations", { data: body })).status()).toBe(201);
    const overlapping = new Date(Date.parse(slot) + 30 * 60000).toISOString();
    expect((await a.post("/api/reservations", { data: { coachId: "steven-fordant", service: "Conflit individuel", duration: "30min", slots: [overlapping] } })).status()).toBe(409);
    expect((await coach.post("/api/reservations", { data: { coachId: "steven-fordant", service: "Interdit", duration: "30min", slots: [slot] } })).status()).toBe(403);
    for (const invalid of ["10:00", "2027-02-30T10:00:00Z", "2001-01-01T10:00:00Z"]) expect((await a.post("/api/reservations", { data: { coachId: "steven-fordant", service: "Invalide", duration: "30min", slots: [invalid] } })).status()).toBe(400);
    const publicData = (await (await a.get("/api/reservations?coachId=steven-fordant")).json()).data;
    expect(publicData.every((r: Record<string, unknown>) => !r.ownerEmail && !r.financials && !r.id)).toBe(true);
  } finally { await Promise.all(contexts.map(context => context.close())); }
});

test("calendrier daté accessible et sans débordement aux quatre largeurs", async ({ page }) => {
  await page.goto("/creneau?coach=steven-fordant&duration=1%20heure&sport=basketball&city=Marseille");
  const cookies = page.getByRole("button", { name: "Continuer avec le nécessaire", exact: true });
  if (await cookies.isVisible()) await cookies.click();
  await expect(page.locator(".bk-reservation-calendar-card")).toHaveAttribute("aria-busy", "false");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const slot = page.locator("[data-slot]:not(:disabled)").first();
    const value = await slot.getAttribute("data-slot"); expect(Date.parse(value!)).toBeGreaterThan(Date.now());
    await slot.focus(); await page.keyboard.press("Enter"); await expect(slot).toHaveAttribute("aria-pressed", "true");
    if (width === 390 || width === 1440) await page.screenshot({ path: `../docs/assets/booking-consolidation/creneau-${width}-${test.info().project.name}.png`, fullPage: true });
  }
});

test("choix du coach parmi les propositions, déplacement et remboursements simulés 100/50/0", async ({ request }, info) => {
  const auth = async (role: string, email = `${role}@example.com`) => {
    const response = await request.post("/api/auth/sign-in", { data: { email, role, password: "demo-password" } });
    expect(response.status()).toBe(200); return { Cookie: response.headers()["set-cookie"].split(";")[0] };
  };
  const athlete = await auth("sportif"); const coach = await auth("coach");
  const base = Date.now() + (110 + (info.project.name.includes("mobile") ? 1 : 0)) * 86400000;
  const anonymous = await request.post("/api/reservations", { headers: { Cookie: "" }, data: { coachId: "steven-fordant", service: "Demande avant connexion", duration: "30min", slots: [new Date(base + 86400000).toISOString()] } });
  expect(anonymous.status()).toBe(201); const unclaimed = (await anonymous.json()).data;
  expect((await request.post(`/api/reservations/${unclaimed.id}/cancel`, { headers: athlete })).status()).toBe(403);
  expect((await request.post(`/api/reservations/${unclaimed.id}/cancel`, { headers: { ...athlete, "x-reservation-claim-token": unclaimed.claimToken } })).status()).toBe(200);
  const proposed = [base, base + 2 * 3600000].map(time => new Date(time).toISOString());
  const create = async (slots: string[]) => {
    const response = await request.post("/api/reservations", { headers: athlete, data: { coachId: "steven-fordant", service: "Recette datée", duration: "1 heure", slots } });
    expect(response.status()).toBe(201); return (await response.json()).data;
  };
  const reservation = await create(proposed);
  expect((await request.patch(`/api/reservations/${reservation.id}`, { headers: coach, data: { status: "accepted", appointmentAt: new Date(base + 86400000).toISOString() } })).status()).toBe(409);
  const accepted = await request.patch(`/api/reservations/${reservation.id}`, { headers: coach, data: { status: "accepted", appointmentAt: proposed[1] } });
  expect((await accepted.json()).data).toMatchObject({ slots: [proposed[1]], appointmentAt: proposed[1] });
  const freed = await create([proposed[0]]); // Alternative unused by coach is released.
  const movedSlot = new Date(base + 4 * 3600000).toISOString();
  const moved = await request.post(`/api/reservations/${reservation.id}/reschedule`, { headers: athlete, data: { slots: [movedSlot] } });
  expect(moved.status()).toBe(200); expect((await moved.json()).data.appointmentAt).toBe(movedSlot);
  expect((await request.post(`/api/reservations/${reservation.id}/reschedule`, { headers: athlete, data: { slots: ["10:00"] } })).status()).toBe(409);
  await request.post(`/api/reservations/${reservation.id}/cancel`, { headers: athlete });
  await request.post(`/api/reservations/${freed.id}/cancel`, { headers: athlete });
  for (const [hours, percentage] of [[49, 100], [36, 50], [23, 0]]) {
    // Each cancelled fixture releases its interval before the next project.
    const response = await request.post("/api/reservations", { headers: athlete, data: { coachId: "steven-fordant", service: "Remboursement démo", duration: "30min", slots: [new Date(Date.now() + hours * 3600000).toISOString()] } });
    expect(response.status()).toBe(201); const booking = (await response.json()).data;
    expect((await request.patch(`/api/reservations/${booking.id}`, { headers: coach, data: { status: "accepted" } })).status()).toBe(200);
    expect((await request.post(`/api/reservations/${booking.id}/payment`, { headers: athlete })).status()).toBe(200);
    const cancellation = await request.post(`/api/reservations/${booking.id}/cancel`, { headers: athlete });
    const result = (await cancellation.json()).data;
    expect(result.refundPercent).toBe(percentage); expect(result.refundAmount).toBe(Math.round(booking.price * percentage) / 100);
    const repeated = (await (await request.post(`/api/reservations/${booking.id}/cancel`, { headers: athlete })).json()).data;
    expect(repeated.cancelledAt).toBe(result.cancelledAt); expect(repeated.refundAmount).toBe(result.refundAmount);
  }
});
