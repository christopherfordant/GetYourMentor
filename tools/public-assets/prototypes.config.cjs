const {defineConfig}=require('../../gym-next/node_modules/@playwright/test');
const path=require('node:path');
module.exports=defineConfig({
  testDir:path.resolve(__dirname,'../../gym-next/tests'),
  testMatch:['door-transition-demo.spec.ts','equipment-entrance.spec.ts','pentagon-preview.spec.ts'],
  // These cases need the actual application; keep them in its existing suite.
  grepInvert:/capture source pages|actual home header|mobile header waits|door opening uses full slow/,
  workers:1, retries:0, timeout:60000,
  outputDir:path.resolve(__dirname,'../../delivery-private/prototype-tests/results'),
  reporter:[['list']],
  use:{baseURL:'http://127.0.0.1:4336',viewport:{width:1440,height:1000},browserName:'chromium'},
  // The shared fixture starts and stops an ephemeral loopback server per worker.
});
