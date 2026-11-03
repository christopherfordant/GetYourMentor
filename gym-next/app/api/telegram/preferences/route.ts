import {NextResponse} from 'next/server';
import {currentSession} from '@/lib/auth';
import {listReservations} from '@/lib/reservations';
import {addTelegramEvent,flushTelegram} from '@/lib/telegram';
import {mutateTelegram} from '@/lib/telegram-state';
import {telegramPreferences,startTelegramPairing,confirmTelegramPairing,unlinkTelegram} from '@/lib/telegram';
export const dynamic='force-dynamic';
export async function GET(){const session=await currentSession();if(!session)return NextResponse.json({error:'Connexion requise'},{status:401});try{return NextResponse.json(await telegramPreferences(session),{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Préférences indisponibles'},{status:503});}}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Origine refusée'},{status:403});
 const session=await currentSession();if(!session)return NextResponse.json({error:'Connexion requise'},{status:401});
 if(Number(request.headers.get('content-length'))>1024)return NextResponse.json({error:'Requête trop volumineuse'},{status:413});
 const text=await request.text();if(Buffer.byteLength(text)>1024)return NextResponse.json({error:'Requête trop volumineuse'},{status:413});
 let action:string;try{action=JSON.parse(text).action;}catch{return NextResponse.json({error:'Requête invalide'},{status:400});}
 if(action==='retry'){
  try{
   if(session.role!=='sportif'&&session.role!=='coach')return NextResponse.json({error:'Rôle non concerné'},{status:403});
   if(session.role==='coach'&&!session.coachId)return NextResponse.json({error:'Coach absent'},{status:403});
   const reservations=await listReservations(session.role==='coach'?{coachId:session.coachId}:{ownerEmail:session.email});
   await mutateTelegram(state=>{for(const reservation of reservations.slice(-100)){
    if(reservation.status==='requested'||reservation.status==='accepted'||reservation.status==='rejected')addTelegramEvent(state,reservation,reservation.status);
    else if(reservation.status==='paid'&&reservation.stripePaymentIntentId)addTelegramEvent(state,reservation,'paid');
   }});
   await flushTelegram();return NextResponse.json(await telegramPreferences(session));
  }catch{return NextResponse.json({error:'Reprise indisponible'},{status:503});}
 }
 try{if(action==='start')return NextResponse.json(await startTelegramPairing(session),{headers:{'Cache-Control':'no-store'}});if(action==='confirm')await confirmTelegramPairing(session);else if(action==='unlink')await unlinkTelegram(session);else return NextResponse.json({error:'Action invalide'},{status:400});return NextResponse.json(await telegramPreferences(session),{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Association indisponible ou expirée. Réessayez depuis votre compte.'},{status:409});}
}
