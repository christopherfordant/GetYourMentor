import { expect, test } from "@playwright/test";

test("le coach peut traiter une demande depuis son tableau de bord", async ({ page, request }, testInfo) => {
  const slot = testInfo.project.name === "mobile-chromium" ? "2026-12-11 18:00" : "2026-12-10 18:00";
  const created = await request.post("/api/reservations", {
    data: {
      coachId: "steven-fordant",
      service: "Coaching basketball",
      duration: "1 heure",
      price: 35,
      slots: [slot],
    },
  });
  expect(created.status()).toBe(201);
  const reservation = (await created.json()).data;

  const unauthenticatedTransition = await request.patch(`/api/reservations/${reservation.id}`, { data: { status: "accepted" } });
  expect(unauthenticatedTransition.status()).toBe(401);

  await page.goto("/compte?mode=coach&coach=Steven%20Fordant", { waitUntil: "networkidle" });
  await page.locator("#account-email").fill("coach@example.com");
  await page.locator("#account-password").fill("demo-password");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.locator("[data-coach-summary]")).toBeVisible();
  await expect(page.locator("[data-coach-request-count]")).toHaveText(/^[1-9]\d*$/);
  const profileEditor = page.locator("[data-coach-profile-editor]");
  await expect(profileEditor).toBeVisible();
  await profileEditor.locator("input").first().fill("Coach basketball individuel avancé");
  await profileEditor.getByLabel("Disciplines").fill("Basketball, préparation physique");
  await profileEditor.getByLabel("Diplômes / certifications").fill("BPJEPS");
  await profileEditor.getByLabel("Types de séances").fill("Individuel, duo, visio");
  await profileEditor.getByLabel("IBAN (prototype, seuls les 4 derniers chiffres sont conservés)").fill("FR7612345678901234567890123");
  await profileEditor.getByLabel("Disponibilités basiques").fill("Mardi et jeudi, 18h–21h");
  await profileEditor.getByRole("button", { name: "Enregistrer le profil", exact: true }).click();
  await expect(profileEditor.locator("[data-coach-profile-status]")).toHaveText("Profil mis à jour.");
  const savedProfile = await request.get("/api/coaches/steven-fordant");
  expect((await savedProfile.json()).data.availability).toBe("Mardi et jeudi, 18h–21h");
  expect((await savedProfile.json()).data).toMatchObject({ disciplines: "Basketball, préparation physique", diplomas: "BPJEPS", sessionTypes: "Individuel, duo, visio", bankAccountLast4: "0123" });
  const requestCard = page.locator(`[data-coach-request="${reservation.id}"]`);
  await expect(requestCard).toBeVisible();
  await requestCard.getByRole("button", { name: "Accepter" }).click();
  await expect(requestCard.locator("[data-request-status]")).toHaveText("Statut : accepted");
  await expect(requestCard.getByText(/^Code : GYM-/)).toBeVisible();
});
