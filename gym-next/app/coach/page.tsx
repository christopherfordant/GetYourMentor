import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { ReserverSeanceLegacyPage } from "@/components/booking-legacy/ReserverSeanceLegacyPage";
import { buildCanonical, buildPageMetadata, getSportLabel } from "@/lib/seo";

type CoachPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: CoachPageProps): Promise<Metadata> {
  const params = await searchParams;
  const sportParam = params.sport;
  const cityParam = params.city;
  const coachParam = params.coach;
  const sport = Array.isArray(sportParam) ? sportParam[0] : sportParam;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;
  const coach = Array.isArray(coachParam) ? coachParam[0] : coachParam;
  const sportLabel = getSportLabel(sport);
  const title = coach ? `${coach} - coach ${sportLabel}` : `Fiche coach ${sportLabel}`;

  return {
    ...buildPageMetadata({
      title,
      description: coach
        ? `Consultez la fiche de ${coach}${city ? ` a ${city}` : ""}, ses disponibilites, sa note et ses informations de reservation.`
        : `Consultez une fiche coach, ses disponibilites, sa note et ses informations de reservation.`,
    }),
    alternates: {
      canonical: buildCanonical("/coach", { sport, city, coach }),
    },
  };
}

export default async function CoachPage({ searchParams }: CoachPageProps) {
  const params = await searchParams;
  const stylesheetPath = path.join(process.cwd(), "..", "prototype-site", "styles.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  const normalizedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  return (
    <ReserverSeanceLegacyPage
      legacyStyles={legacyStyles}
      params={normalizedParams}
      allowDemoFallback={process.env.GETYOURMENTOR_ALLOW_DEMO === "true"}
    />
  );
}
