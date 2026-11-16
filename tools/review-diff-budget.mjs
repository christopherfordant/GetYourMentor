#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const DEFAULT_MAX_LINES = 400;

const CODE_EXTENSIONS = new Set([
  ".cjs", ".css", ".html", ".js", ".jsx", ".json", ".mjs", ".py",
  ".ps1", ".scss", ".sql", ".ts", ".tsx", ".yaml", ".yml",
]);

const EXCLUDED_PARTS = new Set([
  ".next", "__snapshots__", "build", "coverage", "dist", "node_modules",
  "playwright-report", "project_readable", "test-results",
]);

const EXCLUDED_FILES = new Set([
  "visualiser-documents.html",
  "visualiser-documents-design-mvp.html",
]);

function destinationPath(rawPath) {
  const rename = rawPath.match(/^(.*)\{(.*) => (.*)\}(.*)$/);
  if (!rename) return rawPath;
  return `${rename[1]}${rename[3]}${rename[4]}`;
}

function isCountedCodeFile(rawPath) {
  const normalized = destinationPath(rawPath).replaceAll("\\", "/");
  const parts = normalized.split("/");
  const basename = parts.at(-1) ?? "";
  if (EXCLUDED_FILES.has(basename)) return false;
  if (parts.some((part) => EXCLUDED_PARTS.has(part))) return false;
  if (/^(npm-shrinkwrap\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/i.test(basename)) return false;
  return CODE_EXTENSIONS.has(path.posix.extname(basename).toLowerCase());
}

export function parseNumstat(output) {
  const files = [];
  for (const line of output.split(/\r?\n/)) {
    if (!line) continue;
    const [addedText, deletedText, rawPath] = line.split("\t", 3);
    if (rawPath === undefined || addedText === "-" || deletedText === "-") continue;
    if (!isCountedCodeFile(rawPath)) continue;
    const added = Number(addedText);
    const deleted = Number(deletedText);
    if (!Number.isFinite(added) || !Number.isFinite(deleted)) continue;
    files.push({
      path: destinationPath(rawPath),
      added,
      deleted,
      changed: added + deleted,
    });
  }
  return files;
}

export function evaluateBudget(files, maximum = DEFAULT_MAX_LINES) {
  const total = files.reduce((sum, file) => sum + file.changed, 0);
  return { total, maximum, passed: total <= maximum };
}

function usage() {
  return "Usage: node tools/review-diff-budget.mjs <base-sha> <head-sha> [--max-lines 400]";
}

function main(args) {
  const [base, head, ...options] = args;
  if (!base || !head) {
    process.stderr.write(`${usage()}\n`);
    return 2;
  }

  let maximum = DEFAULT_MAX_LINES;
  for (let index = 0; index < options.length; index += 1) {
    if (options[index] !== "--max-lines" || !options[index + 1]) {
      process.stderr.write(`${usage()}\n`);
      return 2;
    }
    maximum = Number(options[index + 1]);
    index += 1;
  }
  if (!Number.isInteger(maximum) || maximum < 1) {
    process.stderr.write("--max-lines must be a positive integer.\n");
    return 2;
  }

  let numstat;
  try {
    numstat = execFileSync("git", [
      "diff", "--no-ext-diff", "--find-renames", "--numstat", `${base}...${head}`,
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    process.stderr.write(`Unable to compare ${base}...${head}: ${error.stderr?.toString().trim() || error.message}\n`);
    return 2;
  }

  const files = parseNumstat(numstat).sort((left, right) => right.changed - left.changed);
  const result = evaluateBudget(files, maximum);
  process.stdout.write(`Diff review guard: ${result.total}/${result.maximum} changed code lines (additions + deletions).\n`);
  for (const file of files.slice(0, 10)) {
    process.stdout.write(`  ${file.changed} (${file.added}+ / ${file.deleted}-)  ${file.path}\n`);
  }
  if (files.length > 10) process.stdout.write(`  … ${files.length - 10} other code files\n`);
  if (!result.passed) {
    process.stderr.write("Budget exceeded. Split the work into smaller, independently reviewable pull requests.\n");
    return 1;
  }
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  process.exitCode = main(process.argv.slice(2));
}
