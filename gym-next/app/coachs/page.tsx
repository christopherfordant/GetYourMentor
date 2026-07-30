import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { SelectionCoachsLegacyPage } from "@/components/directory-legacy/SelectionCoachsLegacyPage";
import { buildCanonical, buildPageMetadata, getSportLabel } from "@/lib/seo";

type CoachsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: CoachsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const sportParam = params.sport;
  const cityParam = params.city;
  const sport = Array.isArray(sportParam) ? sportParam[0] : sportParam;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;
  const sportLabel = getSportLabel(sport);
  const title = city ? `Coachs ${sportLabel} a ${city}` : `Liste des coachs ${sportLabel}`;

  return {
    ...buildPageMetadata({
      title,
      description: city
        ? `Consultez les coachs de ${sportLabel} disponibles a ${city}, comparez les profils et ouvrez la fiche detaillee.`
        : `Consultez les coachs de ${sportLabel} disponibles sur GetYourMentor.`,
    }),
    alternates: {
      canonical: buildCanonical("/coachs", { sport, city }),
    },
  };
}

export default async function CoachsPage({ searchParams }: CoachsPageProps) {
  const params = await searchParams;
  const stylesheetPath = path.join(process.cwd(), "..", "prototype-site", "styles.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  const sportParam = params.sport;
  const cityParam = params.city;

  const sport = Array.isArray(sportParam) ? sportParam[0] : sportParam;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;

  return <SelectionCoachsLegacyPage legacyStyles={legacyStyles} sport={sport} city={city} />;
}
