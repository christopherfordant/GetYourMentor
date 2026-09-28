import fs from "node:fs";
import path from "node:path";

const routePath = path.join(process.cwd(), "app", "api", "knowledge", "search", "route.ts");
const source = fs.readFileSync(routePath, "utf8");

const requiredMarkers = [
  'process.env.RAG_PUBLIC_SEARCH_ENABLED !== "true"',
  'requireRole("admin")',
  "SUPABASE_SERVICE_ROLE_KEY",
  "search_document_chunks",
  "citation:",
  'method: "POST"',
  'cache: "no-store"',
];

const forbiddenMarkers = [
  "/api/reservations",
  "/api/webhooks/stripe",
  "/api/auth",
  "STRIPE_SECRET_KEY",
  "RESEND_API_KEY",
];

const missing = requiredMarkers.filter((marker) => !source.includes(marker));
const forbidden = forbiddenMarkers.filter((marker) => source.includes(marker));

if (missing.length || forbidden.length) {
  console.error("Contrat de sécurité de la route RAG invalide.");
  for (const marker of missing) console.error(`- Élément requis absent : ${marker}`);
  for (const marker of forbidden) console.error(`- Élément interdit présent : ${marker}`);
  process.exit(1);
}

console.log("Route RAG valide : accès optionnel, serveur uniquement, lecture seule et citations présentes.");
