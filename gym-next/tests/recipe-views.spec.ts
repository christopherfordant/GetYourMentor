import {test,expect} from '@playwright/test';
import path from 'node:path';

test('real recipe pages label the fictitious coach without professional verification',async({page})=>{
 const coach=process.env.GYM_RECIPE_VIEW_COACH;
 test.skip(!coach,'Requires the explicitly authorized local recipe coach');
 const notice='Profil fictif de démonstration — réservation de recette uniquement';
 const routes=[['directory','/coachs?sport=fitness&city=Paris'],['profile','/coach?coach='+encodeURIComponent(coach!)],['calendar','/creneau?coach='+encodeURIComponent(coach!)]];
 for(const [name,route] of routes){
  await page.goto(route);
  await expect(page.getByText(notice,{exact:true}).first()).toBeVisible({timeout:20000});
  expect(await page.getByText('Coach vérifié',{exact:true}).count()).toBe(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:path.resolve('../delivery-private/recipe-'+name+'-'+test.info().project.name+'.png'),fullPage:true});
 }
 const response=await page.request.get('/api/coaches/'+encodeURIComponent(coach!));expect(response.ok()).toBe(true);
 const dto=(await response.json()).data;expect(dto.verified).toBe(false);expect(dto.recipeDemo).toBe(true);
 for(const key of ['phone','identityStoragePath','diplomaStoragePath','bankAccountLast4'])expect(dto).not.toHaveProperty(key);
 const recap=process.env.GYM_RECIPE_VIEW_RESERVATION;
 for(const [cookie,route] of [[process.env.GYM_RECIPE_VIEW_SPORTIF_COOKIE,recap?'/recapitulatif?reservationId='+encodeURIComponent(recap):''],[process.env.GYM_RECIPE_VIEW_COACH_COOKIE,'/compte?mode=coach']]){
  if(!cookie||!route)continue;
  await page.context().clearCookies();
  await page.context().addCookies([{name:'gym_session',value:cookie.slice(cookie.indexOf('=')+1),domain:'127.0.0.1',path:'/',httpOnly:true,sameSite:'Lax',secure:false}]);
  await page.goto(route);
  await expect(page.getByText(notice,{exact:true}).first()).toBeVisible({timeout:20000});
  expect(await page.getByText('Coach vérifié',{exact:true}).count()).toBe(0);
 }
});
