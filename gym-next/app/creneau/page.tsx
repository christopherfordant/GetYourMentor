import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { ChoixCoachCreneauLegacyPage } from "@/components/reservation-legacy/ChoixCoachCreneauLegacyPage";
import { ProductionUnavailable } from "@/components/common/ProductionUnavailable";
import { getBookingGate } from "@/lib/booking-gates";
import { buildCanonical, buildPageMetadata } from "@/lib/seo";

type CreneauPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: CreneauPageProps): Promise<Metadata> {
  const params = await searchParams;
  const coachParam = params.coach;
  const sportParam = params.sport;
  const cityParam = params.city;
  const coach = Array.isArray(coachParam) ? coachParam[0] : coachParam;
  const sport = Array.isArray(sportParam) ? sportParam[0] : sportParam;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;

  return {
    ...buildPageMetadata({
      title: coach ? `Choix du creneau - ${coach}` : "Choix du creneau",
      description: "Choisissez un creneau disponible avant de confirmer votre reservation sur GetYourMentor.",
    }),
    alternates: {
      canonical: buildCanonical("/creneau", { sport, city, coach }),
    },
  };
}

export default async function CreneauPage({ searchParams }: CreneauPageProps) {
  const params = await searchParams;
  const stylesheetPath = path.join(process.cwd(), "..", "prototype-site", "styles.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  const normalizedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  const gate = await getBookingGate(normalizedParams.coach);
  if (gate.mode === "unavailable") {
    return <ProductionUnavailable title="Créneau indisponible" description="Ce calendrier sera affiché dès qu’un coach vérifié et ses disponibilités réelles seront configurés." />;
  }

  return <ChoixCoachCreneauLegacyPage legacyStyles={legacyStyles} params={normalizedParams} />;
}
