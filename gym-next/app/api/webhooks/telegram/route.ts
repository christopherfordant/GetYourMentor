import {timingSafeEqual} from 'node:crypto';import {NextResponse} from 'next/server';import {receiveTelegramPairing} from '@/lib/telegram';
export async function POST(request:Request){
 const secret=process.env.TELEGRAM_WEBHOOK_SECRET,header=request.headers.get('x-telegram-bot-api-secret-token');if(!secret)return NextResponse.json({error:'Telegram non configuré'},{status:503});
 if(!header||Buffer.byteLength(header)!==Buffer.byteLength(secret)||!timingSafeEqual(Buffer.from(header),Buffer.from(secret)))return NextResponse.json({error:'Accès refusé'},{status:403});
 if(Number(request.headers.get('content-length'))>16384)return NextResponse.json({error:'Payload trop volumineux'},{status:413});const text=await request.text();if(Buffer.byteLength(text)>16384)return NextResponse.json({error:'Payload trop volumineux'},{status:413});
 let update:unknown;try{update=JSON.parse(text);}catch{return NextResponse.json({error:'Payload invalide'},{status:400});}try{await receiveTelegramPairing(update);return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Association temporairement indisponible'},{status:503});}
}
