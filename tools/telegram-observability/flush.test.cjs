const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../../gym-next/node_modules/typescript');

// Execute the real dispatcher, never its storage/runtime imports or host env/fetch.
const sourcePath = path.join(__dirname, '../../gym-next/lib/telegram.ts');
const js = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const NOW = 1800000000000;
const ENV = Object.freeze({
  TELEGRAM_BOT_TOKEN: 'synthetic-token',
  TELEGRAM_WEBHOOK_SECRET: 'synthetic-webhook',
  TELEGRAM_ENABLE_SEND: 'true',
  TELEGRAM_TEST_CHAT_IDS: '101',
});
const row = (overrides = {}) => ({
  key: 'synthetic-key', owner: 'owner@example.test', chatId: '101',
  text: 'Synthetic notification', status: 'pending', created: NOW - 1000,
  attempts: 0, ...overrides,
});
const fixture = (outbox = [row()]) => ({
  pending: [], bindings: [{ owner: { email: 'owner@example.test', role: 'sportif' }, chatId: '101' }],
  outbox,
});
const response = (status, payload) => ({ ok: status >= 200 && status < 300, status, json: async () => payload });
const accepted = () => response(200, { ok: true, result: { message_id: 42 } });

function harness({ state = fixture(), env = {}, ready = true, send = accepted } = {}) {
  const inputBefore = JSON.stringify(state);
  const mutableState = structuredClone(state);
  const calls = [];
  let now = NOW;
  let mutations = 0;
  const module = { exports: {} };
  const context = vm.createContext({
    module, exports: module.exports,
    process: { env: Object.freeze({ ...ENV, ...env }) },
    Date: Object.freeze({ now: () => now }),
    AbortSignal: { timeout: milliseconds => {
      assert.equal(milliseconds, 8000);
      return Object.freeze({ syntheticTimeout: milliseconds });
    } },
    fetch: async (url, options) => {
      assert.equal(url, 'https://api.telegram.org/botsynthetic-token/sendMessage');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers['Content-Type'], 'application/json');
      assert.equal(options.signal.syntheticTimeout, 8000);
      calls.push(JSON.parse(options.body));
      return send(calls.length, mutableState);
    },
    require: name => {
      if (name === './telegram-state') return {
        telegramStorageReady: () => ready,
        mutateTelegram: async change => { mutations++; return change(mutableState); },
      };
      if (name === 'node:crypto') return {
        createHash: () => { throw new Error('Unexpected crypto use'); },
        randomBytes: () => { throw new Error('Unexpected crypto use'); },
      };
      throw new Error('Forbidden module: ' + name);
    },
  });
  vm.runInContext(js, context, { filename: sourcePath, timeout: 1000 });
  return {
    state: mutableState, calls,
    advance: milliseconds => { now += milliseconds; },
    flush: () => module.exports.flushTelegram(),
    get mutations() { return mutations; },
    assertInputsPreserved: () => assert.equal(JSON.stringify(state), inputBefore),
  };
}

for (const [name, options] of [
  ['sending disabled', { env: { TELEGRAM_ENABLE_SEND: 'false' } }],
  ['sending not explicitly enabled', { env: { TELEGRAM_ENABLE_SEND: undefined } }],
  ['empty allowlist', { env: { TELEGRAM_TEST_CHAT_IDS: '' } }],
  ['whitespace allowlist', { env: { TELEGRAM_TEST_CHAT_IDS: ' , ' } }],
  ['missing bot token', { env: { TELEGRAM_BOT_TOKEN: '' } }],
  ['missing webhook secret', { env: { TELEGRAM_WEBHOOK_SECRET: '' } }],
  ['storage unavailable', { ready: false }],
]) test(name + ' prevents sends and storage changes', async () => {
  const h = harness(options);
  await h.flush();
  assert.equal(h.calls.length, 0);
  assert.equal(h.mutations, 0);
  assert.equal(h.state.outbox[0].status, 'pending');
  h.assertInputsPreserved();
});

test('429 schedules pending, skips immediate retries and sends at the eligible boundary', async () => {
  const h = harness({ send: attempt => attempt === 1
    ? response(429, { ok: false, parameters: { retry_after: 2 } }) : accepted() });
  await h.flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.state.outbox[0].status, 'pending');
  assert.equal(h.state.outbox[0].attempts, 1);
  assert.equal(h.state.outbox[0].retryAt, NOW + 2000);
  await h.flush();
  h.advance(1999);
  await h.flush();
  assert.equal(h.calls.length, 1);
  h.advance(1);
  await h.flush();
  assert.equal(h.calls.length, 2);
  assert.equal(h.state.outbox[0].status, 'accepted');
  assert.equal(h.state.outbox[0].attempts, 2);
  assert.equal(h.state.outbox[0].messageId, 42);
  assert.equal(h.state.outbox[0].retryAt, undefined);
  h.assertInputsPreserved();
});

for (const [name, retryAfter, delay] of [
  ['missing', undefined, 60000], ['zero', 0, 60000],
  ['negative', -2, 1000], ['numeric string', '3', 3000],
]) test('429 ' + name + ' retry delay remains bounded and defers sending', async () => {
  const h = harness({ send: () => response(429, { parameters: { retry_after: retryAfter } }) });
  await h.flush();
  await h.flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.state.outbox[0].status, 'pending');
  assert.equal(h.state.outbox[0].retryAt, NOW + delay);
});

