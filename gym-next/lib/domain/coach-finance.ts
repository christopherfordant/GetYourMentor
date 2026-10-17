import type { Reservation } from "@/lib/domain";
import { eurosToCents, refundedCommissionCents } from "./commission";
import { BOOKING_TIME_ZONE, slotInstant } from "./booking-time";
const monthKey=(instant:number)=>new Intl.DateTimeFormat("en-CA",{timeZone:BOOKING_TIME_ZONE,year:"numeric",month:"2-digit"}).format(new Date(instant));
const cents=(n:unknown):n is number=>typeof n==="number" && Number.isSafeInteger(n) && n>=0;
export function coachMonthlyFinance(rows:Reservation[],coachId:string,now=Date.now()) {
 const period=monthKey(now),label=new Intl.DateTimeFormat("fr-FR",{timeZone:BOOKING_TIME_ZONE,month:"long",year:"numeric"}).format(new Date(now));
 let documented=0,missing=0,ambiguousCancelled=0,undated=0,pendingRefunds=0;
 const totals={grossCents:0,refundCents:0,feeCents:0,coachCents:0};const seen=new Set<string>();
 for(const row of rows){
  if(row.coachId!==coachId || seen.has(row.id))continue;seen.add(row.id);
  if(row.status!=="paid" && row.status!=="cancelled")continue;
  const instant=slotInstant(row.createdAt);if(instant===null){undated++;continue;}if(monthKey(instant)!==period)continue;
  if(row.status==="cancelled" && !row.stripePaymentIntentId && !((row.refundStatus==="succeeded" || row.refundStatus==="pending") && typeof row.refundAmount==="number" && row.refundAmount>0)){ambiguousCancelled++;continue;}
  const s=row.financials;
  if(!s || s.currency!=="eur" || ![s.grossCents,s.platformFeeCents,s.coachAmountCents].every(cents) || !Number.isSafeInteger(s.commissionBps) || s.commissionBps<0 || s.commissionBps>10000 || !Number.isSafeInteger(s.commissionVersion) || s.commissionVersion<1 || s.platformFeeCents+s.coachAmountCents!==s.grossCents){missing++;continue;}
  let refund=0,feeRefund=0;
  if(row.status==="cancelled"){
   if(typeof row.refundAmount!=="number" || !Number.isFinite(row.refundAmount) || row.refundAmount<0 || Math.abs(row.refundAmount*100-Math.round(row.refundAmount*100))>0.00001 || !["succeeded","pending","not_required"].includes(row.refundStatus ?? "")){missing++;continue;}
   let amount:number;try{amount=eurosToCents(row.refundAmount);}catch{missing++;continue;}
   if(amount>s.grossCents || (row.refundStatus==="not_required" && amount!==0)){missing++;continue;}
   if(row.refundStatus==="pending")pendingRefunds++;
   if(row.refundStatus==="succeeded"){
    refund=amount;feeRefund=row.refundedPlatformFeeCents ?? refundedCommissionCents(s,refund);
    if(!cents(feeRefund) || feeRefund>s.platformFeeCents || feeRefund>refund || refund-feeRefund>s.coachAmountCents){missing++;continue;}
   }
  }
  const next={grossCents:s.grossCents,refundCents:refund,feeCents:s.platformFeeCents-feeRefund,coachCents:s.coachAmountCents-(refund-feeRefund)};
  if(Object.keys(totals).some(k=>!Number.isSafeInteger(totals[k as keyof typeof totals]+next[k as keyof typeof next]))){missing++;continue;}
  for(const k of Object.keys(totals) as (keyof typeof totals)[])totals[k]+=next[k];documented++;
 }
 return {period,label,timeZone:BOOKING_TIME_ZONE,documented,missing,ambiguousCancelled,undated,pendingRefunds,totals:documented===0 && (missing+ambiguousCancelled+undated)>0?null:totals};
}
export const formatFinanceCents=(value:number)=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(value/100);
