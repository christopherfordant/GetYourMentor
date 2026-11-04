import {test,expect} from '@playwright/test';
import {signupProviderError} from '../lib/signup-provider-error';
import {signUp} from '../lib/auth';

test('confirmation email limits are distinguishable without exposing provider details',async()=>{
 for(const payload of [{code:'over_email_send_rate_limit',message:'PRIVATE provider details'},{code:429,error_code:'over_email_send_rate_limit',msg:'PRIVATE legacy details'}]){
  const error=await signupProviderError(Response.json(payload,{status:429}));
  expect(error.status).toBe(429);expect(error.code).toBe('over_email_send_rate_limit');expect(error.message).not.toContain('PRIVATE');
 }
});
test('unrecognized or malformed errors stay generic',async()=>{
 for(const response of [Response.json({code:'private_unknown',message:'PRIVATE'}),new Response('PRIVATE')]){
  const error=await signupProviderError(response);expect(error.code).toBe('signup_provider_error');expect(error.message).toBe('Inscription impossible.');
 }
});
test('refused signup makes no metadata or profile writes and no automatic retry',async()=>{
 const oldFetch=globalThis.fetch,previous={...process.env};let calls=0;
 Object.assign(process.env,{SUPABASE_URL:'https://pqxqqbwesfrefzjoawmx.supabase.co',SUPABASE_ANON_KEY:'fixture',SUPABASE_SERVICE_ROLE_KEY:'fixture'});
 globalThis.fetch=async()=>{calls++;return Response.json({code:'email_address_not_authorized',message:'PRIVATE'},{status:403});};
 try{await expect(signUp('demo@example.com','test-password','sportif')).rejects.toMatchObject({code:'email_address_not_authorized',status:503});expect(calls).toBe(1);}
 finally{globalThis.fetch=oldFetch;for(const key of Object.keys(process.env))if(!(key in previous))delete process.env[key];Object.assign(process.env,previous);}
});
