import {test,expect} from '@playwright/test';
import {signUp} from '../lib/auth';
let original:typeof fetch;let env:NodeJS.ProcessEnv;let writes:Array<{url:string;body:any}>;
const profile={firstName:'Coach',lastName:'Demonstration',phone:'0000000000',city:'Ville de test',termsAccepted:true};
test.beforeEach(()=>{env={...process.env};original=globalThis.fetch;writes=[];Object.assign(process.env,{SUPABASE_URL:'https://pqxqqbwesfrefzjoawmx.supabase.co',SUPABASE_ANON_KEY:'test-placeholder',SUPABASE_SERVICE_ROLE_KEY:'test-placeholder'});globalThis.fetch=async(i,init)=>{
 const url=String(i);if(init?.method==='PUT'||url.includes('/rest/'))writes.push({url,body:JSON.parse(String(init?.body??'{}'))});
 if(url.endsWith('/signup'))return Response.json({id:'11111111-1111-4111-8111-111111111111',identities:[{provider:'email'}],created_at:new Date().toISOString()});
 if(url.includes('/admin/users/'))return Response.json({});
 if(url.endsWith('/gym_coaches'))return Response.json([]);
 throw Error('Unexpected signup test request');
};});
test.afterEach(()=>{globalThis.fetch=original;for(const k of Object.keys(process.env))if(!(k in env))delete process.env[k];Object.assign(process.env,env);});
test('unconfirmed Supabase signup persists server-assigned coach role without inventing a session',async()=>{
 const result=await signUp('coach-test@example.com','test-password','coach',profile);expect(result).toMatchObject({confirmationRequired:true,role:'coach'});
 expect(writes[0].body.app_metadata).toEqual({role:'coach',coach_id:'coach-11111111-1111-4111-8111-111111111111'});
 expect(writes[1].body.id).toBe('coach-11111111-1111-4111-8111-111111111111');expect(writes[1].body.verified).toBe(false);
});
test('administrator signup is rejected before any provider call',async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({});};await expect(signUp('demo@example.com','test-password','admin',profile)).rejects.toThrow();expect(calls).toBe(0);
});
test('obfuscated duplicate and older users cannot have their role overwritten',async()=>{
 for(const user of [{id:'existing',identities:[],created_at:new Date().toISOString()},{id:'existing',identities:[{}],created_at:'2020-01-01T00:00:00Z'}]){
  globalThis.fetch=async()=>Response.json(user);await expect(signUp('demo@example.com','test-password','coach',profile)).rejects.toThrow();expect(writes).toHaveLength(0);
 }
});
test('missing privileged configuration blocks before partially registering a user',async()=>{
 delete process.env.SUPABASE_SERVICE_ROLE_KEY;let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({});};await expect(signUp('demo@example.com','test-password','sportif',profile)).rejects.toThrow();expect(calls).toBe(0);
});
