import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), ".env.preproduction.example");
const required = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SESSION_SECRET",
  "CRON_SECRET",
  "PAYMENT_PROVIDER",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "LEGAL_ENTITY_NAME",
  "LEGAL_ENTITY_ADDRESS",
  "LEGAL_CONTACT_EMAIL",
  "LEGAL_REGISTRATION",
  "LEGAL_DIRECTOR_NAME",
  "LEGAL_CONTENT_APPROVED",
];

if (!fs.existsSync(filePath)) {
  console.error(`Modèle de préproduction absent : ${filePath}`);
  process.exit(1);
}

const content = fs.readFileSync(filePath, "utf8");
const values = new Map();
for (const line of content.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) values.set(match[1], match[2].trim());
}

const errors = [];
for (const name of required) {
  if (!values.has(name)) errors.push(`${name} est absent du modèle.`);
}

if (values.get("PAYMENT_PROVIDER") !== "stripe") {
  errors.push("PAYMENT_PROVIDER doit être stripe dans le modèle de préproduction.");
}
for (const name of ["SUPABASE_URL", "NEXT_PUBLIC_APP_URL"]) {
  const value = values.get(name) ?? "";
  if (!value.startsWith("https://")) errors.push(`${name} doit utiliser HTTPS dans le modèle.`);
  if (/localhost|127\.0\.0\.1/i.test(value)) errors.push(`${name} ne doit pas pointer vers localhost.`);
}

for (const [name, prefix] of [
  ["STRIPE_SECRET_KEY", "sk_test_"],
  ["STRIPE_WEBHOOK_SECRET", "whsec_"],
  ["RESEND_API_KEY", "re_"],
]) {
  const value = values.get(name) ?? "";
  if (!value.startsWith(prefix) || !value.includes("REPLACE")) {
    errors.push(`${name} doit rester un placeholder de test, sans clé réelle.`);
  }
}
if (values.get("GETYOURMENTOR_ALLOW_DEMO") || values.get("GETYOURMENTOR_ACCEPTANCE_MODE")) {
  errors.push("Les modes démo/acceptation doivent rester absents ou commentés.");
}
if (values.get("LEGAL_CONTENT_APPROVED") !== "false") {
  errors.push("LEGAL_CONTENT_APPROVED doit rester false dans le modèle tant que le contenu juridique n'est pas validé.");
}

if (errors.length) {
  console.error("Modèle de préproduction invalide :");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Modèle de préproduction valide : variables attendues, HTTPS et aucun secret réel détecté.");
