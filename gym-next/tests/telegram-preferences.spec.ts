import {test,expect} from '@playwright/test';
import path from 'node:path';
test('Telegram preferences require authentication and same origin',async({request,page},info)=>{
 expect((await request.get('/api/telegram/preferences')).status()).toBe(401);
 expect((await request.post('/api/telegram/preferences',{data:{action:'start'},headers:{Origin:'https://untrusted.invalid'}})).status()).toBe(403);
 const signed=await page.request.post('/api/auth/sign-in',{data:{email:'sportif@example.com',password:'demo-password',role:'sportif'}});
 expect(signed.status()).toBe(200);
 // Local HTTP recipe only: preserve the server-signed value, adapt transport to loopback.
 const cookie=signed.headers()['set-cookie'].split(';')[0];const separator=cookie.indexOf('=');
 await page.context().addCookies([{name:cookie.slice(0,separator),value:cookie.slice(separator+1),url:'http://127.0.0.1:3005',httpOnly:true,sameSite:'Lax',secure:false}]);
 const response=await page.request.get('/api/telegram/preferences');expect(response.status()).toBe(200);
 expect(await response.json()).toMatchObject({configured:false,linked:false});
 await page.goto('/compte?mode=sportif');
 await expect(page.getByRole('heading',{name:'Notifications sur téléphone'})).toBeVisible();
 await expect(page.getByText('Aucun message n’est envoyé.',{exact:false})).toBeVisible();
 await page.screenshot({path:path.resolve(__dirname,`../../docs/assets/stripe-telegram-2026-11-03/notifications-${info.project.name}.png`),fullPage:true});
});
