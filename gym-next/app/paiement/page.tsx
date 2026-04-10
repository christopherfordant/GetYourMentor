import fs from "node:fs";
import path from "node:path";
import { PaiementLegacyPage } from "@/components/payment-legacy/PaiementLegacyPage";

type PaiementPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaiementPage({ searchParams }: PaiementPageProps) {
  const params = await searchParams;
  const stylesheetPath = path.join(process.cwd(), "..", "prototype-site", "styles.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  const normalizedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  return <PaiementLegacyPage legacyStyles={legacyStyles} params={normalizedParams} />;
}
