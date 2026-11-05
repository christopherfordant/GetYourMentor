import type {CoachProfile} from './domain';

// Administrative recipe capability; never changes professional verification.
export function recipeCoachApproved(id:string):boolean{
 if(typeof window!=='undefined'||process.env.GYM_REAL_TEST_SERVICES!=='true'||process.env.DEPLOY_ENV!=='recipe'
  ||process.env.NETLIFY||process.env.VERCEL||process.env.SITE_ID
  ||process.env.NEXT_PUBLIC_APP_URL!=='http://127.0.0.1:3005'
  ||process.env.SUPABASE_URL!=='https://pqxqqbwesfrefzjoawmx.supabase.co'
  ||process.env.PAYMENT_PROVIDER!=='stripe'||!/^sk_test_[A-Za-z0-9]+$/.test(process.env.STRIPE_SECRET_KEY??'')
  ||process.env.GETYOURMENTOR_ALLOW_DEMO!=='false'||process.env.GETYOURMENTOR_ACCEPTANCE_MODE!=='false')return false;
 try{
  const a=JSON.parse(process.env.RECIPE_COACH_APPROVAL??'null');const now=Date.now();
  return a?.version===1&&a.action==='approve'&&a.project==='pqxqqbwesfrefzjoawmx'
   &&a.coachId===id&&/^coach-[a-f0-9-]{36}$/.test(id)&&typeof a.actor==='string'&&a.actor.length>0
   &&Number.isFinite(a.issuedAt)&&a.issuedAt<=now&&Number.isFinite(a.expiresAt)
   &&a.expiresAt>now&&a.expiresAt-a.issuedAt<=3600000;
 }catch{return false;}
}
export function canReserveCoach(coach:Pick<CoachProfile,'id'|'verified'>):boolean{
 return coach.verified===true||recipeCoachApproved(coach.id);
}
export function recipeApprovalActive():boolean{
 try{return recipeCoachApproved(JSON.parse(process.env.RECIPE_COACH_APPROVAL??'null')?.coachId??'');}catch{return false;}
}
export function recipeProjection<T extends {id:string;verified:boolean}>(coach:T):T & {recipeDemo?:boolean;bookingAllowed?:boolean}{
 return recipeCoachApproved(coach.id)?{...coach,recipeDemo:true,bookingAllowed:true}:coach;
}
