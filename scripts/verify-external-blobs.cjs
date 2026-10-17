// Local contract investigation of the MIT-licensed installed dependency; no live service.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getStore } = require('../gym-next/node_modules/@netlify/blobs');
const { version } = require('../gym-next/node_modules/@netlify/blobs/package.json');
assert.equal(version, '11.1.4', 'Re-evaluate the contract after a dependency upgrade');
(async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('External network disabled for this investigation'); };
  let responseStatus = 412;
  const calls = [];
  try {
    const store = getStore({ name: 'rea-local-contract', siteID: 'fictitious-site', token: 'fictitious-token', edgeURL: 'https://blobs.invalid', uncachedEdgeURL: 'https://blobs.invalid', consistency: 'strong',
      fetch: async (_url, init) => {
        const headers = new Headers(init.headers);
        calls.push({ method: init.method, ifMatch: headers.get('if-match'), ifNoneMatch: headers.get('if-none-match') });
        return new Response(null, { status: responseStatus, headers: { etag: 'local-version-2' } });
      },
    });
    assert.equal((await store.setJSON('state', { preview: true }, { onlyIfMatch: 'local-version-1' })).modified, false);
    assert.equal(calls[0].ifMatch, 'local-version-1');
    responseStatus = 200;
    assert.equal((await store.setJSON('state', { preview: true }, { onlyIfNew: true })).modified, true);
    assert.equal(calls[1].ifNoneMatch, '*');
    await assert.rejects(() => store.setJSON('state', {}, { onlyIfNew: true, onlyIfMatch: 'local-version-1' }));
    assert.equal(calls.length, 2);
    const out = path.join(__dirname, '../docs/assets/offres-demo-2026-10-17/blobs-contract.json');
    fs.writeFileSync(out, JSON.stringify({ target: `@netlify/blobs@${version}`, mode: 'fake fetch only; no Netlify network', checks: ['onlyIfMatch becomes if-match', '412 returns modified false', 'onlyIfNew becomes if-none-match star', '200 returns modified true', 'mutually exclusive conditions rejected before fetch'], calls }, null, 2) + '\n');
    process.stdout.write('External client contract: 5 checks passed, 0 live requests.\n');
  } finally { globalThis.fetch = originalFetch; }
})().catch(error => { process.stderr.write(error.message + '\n'); process.exitCode = 1; });
