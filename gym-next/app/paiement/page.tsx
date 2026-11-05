import {getReservation} from '@/lib/reservations';
import {canViewReservation} from '@/lib/policies/authorization';
import {hasPrivateReservationProof,privateReservationTokenValid} from '@/lib/private-reservation-proof';
import { ReservationProofBoundary } from "@/components/common/ReservationProofBoundary";
import { currentSession } from "@/lib/auth";
import type { Metadata } from "next";
import { PaiementLegacyPage } from "@/components/payment-legacy/PaiementLegacyPage";
import { ProductionUnavailable } from "@/components/common/ProductionUnavailable";
import { getBookingGate } from "@/lib/booking-gates";
import { buildCanonical, buildPageMetadata } from "@/lib/seo";

type PaiementPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PaiementPageProps): Promise<Metadata> {
  const params = await searchParams;
  const coachParam = params.coach;
  const sportParam = params.sport;
  const cityParam = params.city;
  const coach = Array.isArray(coachParam) ? coachParam[0] : coachParam;
  const sport = Array.isArray(sportParam) ? sportParam[0] : sportParam;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;

  return {
    ...buildPageMetadata({
      title: coach ? `Paiement - ${coach}` : "Paiement de la reservation",
      description: "Finalisez le paiement de votre reservation sportive sur GetYourMentor.",
    }),
    referrer: "no-referrer", robots: {index:false,follow:false},
    alternates: {
      canonical: buildCanonical("/paiement", { sport, city, coach }),
    },
  };
}

export default async function PaiementPage({ searchParams }: PaiementPageProps) {
  const params = await searchParams;
  const normalizedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  delete normalizedParams.claimToken;
  const session=await currentSession();
  let coachId=normalizedParams.coach;
  // Checkout returns carry a reservation ID, not a trusted coach from the URL.
  if(normalizedParams.reservationId&&session){
    try{
      const reservation=await getReservation(normalizedParams.reservationId);
      if(!reservation||!canViewReservation(session,reservation,(await hasPrivateReservationProof(reservation))||privateReservationTokenValid(reservation,typeof params.claimToken==='string'?params.claimToken:undefined)))return <ProductionUnavailable title="Paiement indisponible" description="Cette reservation n'est pas accessible depuis votre compte." />;
      coachId=reservation.coachId;
    }catch{return <ProductionUnavailable title="Paiement indisponible" description="La reservation ne peut pas etre verifiee pour le moment." />;}
  }
  const gate = await getBookingGate(coachId);
  if (gate.mode === "unavailable" || (gate.mode === "production" && !normalizedParams.reservationId)) {
    return <ProductionUnavailable title="Paiement indisponible" description="Aucun paiement ne peut être présenté sans réservation réelle, coach vérifié et configuration de paiement active." />;
  }

  return <ReservationProofBoundary key={normalizedParams.reservationId ?? "none"} id={normalizedParams.reservationId}><PaiementLegacyPage params={normalizedParams} provider={process.env.PAYMENT_PROVIDER === "stripe" ? "stripe" : "local"} athleteEmail={session?.role==="sportif"?session.email:undefined} /></ReservationProofBoundary>;
}
