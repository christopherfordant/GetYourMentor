import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const schema = await readFile(path.join(dir, "001_demo_schema.sql"), "utf8");
const tests = await readFile(path.join(dir, "002_demo_rls_tests.sql"), "utf8");
const rollback = await readFile(path.join(dir, "003_rollback_empty_demo_schema.sql"), "utf8");

for (const table of ["gym_demo_sessions", "gym_demo_coaches", "gym_demo_reservations", "gym_demo_telegram_links"]) {
  assert.match(schema, new RegExp(`create table if not exists public\\.${table}\\b`, "i"), `${table} table`);
  assert.match(schema, new RegExp(`alter table public\\.${table} enable row level security`, "i"), `${table} RLS enabled`);
  assert.match(tests, new RegExp(`has_table\\('public', '${table}'`), `${table} pgTAP coverage`);
}
assert.match(schema, /check \(approval_mode = 'simulated'\)/);
assert.match(schema, /check \(payment_mode = 'simulated'\)/);
assert.match(schema, /chat_id_ciphertext bytea not null/);
assert.match(schema, /references auth\.users\(id\) on delete cascade/);
assert.match(schema, /create policy gym_demo_reservations_read_participants/);
assert.match(schema, /grant select on public\.gym_demo_coaches to anon/i);
assert.match(schema, /grant select on public\.gym_demo_sessions to anon/i);
assert.doesNotMatch(schema, /create policy [^;]*gym_demo_sessions[^;]*\bto anon\b/i);
assert.doesNotMatch(schema, /grant\s+[^;]*(?:service_role|authenticated)[^;]*\bto\s+anon\b/i);
for (const role of ["anon", "authenticated", "service_role"]) assert.match(tests, new RegExp(`(?:role ${role}|has_table_privilege\\('${role}')`, "i"), `${role} role coverage`);
for (const scenario of ["athlete sees only their session", "athlete cannot see another athlete reservation", "athlete cannot delete a shared fixture", "coach sees reservations linked to their own profile", "deleting athlete session removes its reservation", "server can record Telegram consent revocation", "non-simulated payment is rejected"]) {
  assert.ok(tests.includes(scenario), `RLS scenario: ${scenario}`);
}
assert.match(rollback, /rqxoovriacgoriimpbwi/, "rollback target project guard documentation");
assert.match(rollback, /lock table[\s\S]*in access exclusive mode/i, "rollback prevents concurrent writes during its emptiness check");
assert.match(rollback, /raise exception 'Rollback refused:[^']*contain data'/i, "rollback refuses to destroy non-empty demo data");
for (const table of ["gym_demo_telegram_links", "gym_demo_reservations", "gym_demo_coaches", "gym_demo_sessions"]) {
  assert.match(rollback, new RegExp(`drop table public\\.${table}\\s*;`, "i"), `rollback drops ${table}`);
  assert.match(rollback, new RegExp(`exists \\(select 1 from public\\.${table} limit 1\\)`, "i"), `rollback checks ${table} is empty`);
}
assert.doesNotMatch(rollback, /cascade/i, "rollback must not cascade beyond the demo schema");
console.log("Static proposal checks: PASS (schema, grants, RLS, role/isolation scenarios, simulated-only fields, guarded rollback)");
