import {NextResponse} from 'next/server';
import {currentSession} from '@/lib/auth';
import {connectEnabled,connectStatus,connectOnboarding} from '@/lib/stripe-connect';
import {rateLimit} from '@/lib/request-guards';
export const dynamic='force-dynamic';
export async function GET(){
 const s=await currentSession();if(!s||s.role!=='coach'||!s.coachId)return NextResponse.json({error:'Connexion coach requise'},{status:403});
 if(!connectEnabled())return NextResponse.json({enabled:false},{headers:{'Cache-Control':'no-store'}});
 try{return NextResponse.json({enabled:true,...await connectStatus(s.coachId)},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Configuration Connect de test indisponible'},{status:503});}
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Origine refusée'},{status:403});
 const s=await currentSession();if(!s||s.role!=='coach'||!s.coachId)return NextResponse.json({error:'Connexion coach requise'},{status:403});
 if(!rateLimit(request,'connect-onboarding',5,60000).allowed)return NextResponse.json({error:'Réessayez plus tard'},{status:429});
 // Body intentionally ignored: a browser cannot assign a coach or beneficiary.
 try{return NextResponse.json(await connectOnboarding(s.coachId),{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Association Stripe de test indisponible. Vérifiez la configuration de recette.'},{status:503});}
}
