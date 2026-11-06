const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('../../gym-next/node_modules/typescript');
const sourcePath = path.join(__dirname, '../../gym-next/lib/telegram-observability.ts');
const js = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
new Function('require', 'module', 'exports', js)(require, loaded, loaded.exports);
const { projectTelegramOutbox } = loaded.exports;

test('projects statuses, attempts and retry boundaries into counts only', () => {
  const rows = [
    { status: 'pending', attempts: 0, created: 90 },
    { status: 'sending', attempts: 2, created: 80, retryAt: 100 },
    { status: 'accepted', attempts: 1, created: 70, retryAt: 101 },
    { status: 'failed', attempts: 3, created: 60, retryAt: 99 },
    { status: 'uncertain', attempts: 4, created: 101 },
  ];
  assert.deepEqual(projectTelegramOutbox(rows, 100), {
    total: 5,
    statuses: { pending: 1, sending: 1, accepted: 1, failed: 1, uncertain: 1 },
    unknownStatus: 0,
    attempts: { total: 10, overflow: false, invalidRows: 0 },
    createdAt: { invalid: 0, future: 1 },
    retryAt: { scheduled: 3, due: 2, future: 1, invalid: 0 },
  });
});

test('handles unknown states, malformed rows and non-finite timestamps without echoing fields', () => {
  const output = projectTelegramOutbox([
    { status: 'surprise', attempts: -1, created: Infinity, retryAt: NaN, email: 'private@example.test', text: 'secret' },
    null,
  ], 10);
  assert.deepEqual(output, {
    total: 2,
    statuses: { pending: 0, sending: 0, accepted: 0, failed: 0, uncertain: 0 },
    unknownStatus: 2,
    attempts: { total: 0, overflow: false, invalidRows: 2 },
    createdAt: { invalid: 2, future: 0 },
    retryAt: { scheduled: 0, due: 0, future: 0, invalid: 1 },
  });
  assert.doesNotMatch(JSON.stringify(output), /private|secret|email|text/i);
});

test('does not mutate entries and ignores unrecognized PII and error fields', () => {
  const row = Object.freeze({ status: 'accepted', attempts: 1, created: 5, owner: 'person', chatId: '42', messageId: 7, error: { message: 'secret' } });
  const before = JSON.stringify(row);
  const output = projectTelegramOutbox([row], 5);
  assert.equal(JSON.stringify(row), before);
  assert.deepEqual(Object.keys(output).sort(), ['attempts', 'createdAt', 'retryAt', 'statuses', 'total', 'unknownStatus'].sort());
  assert.doesNotMatch(JSON.stringify(output), /person|42|secret/);
});

test('rejects a non-finite injected clock with a static message', () => {
  assert.throws(() => projectTelegramOutbox([], NaN), { message: 'now must be a finite timestamp' });
});

test('saturates attempts at the safe integer limit and signals overflow', () => {
  const result = projectTelegramOutbox([
    { status: 'pending', attempts: Number.MAX_SAFE_INTEGER, created: 1 },
    { status: 'pending', attempts: 1, created: 1 },
  ], 1);
  assert.deepEqual(result.attempts, {
    total: Number.MAX_SAFE_INTEGER,
    overflow: true,
    invalidRows: 0,
  });
});
