import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { RechercheCoachLegacyPage } from "@/components/search-legacy/RechercheCoachLegacyPage";
import { buildCanonical, buildPageMetadata, getSportLabel } from "@/lib/seo";

type RecherchePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: RecherchePageProps): Promise<Metadata> {
  const params = await searchParams;
  const sportParam = params.sport;
  const cityParam = params.city;
  const sport = Array.isArray(sportParam) ? sportParam[0] : sportParam;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;
  const sportLabel = getSportLabel(sport);
  const title = city ? `Recherche coach ${sportLabel} a ${city}` : `Recherche coach ${sportLabel}`;

  return {
    ...buildPageMetadata({
      title,
      description: city
        ? `Trouvez un coach de ${sportLabel} a ${city} avec une recherche simple et un acces direct aux profils.`
        : `Trouvez un coach de ${sportLabel} avec les filtres essentiels du MVP GetYourMentor.`,
    }),
    alternates: {
      canonical: buildCanonical("/recherche", { sport, city }),
    },
  };
}

export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const params = await searchParams;
  const stylesheetPath = path.join(process.cwd(), "..", "prototype-site", "styles.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  const sportParam = params.sport;
  const sport = Array.isArray(sportParam) ? sportParam[0] : sportParam;
  const cityParam = params.city;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;

  return <RechercheCoachLegacyPage legacyStyles={legacyStyles} sport={sport} city={city} />;
}
