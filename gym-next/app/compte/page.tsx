import fs from "node:fs";
import path from "node:path";
import { AccountLegacyPage } from "@/components/account-legacy/AccountLegacyPage";

type ComptePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComptePage({ searchParams }: ComptePageProps) {
  const params = await searchParams;
  const stylesheetPath = path.join(process.cwd(), "..", "prototype-site", "styles.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  const normalizedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  return <AccountLegacyPage legacyStyles={legacyStyles} params={normalizedParams} />;
}
