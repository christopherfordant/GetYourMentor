import {test,expect} from '@playwright/test';
import {sealSession,SESSION_MAX_AGE_SECONDS} from '../lib/session-envelope';
import {createCipheriv,createHash,randomBytes} from 'node:crypto';
test.use({baseURL:process.env.PW_DEMO_BASE_URL??'http://127.0.0.1:3006'});
test('retained expired or legacy cookie is refused; normal login restores access',async({page,baseURL},info)=>{
 const secret=process.env.GYM_SESSION_TEST_SECRET;test.skip(!secret,'Requires isolated local fixture server with matching ephemeral secret');
 const identity={email:'sportif@example.com',role:'sportif' as const};
 const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',createHash('sha256').update(secret!).digest(),iv),encrypted=Buffer.concat([c.update(JSON.stringify(identity)),c.final()]);
 const legacy=[iv,c.getAuthTag(),encrypted].map(v=>v.toString('base64url')).join('.');
 for(const token of [sealSession(identity,secret!,Date.now()-SESSION_MAX_AGE_SECONDS*1000-1000),legacy]){
  await page.context().clearCookies();await page.context().addCookies([{name:'gym_session',value:token,url:baseURL!,httpOnly:true,secure:false,sameSite:'Lax'}]);
  expect((await page.request.get('/api/reservations')).status()).toBe(401);
  await page.goto('/compte?mode=admin&connected=1');await expect(page.locator('#account-email')).toBeVisible();await expect(page.locator('[data-account-session]')).toHaveCount(0);
 }
 const login=await page.request.post('/api/auth/sign-in',{data:{...identity,password:'demo-password'}});expect(login.status()).toBe(200);
 const pair=login.headers()['set-cookie'].split(';')[0];await page.context().addCookies([{name:'gym_session',value:pair.slice(pair.indexOf('=')+1),url:baseURL!,httpOnly:true,secure:false,sameSite:'Lax'}]);
 expect((await page.request.get('/api/reservations')).status()).toBe(200);await page.goto('/compte');await expect(page.locator('[data-account-session]')).toBeVisible();
 await page.getByRole('button',{name:'Se d\u00e9connecter',exact:true}).click();await expect(page.locator('#account-email')).toBeVisible();expect((await page.request.get('/api/reservations')).status()).toBe(401);
 await page.screenshot({path:'../delivery-private/session-expiry-'+info.project.name+'.png',fullPage:true});
});