for (const retryAfter of ['Infinity', 1e308]) test('429 non-finite/overflow delay ' + retryAfter + ' retains a finite future retry', async () => {
  const h = harness({ send: () => response(429, { parameters: { retry_after: retryAfter } }) });
  await h.flush();
  const queued = h.state.outbox[0];
  assert.equal(queued.status, 'pending');
  assert.ok(Number.isFinite(queued.retryAt), 'retryAt must remain finite for persistence and eligibility');
  assert.equal(queued.retryAt, NOW + 60000);
  await h.flush();
  assert.equal(h.calls.length, 1);
});

for (const status of [400, 401, 403, 404]) test('HTTP ' + status + ' fails without blind resend', async () => {
  const h = harness({ send: () => response(status, { ok: false }) });
  await h.flush();
  assert.equal(h.state.outbox[0].status, 'failed');
  h.advance(86400000);
  await h.flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.state.outbox[0].attempts, 1);
});

for (const [name, send] of [
  ['timeout rejection', () => { const error = new Error('Synthetic timeout'); error.name = 'TimeoutError'; throw error; }],
  ['network rejection', () => { throw new TypeError('Synthetic network failure'); }],
  ['HTTP 500', () => response(500, { ok: false })],
  ['HTTP 503', () => response(503, { ok: false })],
  ['JSON parsing rejection', () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('Synthetic JSON'); } })],
  ['null payload', () => response(200, null)],
  ['undefined payload', () => response(200, undefined)],
  ['missing result', () => response(200, { ok: true })],
  ['string message ID', () => response(200, { ok: true, result: { message_id: '42' } })],
  ['unsafe message ID', () => response(200, { ok: true, result: { message_id: Number.MAX_SAFE_INTEGER + 1 } })],
  ['false success flag', () => response(200, { ok: false, result: { message_id: 42 } })],
]) test(name + ' becomes uncertain without blind resend', async () => {
  const h = harness({ send });
  await h.flush();
  assert.equal(h.state.outbox[0].status, 'uncertain');
  h.advance(86400000);
  await h.flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.state.outbox[0].attempts, 1);
  assert.equal(h.state.outbox[0].messageId, undefined);
});

test('expired sending lease becomes uncertain and is never sent again', async () => {
  const h = harness({ state: fixture([row({ status: 'sending', attempts: 1, retryAt: NOW - 1 })]) });
  await h.flush();
  h.advance(86400000);
  await h.flush();
  assert.equal(h.state.outbox[0].status, 'uncertain');
  assert.equal(h.state.outbox[0].attempts, 1);
  assert.equal(h.calls.length, 0);
});

test('unexpired sending lease stays in flight and becomes uncertain after expiry', async () => {
  const h = harness({ state: fixture([row({ status: 'sending', attempts: 1, retryAt: NOW + 30000 })]) });
  await h.flush();
  assert.equal(h.state.outbox[0].status, 'sending');
  h.advance(30001);
  await h.flush();
  assert.equal(h.state.outbox[0].status, 'uncertain');
  assert.equal(h.calls.length, 0);
});

test('accepted delivery records its ID and is never automatically sent again', async () => {
  const h = harness({ send: (_attempt, state) => {
    assert.equal(state.outbox[0].status, 'sending');
    assert.equal(state.outbox[0].attempts, 1);
    assert.equal(state.outbox[0].retryAt, NOW + 30000);
    return accepted();
  } });
  await h.flush();
  assert.equal(h.state.outbox[0].status, 'accepted');
  assert.equal(h.state.outbox[0].messageId, 42);
  h.advance(86400000);
  await h.flush();
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0], { chat_id: '101', text: 'Synthetic notification' });
  h.assertInputsPreserved();
});

for (const [name, state, env] of [
  ['bound target absent from allowlist', {
    ...fixture([row({ chatId: '202' })]),
    bindings: [{ owner: { email: 'owner@example.test' }, chatId: '202' }],
  }, {}],
  ['missing binding', { ...fixture(), bindings: [] }, {}],
  ['binding owner mismatch', { ...fixture(), bindings: [{ owner: { email: 'other@example.test' }, chatId: '101' }] }, {}],
  ['binding target mismatch', { ...fixture(), bindings: [{ owner: { email: 'owner@example.test' }, chatId: '202' }] }, {}],
  ['substring allowlist mismatch', fixture(), { TELEGRAM_TEST_CHAT_IDS: '1101,1010' }],
]) test(name + ' forbids dispatch', async () => {
  const h = harness({ state, env });
  await h.flush();
  assert.equal(h.calls.length, 0);
  assert.equal(h.state.outbox[0].status, 'pending');
  assert.equal(h.state.outbox[0].attempts, 0);
});

test('each flush sends at most ten eligible messages and preserves future rows', async () => {
  const rows = Array.from({ length: 12 }, (_, i) => row({ key: 'synthetic-' + i }));
  rows.unshift(row({ key: 'future', retryAt: NOW + 1000 }));
  const h = harness({ state: fixture(rows), env: { TELEGRAM_TEST_CHAT_IDS: ' 101 , 303 ' } });
  await h.flush();
  assert.equal(h.calls.length, 10);
  assert.equal(h.state.outbox.filter(item => item.status === 'accepted').length, 10);
  assert.equal(h.state.outbox[0].status, 'pending');
  assert.equal(h.state.outbox[0].attempts, 0);
  await h.flush();
  assert.equal(h.calls.length, 12);
  h.assertInputsPreserved();
});
