import fs from "node:fs";
import path from "node:path";

const schemaPath = path.join(process.cwd(), "..", "SUPABASE_APP_SCHEMA_GYM.sql");
if (!fs.existsSync(schemaPath)) {
  console.error(`Schéma Supabase absent : ${schemaPath}`);
  process.exit(1);
}

const source = fs.readFileSync(schemaPath, "utf8");
const activeSql = source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*--.*$/gm, "");

const tables = [
  "gym_coaches",
  "gym_reservations",
  "gym_reservation_slot_claims",
  "gym_reviews",
  "gym_messages",
  "gym_club_leads",
];
const errors = [];

for (const table of tables) {
  if (!new RegExp(`create table if not exists public\\.${table}\\b`, "i").test(activeSql)) {
    errors.push(`Table absente : ${table}`);
  }
  if (!new RegExp(`alter table public\\.${table} enable row level security`, "i").test(activeSql)) {
    errors.push(`RLS absente : ${table}`);
  }
}

if (/insert\s+into\s+public\.gym_coaches\b/i.test(activeSql)) {
  errors.push("Le schéma actif ne doit pas injecter de coach de démonstration.");
}
if (!/values\s*\(\s*'club-documents'\s*,\s*'club-documents'\s*,\s*false\s*\)/i.test(activeSql)) {
  errors.push("Le bucket club-documents doit être privé.");
}
if (!/(?:primary\s+key|unique)\s*\(\s*coach_id\s*,\s*slot\s*\)/i.test(activeSql)) {
  errors.push("La contrainte d’unicité coach/créneau est absente.");
}

if (errors.length) {
  console.error("Schéma Supabase applicatif invalide :");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Schéma Supabase valide : tables, RLS, bucket privé et contraintes MVP présents.");
