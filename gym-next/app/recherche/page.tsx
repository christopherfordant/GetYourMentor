import fs from "node:fs";
import path from "node:path";
import { RechercheCoachLegacyPage } from "@/components/search-legacy/RechercheCoachLegacyPage";

type RecherchePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const params = await searchParams;
  const stylesheetPath = path.join(process.cwd(), "..", "prototype-site", "styles.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  const sportParam = params.sport;
  const sport = Array.isArray(sportParam) ? sportParam[0] : sportParam;

  return <RechercheCoachLegacyPage legacyStyles={legacyStyles} sport={sport} />;
}
