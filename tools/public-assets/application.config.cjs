const {defineConfig}=require('../../gym-next/node_modules/@playwright/test');
const path=require('node:path');
module.exports=defineConfig({
  testDir:path.resolve(__dirname,'../../gym-next/tests'),
  testMatch:['door-transition-demo.spec.ts','equipment-entrance.spec.ts','pentagon-preview.spec.ts'],
  grep:/capture source pages|actual home header|mobile header waits|door opening uses full slow/,
  workers:1,retries:0,timeout:60000,
  outputDir:path.resolve(__dirname,'../../delivery-private/arc33-application-tests'),
  reporter:[['list']],
  use:{baseURL:'http://127.0.0.1:3006',viewport:{width:1440,height:1000},browserName:'chromium',
    // Local validation only: remote browser traffic cannot use a live proxy.
    launchOptions:{args:['--proxy-server=http://127.0.0.1:9','--proxy-bypass-list=127.0.0.1;localhost']}},
  // Candidate server is started explicitly, never reuse an unknown app automatically.
});
