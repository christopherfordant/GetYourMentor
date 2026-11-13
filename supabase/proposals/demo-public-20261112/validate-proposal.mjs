import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const schema = await readFile(path.join(dir, "001_demo_schema.sql"), "utf8");
const tests = await readFile(path.join(dir, "002_demo_rls_tests.sql"), "utf8");
const rollback = await readFile(path.join(dir, "003_rollback_empty_demo_schema.sql"), "utf8");
const schedule = await readFile(path.join(dir, "004_demo_schedule_idempotency.sql"), "utf8");
const scheduleTests = await readFile(path.join(dir, "005_demo_schedule_idempotency_tests.sql"), "utf8");
const scheduleRollback = await readFile(path.join(dir, "006_rollback_schedule_idempotency.sql"), "utf8");
const localSmoke = await readFile(path.join(dir, "007_postgres12_contract_smoke.sql"), "utf8");
const localBootstrap = await readFile(path.join(dir, "008_postgres12_auth_shim_bootstrap.sql"), "utf8");

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
assert.match(schedule, /create table public\.gym_demo_slots/i, "coach availability slots are modelled");
for (const column of ["slot_id", "idempotency_key", "request_fingerprint"]) {
  assert.match(schedule, new RegExp(`add column ${column}\\b`, "i"), `${column} is added without replacing existing rows`);
  assert.match(scheduleTests, new RegExp(`has_column\\('public', 'gym_demo_reservations', '${column}'`), `${column} has pgTAP coverage`);
}
assert.match(schedule, /pg_advisory_xact_lock[\s\S]*hashtextextended/i, "repeated concurrent keys are serialized");
assert.match(schedule, /for update/i, "slot and reservation transitions use row locks");
assert.match(schedule, /set state = 'booked'/i, "booking holds the slot in the same transaction");
assert.match(schedule, /set state = 'available'/i, "cancellation releases the slot in the same transaction");
assert.match(schedule, /security definer[\s\S]*set search_path = pg_catalog/i, "server functions use a constrained search path");
assert.match(schedule, /revoke all on function[\s\S]*from public, anon, authenticated/i, "mutation functions are not callable by browser roles");
assert.match(schedule, /grant execute on function[\s\S]*to service_role/i, "only server role can call mutations");
assert.match(scheduleTests, /select plan\(25\)/i, "schedule test plan declares 25 assertions");
for (const scenario of ["anon sees only the shared fixture slot", "same-key replay creates no duplicate reservation", "second athlete cannot double-book a held slot", "cancellation releases the slot atomically", "repeating the same final transition is idempotent"]) {
  assert.ok(scheduleTests.includes(scenario), `schedule pgTAP scenario: ${scenario}`);
}
assert.match(scheduleRollback, /lock table[\s\S]*in access exclusive mode/i, "additive rollback locks affected tables");
assert.match(scheduleRollback, /Rollback refused:[^']*schedule slots or idempotency reservation data exist/i, "additive rollback refuses non-empty new data");
assert.doesNotMatch(scheduleRollback, /cascade/i, "additive rollback does not cascade");
assert.match(localBootstrap, /TEST HARNESS ONLY[\s\S]*Never run this file on Supabase/i, "plain PostgreSQL auth shim is clearly non-Supabase");
assert.match(localSmoke, /begin;[\s\S]*rollback;/i, "local behavioral smoke is transaction-scoped");
for (const scenario of ["anon fixture visibility failed", "same-key replay returned a different id", "double booking unexpectedly accepted", "cancellation did not release slot", "final state unexpectedly reversed"]) {
  assert.ok(localSmoke.includes(scenario), `local PostgreSQL smoke scenario: ${scenario}`);
}
console.log("Static proposal checks: PASS (base schema, RLS, fixtures, additive slots, idempotency, atomic transitions, guarded rollback)");
