import fs from "node:fs";
import path from "node:path";
import { SelectionCoachsLegacyPage } from "@/components/directory-legacy/SelectionCoachsLegacyPage";

type CoachsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
