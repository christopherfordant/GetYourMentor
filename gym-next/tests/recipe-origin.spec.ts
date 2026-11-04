import {test,expect} from '@playwright/test';

test('Telegram accepts the configured public origin before requiring authentication',async({request})=>{
 const origin=new URL(test.info().project.use.baseURL as string).origin;
 const allowed=await request.post('/api/telegram/preferences',{headers:{Origin:origin},data:{action:'start'}});
 expect(allowed.status()).toBe(401);
 expect((await allowed.json()).error).toBe('Connexion requise');
 const untrustedHeaders:Record<string,string>[]=[{Origin:'https://example.com'},{}];
 for(const headers of untrustedHeaders){
  const refused=await request.post('/api/telegram/preferences',{headers,data:{action:'start'}});
  expect(refused.status()).toBe(403);
 }
});

test('Connect distinguishes a trusted anonymous request from a foreign origin',async({request})=>{
 const origin=new URL(test.info().project.use.baseURL as string).origin;
 const anonymous=await request.post('/api/stripe/connect',{headers:{Origin:origin},data:{coachId:'forged'}});
 expect(anonymous.status()).toBe(403);
 expect((await anonymous.json()).error).toBe('Connexion coach requise');
 const foreign=await request.post('/api/stripe/connect',{headers:{Origin:'https://example.com'},data:{coachId:'forged'}});
 expect(foreign.status()).toBe(403);
});
