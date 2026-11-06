import { test as base, expect } from '@playwright/test';
import type { Server } from 'node:http';
import path from 'node:path';

// Repository-only test tool. Resolve at test runtime so the app's typecheck/build
// does not gain a dependency on files outside gym-next in standalone exports.
const createPreview: () => Promise<Server> = require(path.resolve(
  __dirname, '../../../tools/public-assets/preview.cjs',
)).createPreview;

// Worker-scoped loopback server: no production app dependency and no shared fixed port.
export const test = base.extend<object, { prototypeURL: string }>({
  prototypeURL: [async ({}, use) => {
    const configured = process.env.PW_PROTOTYPE_BASE_URL;
    if (configured) {
      const url = new URL(configured);
      if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.username || url.password) {
        throw new Error('Prototype tests require an explicit loopback HTTP origin');
      }
      await use(url.origin);
      return;
    }
    const server = await createPreview();
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    try {
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Missing prototype server address');
      await use(`http://127.0.0.1:${address.port}`);
    } finally {
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  }, { scope: 'worker' }],
});
export { expect };
