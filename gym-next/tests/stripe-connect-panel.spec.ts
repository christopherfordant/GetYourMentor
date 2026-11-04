import {test,expect} from '@playwright/test';
test('coach Connect panel remains readable and handles a failed onboarding without redirecting',async({page},info)=>{
 // UI state mocked explicitly: this is not Stripe onboarding or a real account.
 const signin=await page.request.post('/api/auth/sign-in',{data:{email:'coach@example.com',password:'demo-password',role:'coach'}});expect(signin.ok()).toBe(true);
 await page.route('**/api/stripe/connect',async route=>{await route.fulfill({status:route.request().method()==='GET'?200:503,contentType:'application/json',body:JSON.stringify(route.request().method()==='GET'?{enabled:true,ready:false,mode:'test'}:{error:'Test failure'})});});
 await page.goto('/compte?mode=coach');
 const panel=page.getByRole('region',{name:'Stripe Connect de test'});
 await expect(panel).toBeVisible();await expect(panel).toContainText('Aucun encaissement ni versement bancaire réel');
 const button=panel.getByRole('button',{name:'Configurer mon compte Stripe de test'});await button.focus();await expect(button).toBeFocused();
 await panel.screenshot({path:`../docs/assets/connect-test-2026-11-04/panel-${info.project.name}.png`});
 await button.click();await expect(panel.getByRole('status')).toContainText('Association indisponible');expect(new URL(page.url()).hostname).toBe('127.0.0.1');
});
