const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../../gym-next/node_modules/typescript');

// Only source files are read. All storage, environment, fetch and queue IO is synthetic.
function harness({ remote = false, local = true, read, fetch } = {}) {
  const calls = [];
  const env = remote ? { SUPABASE_URL: 'https://synthetic.invalid', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-key' } : {};
  const state = { pending: [], bindings: [], outbox: [] };
  const io = {
    readFile: async () => { calls.push('read'); return read ? read() : JSON.stringify(state); },
    mkdir: async () => { calls.push('mkdir'); },
    writeFile: async () => { calls.push('write'); },
    rename: async () => { calls.push('rename'); },
  };
  const context = vm.createContext({ process: { env, cwd: () => '/synthetic/app' }, AbortSignal,
    fetch: async (...args) => { calls.push(args); if (!fetch) throw Error('unexpected network'); return fetch(...args); },
  });
  const modules = {};
  function load(name) {
    if (modules[name]) return modules[name];
    const js = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../../gym-next/lib/', name + '.ts'), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const module = { exports: {} };
    const requireStub = id => {
      if (id === 'server-only') return {};
      if (id === 'node:fs/promises') return io;
      if (id === 'node:path') return path;
      if (id === 'node:crypto') return { randomUUID: () => 'synthetic-uuid' };
      if (id === './runtime') return { isLocalPortraitPreview: () => local };
      if (id.startsWith('./telegram-')) return load(id.slice(2));
      throw Error('Unexpected dependency: ' + id);
    };
    vm.runInContext('(function(require,module,exports){' + js + '\n})', context)(requireStub, module, module.exports);
    return modules[name] = module.exports;
  }
  return { load, calls, context };
}
const plain = value => JSON.parse(JSON.stringify(value));
const failed = { ok: false, code: 'TELEGRAM_SUPERVISION_UNAVAILABLE' };

test('remote projection issues exactly one GET and returns only aggregate data', async () => {
  const privateRow = { status: 'accepted', attempts: 1, created: 1, retryAt: 10, text: 'PRIVATE', chatId: 'PRIVATE', owner: 'PRIVATE' };
  const h = harness({ remote: true, fetch: async () => ({ ok: true, json: async () => [{ payload: { pending: [], bindings: [], outbox: [privateRow] } }] }) });
  const result = plain(await h.load('telegram-supervision').readTelegramSupervision(10));
  assert.equal(result.ok, true);
  assert.equal(result.metrics.statuses.accepted, 1);
  assert.equal(result.metrics.retryAt.due, 1);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE|chatId|owner|text/);
  assert.equal(h.calls.length, 1);
  const [url, options] = h.calls[0];
  assert.match(url, /select=payload$/);
  assert.equal(options.method, 'GET');
  assert.equal(options.cache, 'no-store');
  assert.equal(options.body, undefined);
});

test('local ENOENT returns empty aggregates without creating anything', async () => {
  const h = harness({ read: async () => { throw Object.assign(Error('PRIVATE filename'), { code: 'ENOENT' }); } });
  const result = await h.load('telegram-supervision').readTelegramSupervision(10);
  assert.equal(result.ok, true);
  assert.equal(result.metrics.total, 0);
  assert.deepEqual(h.calls, ['read']);
});

test('read joins mutation queue and blocks later mutation until snapshot is complete', async () => {
  let releaseFirst, releaseRead;
  const first = new Promise(resolve => { releaseFirst = resolve; });
  const during = new Promise(resolve => { releaseRead = resolve; });
  const h = harness({ read: async () => { await during; return '{"pending":[],"bindings":[],"outbox":[]}'; } });
  h.context.telegramLocalQueue = first;
  const state = h.load('telegram-state');
  const snapshot = state.readTelegramSnapshot();
  const mutation = state.mutateTelegram(() => { h.calls.push('change'); });
  await Promise.resolve();
  assert.deepEqual(h.calls, []);
  releaseFirst();
  await new Promise(setImmediate);
  assert.deepEqual(h.calls, ['read']);
  releaseRead();
  await snapshot;
  await mutation;
  assert.deepEqual(h.calls, ['read', 'read', 'change', 'mkdir', 'write', 'rename']);
});

test('remote errors never fall back to local or expose errors', async () => {
  for (const fetch of [async () => { throw Error('PRIVATE URL token'); }, async () => ({ ok: false }), async () => ({ ok: true, json: async () => { throw Error('PRIVATE JSON'); } })]) {
    const h = harness({ remote: true, fetch });
    assert.deepEqual(plain(await h.load('telegram-supervision').readTelegramSupervision(0)), failed);
    assert.equal(h.calls.length, 1);
    await assert.rejects(h.load('telegram-state').readTelegramSnapshot(), { message: 'TELEGRAM_SNAPSHOT_UNAVAILABLE' });
    assert.equal(h.calls.length, 2);
  }
});

test('invalid remote or local payloads are rejected with static expurgated failure', async () => {
  for (const payload of [null, [], {}, { pending: [], bindings: [], outbox: 'PRIVATE' }]) {
    const h = harness({ remote: true, fetch: async () => ({ ok: true, json: async () => [{ payload }] }) });
    assert.deepEqual(plain(await h.load('telegram-supervision').readTelegramSupervision(0)), failed);
  }
  for (const read of [async () => 'PRIVATE invalid JSON', async () => '{"outbox":[]}', async () => { throw Error('PRIVATE path'); }]) {
    const h = harness({ read });
    assert.deepEqual(plain(await h.load('telegram-supervision').readTelegramSupervision(0)), failed);
    assert.deepEqual(h.calls, ['read']);
  }
});

test('finite injected now governs due counts; invalid now and unconfigured storage perform no IO', async () => {
  const h = harness({ read: async () => JSON.stringify({ pending: [], bindings: [], outbox: [{ status: 'failed', attempts: 2, created: 0, retryAt: 20 }] }) });
  const api = h.load('telegram-supervision');
  assert.equal((await api.readTelegramSupervision(19)).metrics.retryAt.future, 1);
  assert.equal((await api.readTelegramSupervision(20)).metrics.retryAt.due, 1);
  for (const now of [NaN, Infinity, undefined]) assert.deepEqual(plain(await api.readTelegramSupervision(now)), failed);
  assert.deepEqual(h.calls, ['read', 'read']);
  const off = harness({ local: false });
  assert.deepEqual(plain(await off.load('telegram-supervision').readTelegramSupervision(0)), failed);
  assert.deepEqual(off.calls, []);
});

test('module import is lazy and failed local reads leave the queue usable', async () => {
  let fail = true;
  const h = harness({ read: async () => { if (fail) throw Error('PRIVATE'); return '{"pending":[],"bindings":[],"outbox":[]}'; } });
  const api = h.load('telegram-supervision');
  assert.deepEqual(h.calls, []);
  assert.deepEqual(plain(await api.readTelegramSupervision(0)), failed);
  fail = false;
  assert.equal((await api.readTelegramSupervision(0)).ok, true);
  assert.deepEqual(h.calls, ['read', 'read']);
});
