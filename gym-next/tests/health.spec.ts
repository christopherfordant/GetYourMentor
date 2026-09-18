import { expect, test } from "@playwright/test";

test("l’endpoint de santé signale explicitement le mode de démonstration", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.status).toBe("demo");
  expect(body.mode).toBe("demo");
  expect(body.ready).toBeTruthy();
  expect(body.checks).toEqual({ publicUrl: false, sessionSecret: false, cronSecret: false, supabase: false, stripe: false, resend: false, legal: false });
});
