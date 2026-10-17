import { expect, test } from "@playwright/test";
import { matchesSession, parseSessionFilters } from "../lib/domain/session-discovery";

test("découverte : capacité disponible, tarif total, dates et normalisation", () => {
  const now = Date.now(), slot = new Date(now + 86400000).toISOString();
  const offer = { sport: "basketball", city: "Évry", source: "coach", capacity: 4, slots: [slot], availability: [{ slot, remaining: 2 }], individualPrice: 50, groupPrices: [{ participantCount: 2, totalCents: 7300 }] };
  const filters = parseSessionFilters(new URLSearchParams("sport=basketball&city=evry&source=coach&participants=2"));
  expect(matchesSession(offer, filters, now)).toBe(true);
  for (const sport of ["football", "basketball", "fitness", "sports-de-combat"]) {
    const normalized = parseSessionFilters(new URLSearchParams(`sport=${sport}&participants=2`));
    expect(matchesSession({ ...offer, sport }, normalized, now)).toBe(true);
  }
  for (const patch of [{ participants: 3 }, { sport: "football" }, { city: "Lyon" }, { source: "structure" }]) expect(matchesSession(offer, { ...filters, ...patch }, now)).toBe(false);
  expect(matchesSession({ ...offer, groupPrices: [] }, filters, now)).toBe(false);
  expect(matchesSession({ ...offer, availability: [{ slot, remaining: 1 }] }, filters, now)).toBe(false);
  expect(matchesSession(offer, filters, now + 86400001)).toBe(false);
  expect(matchesSession({ ...offer, sport: "tennis" }, { ...filters, sport: "" }, now)).toBe(false);
  expect(parseSessionFilters(new URLSearchParams("sport=tennis&source=evil&participants=2.5"))).toMatchObject({ sport: "", source: "", participants: 1 });
});

test("catalogue partagé : filtres URL, demande de groupe et confidentialité", async ({ page, request }, info) => {
  const signIn = async (role: string) => {
    const response = await request.post("/api/auth/sign-in", { data: { email: `${role}@example.com`, role, password: "demo-password" } });
    expect(response.status()).toBe(200);
    return { Cookie: response.headers()["set-cookie"].split(";")[0] };
  };
  const coach = await signIn("coach"), athlete = await signIn("sportif");
  const profile = (await (await request.get("/api/coaches/steven-fordant")).json()).data;
  const previous = profile.groupPrices ?? [];
  let reservationId = "";
  try {
    expect((await request.patch("/api/coaches/group-prices", { headers: coach, data: { prices: [{ participantCount: 2, totalCents: 7300 }] } })).status()).toBe(200);
    const slot = new Date(Date.now() + (info.project.name.includes("mobile") ? 451 : 450) * 86400000).toISOString();
    const publication = await request.post("/api/coaches/sessions", { headers: coach, data: { title: `Découverte fictive ${info.project.name}`, location: "Terrain fictif", duration: "60 minutes", slots: [slot], capacity: 4 } });
    expect(publication.status()).toBe(201); const offer = (await publication.json()).data;
    const publicResponse = await request.get("/api/sessions"); expect(publicResponse.status()).toBe(200); expect(publicResponse.headers()["cache-control"]).toBe("no-store");
    const rows = (await publicResponse.json()).data;
    expect(rows.find((row: { id: string }) => row.id === offer.id)).toMatchObject({ sport: "basketball", source: "coach", city: profile.city });
    expect(JSON.stringify(rows)).not.toContain("ownerEmail"); expect(JSON.stringify(rows)).not.toContain("@example.com");
    const [name, ...value] = athlete.Cookie.split("="); await page.context().addCookies([{ name, value: value.join("="), url: "http://127.0.0.1:3001" }]);
    await page.goto(`/seances?sport=basketball&city=${encodeURIComponent(profile.city)}&source=coach&participants=2`);
    const cookies = page.getByRole("button", { name: "Refuser le non nécessaire", exact: true }); if (await cookies.isVisible()) await cookies.click();
    const form = page.getByRole("form", { name: "Filtrer les séances" });
    await expect(form.getByRole("combobox", { name: "Discipline", exact: true })).toHaveValue("basketball");
    const card = page.locator(`[data-structure-offer="${offer.id}"]`);
    await expect(card.getByLabel("Nombre de participants, vous compris")).toHaveValue("2");
    await expect(card.locator("[data-group-total]")).toContainText("73.00 EUR");
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      if (info.project.name === "desktop-chromium" && [390, 1440].includes(width)) await page.screenshot({ path: `../docs/assets/collective-discovery-2026-10-17/after-${width}.png`, fullPage: true });
    }
    const person = card.getByRole("group", { name: "Participant 2", exact: true });
    await person.getByLabel("Prénom", { exact: true }).fill("Fictif"); await person.getByLabel("Nom", { exact: true }).fill("Participant");
    await person.getByLabel("Âge", { exact: true }).fill("25"); await person.getByLabel("Email", { exact: true }).fill("fictif-discovery@example.com");
    await page.route("**/api/reservations", async route => {
      if (route.request().method() !== "POST") return route.continue();
      const response = await route.fetch();
      if (response.status() === 201) reservationId = (await response.json()).data.id;
      await route.fulfill({ response });
    });
    const created = page.waitForResponse(r => r.url().endsWith("/api/reservations") && r.request().method() === "POST");
    await card.getByRole("button", { name: "Demander pour mon groupe" }).click();
    const booking = await created; expect(booking.status()).toBe(201); expect(reservationId).not.toBe("");
    await expect(page).toHaveURL(/\/compte\?mode=sportif/);
    await page.goto("/seances?source=coach&participants=3");
    await expect(page.locator(`[data-structure-offer="${offer.id}"]`)).toHaveCount(0);
    await page.getByRole("link", { name: "Réinitialiser les filtres" }).click();
    await expect(page).toHaveURL(/\/seances$/);
    await expect(page.locator(`[data-structure-offer="${offer.id}"]`)).toBeVisible();
  } finally {
    if (reservationId) expect((await request.patch(`/api/reservations/${reservationId}`, { headers: coach, data: { status: "rejected" } })).status()).toBe(200);
    expect((await request.patch("/api/coaches/group-prices", { headers: coach, data: { prices: previous } })).status()).toBe(200);
  }
});

test("erreur de catalogue : reprise explicite sans masquer la panne", async ({ page }) => {
  let failed = true;
  await page.route("**/api/sessions", route => route.fulfill({ status: failed ? 503 : 200, contentType: "application/json", body: JSON.stringify(failed ? { error: "Indisponible" } : { data: [] }) }));
  await page.goto("/seances"); await expect(page.locator("[data-public-structure-offers]").getByRole("alert")).toContainText("Séances indisponibles");
  failed = false; await page.getByRole("button", { name: "Réessayer", exact: true }).click();
  await expect(page.locator("[data-public-structure-offers]").getByRole("status")).toContainText("Aucune séance disponible");
});
