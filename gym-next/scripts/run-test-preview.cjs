// Local demo only. No provider credentials or personal account environment inherited.
const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const env = {};
for (const [key, value] of Object.entries(process.env)) {
  if (/^(SystemRoot|windir|PATH|TEMP|TMP|APPDATA|LOCALAPPDATA|USERPROFILE|COMSPEC|PATHEXT|NUMBER_OF_PROCESSORS|PROCESSOR_ARCHITECTURE|ProgramFiles.*)$/i.test(key)) env[key] = value;
}
Object.assign(env, {
  SESSION_SECRET: randomBytes(32).toString('hex'),
  NODE_ENV: 'production',
  CI: 'true',
  NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3005',
  STRIPE_WEBHOOK_SECRET: 'test-webhook-secret',
  PAYMENT_PROVIDER: 'local',
  GETYOURMENTOR_ALLOW_DEMO: 'true',
  GETYOURMENTOR_ACCEPTANCE_MODE: 'true',
});
if (process.env.GYM_REAL_TEST_SERVICES === 'true') {
  for (const key of ['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET']) if(process.env[key]) env[key]=process.env[key];
  env.PAYMENT_PROVIDER='stripe';
  env.TELEGRAM_ENABLE_SEND='false';
}
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next', { paths: [root] }), 'start', '--hostname', '127.0.0.1', '--port', '3005'], { cwd: root, env, stdio: 'inherit', windowsHide: true });
child.on('exit', code => process.exit(code ?? 1));
process.on('SIGINT', () => child.kill());
process.on('SIGTERM', () => child.kill());
