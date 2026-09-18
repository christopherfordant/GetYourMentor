import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { RecapitulatifReservationLegacyPage } from "@/components/reservation-legacy/RecapitulatifReservationLegacyPage";
import { ProductionUnavailable } from "@/components/common/ProductionUnavailable";
import { getBookingGate } from "@/lib/booking-gates";
import { buildCanonical, buildPageMetadata } from "@/lib/seo";

type RecapitulatifPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: RecapitulatifPageProps): Promise<Metadata> {
  const params = await searchParams;
  const coachParam = params.coach;
  const sportParam = params.sport;
  const cityParam = params.city;
  const coach = Array.isArray(coachParam) ? coachParam[0] : coachParam;
  const sport = Array.isArray(sportParam) ? sportParam[0] : sportParam;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;

  return {
    ...buildPageMetadata({
      title: coach ? `Recapitulatif - ${coach}` : "Recapitulatif de reservation",
      description: "Verifiez les informations de la reservation avant de poursuivre vers le compte et le paiement.",
    }),
    alternates: {
      canonical: buildCanonical("/recapitulatif", { sport, city, coach }),
    },
  };
}

export default async function RecapitulatifPage({ searchParams }: RecapitulatifPageProps) {
  const params = await searchParams;
  const stylesheetPath = path.join(process.cwd(), "app", "legacy-prototype.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  const normalizedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  const gate = await getBookingGate(normalizedParams.coach);
  if (gate.mode === "unavailable" || (gate.mode === "production" && !normalizedParams.reservationId)) {
    return <ProductionUnavailable title="Récapitulatif indisponible" description="Le récapitulatif sera généré à partir d’une demande de réservation réelle et validée par un coach vérifié." />;
  }

  return <RecapitulatifReservationLegacyPage legacyStyles={legacyStyles} params={normalizedParams} />;
}
