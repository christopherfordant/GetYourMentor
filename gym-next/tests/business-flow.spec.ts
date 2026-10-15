import { expect, test } from "@playwright/test";

test.describe("parcours metier principaux", () => {
  test("home vers recherche puis annuaire coachs", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    await page.getByRole("link", { name: "Trouver mon coach", exact: true }).click();
    await page.waitForURL("**/recherche?sport=football");
    await expect(page).toHaveURL(/\/recherche\?sport=football$/);
    await expect(page.locator("body")).toContainText("Trouver un coach de football qui te correspond");

    await page.getByText("Coachs de Football - Paris").click();

    await page.waitForURL("**/coachs?sport=football&city=Paris");
    await expect(page).toHaveURL(/\/coachs\?sport=football&city=Paris$/);
    await expect(page.locator("body")).toContainText("Paris");
  });

  test("recherche vers liste coachs", async ({ page }) => {
    await page.goto("/recherche?sport=football", { waitUntil: "networkidle" });

    await page.getByText("Coachs de Football - Paris").click();

    await page.waitForURL("**/coachs?sport=football&city=Paris");
    await expect(page).toHaveURL(/\/coachs\?sport=football&city=Paris$/);
  });

  test("annuaire vers fiche coach", async ({ page }) => {
    await page.goto("/coachs?sport=football&city=Paris", { waitUntil: "networkidle" });

    const firstBookingLink = page.locator("a.coach-book-button").first();
    await expect(firstBookingLink).toBeVisible();
    await firstBookingLink.click();

    await page.waitForURL("**/coach?**");
    await expect(page).toHaveURL(/\/coach\?/);
  });

  test("fiche coach vers creneau puis recapitulatif", async ({ page }) => {
    await page.goto("/compte?mode=sportif");
    await page.locator("#account-email").fill("sportif@example.com");
    await page.locator("#account-password").fill("demo-password");
    await page.getByRole("button", { name: "Se connecter", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Mes réservations", exact: true })).toBeVisible();
    await page.goto(
      "/coach?sport=metiers-de-la-forme&city=Lyon&coach=Studio%20Form%20Marseille",
      { waitUntil: "networkidle" },
    );

    await expect(page.locator("[data-booking-bio]")).toContainText("Séances personnalisées");
    await expect(page.locator("[data-booking-disciplines]")).toContainText("Fitness");
    await expect(page.locator("[data-booking-public-diplomas]")).toContainText("Certification fitness");
    const cookieConsent = page.getByRole("button", { name: "Continuer avec le nécessaire", exact: true });
    if (await cookieConsent.isVisible().catch(() => false)) await cookieConsent.click();
    await page.getByRole("button", { name: "Planning" }).click();
    await expect(page.locator('[data-booking-confirm]')).toBeVisible();
    const availabilityResponse = page.waitForResponse((response) => response.url().includes("/api/reservations?coachId=") && response.request().method() === "GET");
    await page.locator('[data-booking-confirm]').click();

    await page.waitForURL("**/creneau?**");
    await expect(page).toHaveURL(/\/creneau\?/);
    await expect(page.locator('[data-multi-confirm]')).toBeVisible();
    const availability = await (await availabilityResponse).json();
    const occupied = availability.data.filter((r: { status: string }) => ["requested", "accepted", "paid"].includes(r.status)).flatMap((r: { slots: string[] }) => r.slots);
    const selectedSlot = (await page.locator("[data-slot]").evaluateAll((buttons) => buttons.map((button) => button.getAttribute("data-slot")))).find((slot) => slot && !occupied.includes(slot));
    expect(selectedSlot, "La recette choisit un créneau réellement libre du store persistant").toBeTruthy();
    await page.locator(`[data-slot="${selectedSlot}"]`).first().click();
    await expect(page.locator('[data-multi-confirm]')).toHaveAttribute("aria-disabled", "false");
    const reservationResponse = page.waitForResponse(
      (response) => response.url().includes("/api/reservations") && response.request().method() === "POST",
    );
    await page.locator('[data-multi-confirm]').click();
    await expect((await reservationResponse).status()).toBe(201);

    await page.waitForURL("**/recapitulatif?**");
    await expect(page).toHaveURL(/\/recapitulatif\?/);
    const reservationId = new URL(page.url()).searchParams.get("reservationId");
    expect(reservationId).toBeTruthy();
    expect(await page.evaluate(async (id) => (await fetch(`/api/reservations/${id}/cancel`, { method: "POST" })).status, reservationId)).toBe(200);
  });

  test("recapitulatif vers compte pour paiement", async ({ page }) => {
    await page.goto(
      "/recapitulatif?sport=metiers-de-la-forme&city=Marseille&coach=Studio%20Form%20Marseille&service=Coaching%20remise%20en%20forme&duration=30min&price=35&slot=10:00&mentor=Coach%20confirme",
      { waitUntil: "networkidle" },
    );

    await page.locator('[data-recap-login]').click();

    await page.waitForURL("**/compte?**");
    await expect(page).toHaveURL(/\/compte\?/);
  });
});
