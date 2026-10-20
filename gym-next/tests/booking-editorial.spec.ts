import { demoCalendarWeeks } from "../lib/domain/booking-time";
import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const selection = "sport=metiers-de-la-forme&city=Marseille&coach=Studio%20Form%20Marseille&service=Coaching%20remise%20en%20forme&duration=30min&price=35&slot=11:00&mentor=Mika";

test("créneaux et récapitulatif restent lisibles aux petites et grandes largeurs", async ({ page }) => {
  await page.route("**/api/reservations?*", route => route.fulfill({ json: { data: [] } }));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["creneau", "recapitulatif"]) {
      await page.goto(`/${route}?${selection}`);
      await expect(page.locator("#gym-booking h1")).toBeVisible();
      const panel = page.locator(route === "creneau" ? ".bk-reservation-selection-panel" : ".bk-recap-auth-card");
      await expect(panel).toBeVisible();
      expect(await panel.evaluate(element => Number(getComputedStyle(element).opacity))).toBe(1);
      expect(await page.locator("#gym-booking h1").evaluate(element => getComputedStyle(element).color)).toBe("rgb(20, 19, 22)");
      expect(await page.locator(".booking-note").evaluate(element => getComputedStyle(element).color)).toBe("rgb(20, 19, 22)");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await expect(page.locator("#gym-booking")).toContainText(/coach/i);
      await expect(page.locator("#gym-booking")).not.toContainText(/284 avis|423 avis|10 Rue du Sport|Bilan express/);
      if (width === 390 || width === 1440) {
        const cookies = page.getByRole("button", { name: "Continuer avec le nécessaire", exact: true });
        if (await cookies.isVisible()) await cookies.click();
        const output = path.join(process.cwd(), "playwright-artifacts/booking-editorial");
        fs.mkdirSync(output, { recursive: true });
        await page.screenshot({ path: path.join(output, `${route}-${width}.png`), fullPage: true, scale: "css" });
      }
    }
  }
});

test("une erreur de disponibilités bloque l’envoi et permet de réessayer", async ({ page }) => {
  const booked = demoCalendarWeeks(Date.now())[0][0].slots[0];
  let attempts = 0;
  let posts = 0;
  await page.route("**/api/reservations?*", route => {
    attempts++;
    return attempts === 1 ? route.fulfill({ status: 503, json: { error: "unavailable" } }) : route.fulfill({ json: { data: [{ status: "paid", slots: [booked], duration: "30min" }] } });
  });
  await page.route("**/api/reservations", route => {
    posts++;
    return route.fulfill({ status: 503, json: { error: "unavailable" } });
  });
  await page.goto(`/creneau?${selection}`);
  const cookies = page.getByRole("button", { name: "Continuer avec le nécessaire", exact: true });
  if (await cookies.isVisible()) await cookies.click();
  await expect(page.locator(".bk-reservation-inline-error [role=alert]")).toContainText("disponibilités");
  const confirm = page.locator("[data-multi-confirm]");
  await expect(confirm).toHaveAttribute("aria-disabled", "true");
  await confirm.focus();
  await page.keyboard.press("Enter");
  expect(posts).toBe(0);
  await page.getByRole("button", { name: "Réessayer les disponibilités" }).click();
  await expect(page.locator(`[data-slot="${booked}"]`).first()).toBeDisabled();
  await page.locator("[data-slot]:not(:disabled)").first().click();
  await expect(confirm).toHaveAttribute("aria-disabled", "false");
  await confirm.click();
  await expect(page.locator(".bk-reservation-error")).toContainText("pas confirmé");
  expect(posts).toBe(1);
});

test("le récapitulatif garde la réservation et le contexte vers le compte et le retour", async ({ page }) => {
  await page.goto(`/recapitulatif?${selection}&reservationId=recette-fictive&claimToken=jeton-fictif`);
  for (const selector of ["[data-recap-login]", "[data-recap-create]", "[data-recap-edit]"]) {
    const url = new URL(await page.locator(selector).getAttribute("href") ?? "", "http://localhost");
    expect(url.searchParams.get("reservationId")).toBe("recette-fictive");
    expect(url.searchParams.get("claimToken")).toBe("jeton-fictif");
    expect(url.searchParams.get("slot")).toBe("11:00");
    expect(url.searchParams.get("mentor")).toBe("Mika");
  }
  await expect(page.locator("[data-recap-login]")).toHaveText("Se connecter pour suivre ma demande");
  await expect(page.locator("[data-recap-datetime]")).toContainText("11:00");
});

test("le clavier choisit un mentor et un horaire avec un focus visible", async ({ page }) => {
  await page.route("**/api/reservations?*", route => route.fulfill({ json: { data: [] } }));
  await page.goto(`/creneau?${selection}`);
  const mentor = page.locator("[data-mentor]").first();
  await mentor.focus();
  await page.keyboard.press("Enter");
  await expect(mentor).toHaveAttribute("aria-pressed", "true");
  const slot = page.locator("[data-slot]:not(:disabled)").first();
  await slot.focus();
  await page.keyboard.press("Space");
  await expect(slot).toHaveAttribute("aria-pressed", "true");
  expect(await slot.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
  await expect(page.locator(".de-header .de-sports a")).toHaveCount(4);
});
