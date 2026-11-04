import {test,expect} from '@playwright/test';
test('Connect endpoints never accept a browser-supplied role or beneficiary',async({request})=>{
 expect((await request.get('/api/stripe/connect')).status()).toBe(403);
 expect((await request.post('/api/stripe/connect',{headers:{Origin:'https://example.com'},data:{coachId:'victim'}})).status()).toBe(403);
 const signin=await request.post('/api/auth/sign-in',{data:{email:'sportif@example.com',password:'demo-password',role:'sportif'}});expect(signin.ok()).toBe(true);
 const cookie=signin.headers()['set-cookie'].split(';')[0];
 expect((await request.get('/api/stripe/connect',{headers:{Cookie:cookie}})).status()).toBe(403);
 const base=new URL(test.info().project.use.baseURL as string).origin;
 expect((await request.post('/api/stripe/connect',{headers:{Cookie:cookie,Origin:base},data:{coachId:'victim',role:'coach',accountId:'acct_victim'}})).status()).toBe(403);
});
test('signup refuses administrator and invalid roles without creating an account',async({request})=>{
 for(const role of ['admin','unknown'])expect((await request.post('/api/auth/sign-up',{data:{email:'forbidden@example.com',password:'test-password',role}})).status()).toBe(400);
});
