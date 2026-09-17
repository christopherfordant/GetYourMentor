const required = [
  ["SUPABASE_URL", "URL du projet Supabase"],
  ["SUPABASE_ANON_KEY", "clé publique Supabase côté serveur"],
  ["SUPABASE_SERVICE_ROLE_KEY", "clé Supabase serveur uniquement"],
  ["SESSION_SECRET", "secret de chiffrement des sessions"],
  ["NEXT_PUBLIC_APP_URL", "URL publique de l’application"],
  ["STRIPE_SECRET_KEY", "clé secrète Stripe"],
  ["STRIPE_WEBHOOK_SECRET", "secret du webhook Stripe"],
  ["RESEND_API_KEY", "clé API Resend"],
  ["RESEND_FROM_EMAIL", "adresse d’expédition Resend"],
];

const errors = [];

for (const [name, label] of required) {
  if (!process.env[name]?.trim()) errors.push(`${name} est requis (${label}).`);
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
if (appUrl) {
  try {
    const parsed = new URL(appUrl);
    if (parsed.protocol !== "https:") errors.push("NEXT_PUBLIC_APP_URL doit utiliser HTTPS en production.");
    if (["localhost", "127.0.0.1"].includes(parsed.hostname)) {
      errors.push("NEXT_PUBLIC_APP_URL ne doit pas pointer vers localhost en production.");
    }
  } catch {
    errors.push("NEXT_PUBLIC_APP_URL doit être une URL valide.");
  }
}

if (process.env.PAYMENT_PROVIDER !== "stripe") {
  errors.push('PAYMENT_PROVIDER doit être exactement "stripe" en production.');
}

if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
  errors.push("SESSION_SECRET doit contenir au moins 32 caractères.");
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("NEXT_PUBLIC_")) {
  errors.push("SUPABASE_SERVICE_ROLE_KEY ne doit jamais être une variable publique.");
}

if (errors.length) {
  console.error("Configuration de production incomplète :");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Configuration de production complète : secrets présents et paramètres cohérents.");
