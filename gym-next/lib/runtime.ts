function isAcceptanceTestMode() {
  return process.env.GETYOURMENTOR_ACCEPTANCE_MODE === "true"
    && process.env.CI === "true"
    && /^http:\/\/127\.0\.0\.1:\d+$/.test(process.env.NEXT_PUBLIC_APP_URL ?? "");
}

export function isDemoFallbackAllowed() {
  return isAcceptanceTestMode()
    || (process.env.NODE_ENV !== "production" && process.env.GETYOURMENTOR_ALLOW_DEMO === "true");
}

export function assertDemoFallbackAllowed(resource: string) {
  if (!isDemoFallbackAllowed()) {
    throw new Error(`${resource} n'est pas configuré pour cet environnement de production`);
  }
}

function isValidProductionUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function getRuntimeReadiness() {
  const checks = {
    publicUrl: isValidProductionUrl(process.env.NEXT_PUBLIC_APP_URL),
    sessionSecret: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32),
    cronSecret: Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 32),
    supabase: Boolean(
      (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    stripe: process.env.PAYMENT_PROVIDER === "stripe" && Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
  };
  const demo = isDemoFallbackAllowed();
  const servicesReady = Object.values(checks).every(Boolean);
  return {
    mode: demo ? "demo" : "production",
    ready: demo || servicesReady,
    checks,
  } as const;
}
