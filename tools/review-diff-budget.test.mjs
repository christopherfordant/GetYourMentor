import test from "node:test";
import assert from "node:assert/strict";
import { evaluateBudget, parseNumstat } from "./review-diff-budget.mjs";

test("counts additions and deletions in code files", () => {
  const files = parseNumstat("12\t8\tgym-next/app/page.tsx\n3\t1\ttools/check.mjs");
  assert.equal(evaluateBudget(files).total, 24);
});

test("uses the destination name for a renamed code file", () => {
  const files = parseNumstat("5\t2\tsrc/{old => new}/review.ts");
  assert.deepEqual(files.map(({ path }) => path), ["src/new/review.ts"]);
  assert.equal(evaluateBudget(files).total, 7);
});

test("excludes prose, lockfiles, snapshots and generated exports", () => {
  const files = parseNumstat([
    "100\t50\tdocs/review.md",
    "80\t20\tpackage-lock.json",
    "200\t10\tgym-next/test-results/snapshot.tsx",
    "9\t1\tproject_readable/INDEX.json",
    "4\t3\ttools/reader.ts",
  ].join("\n"));
  assert.deepEqual(files.map(({ path }) => path), ["tools/reader.ts"]);
});

test("fails the budget only when changed code lines exceed the limit", () => {
  assert.equal(evaluateBudget([{ changed: 400 }], 400).passed, true);
  assert.equal(evaluateBudget([{ changed: 401 }], 400).passed, false);
});

test("does not count binary numstat rows", () => {
  assert.deepEqual(parseNumstat("-\t-\tassets/portrait.tsx"), []);
});
