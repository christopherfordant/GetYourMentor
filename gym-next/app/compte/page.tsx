import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { AccountLegacyPage } from "@/components/account-legacy/AccountLegacyPage";
import { buildCanonical, buildPageMetadata } from "@/lib/seo";

type ComptePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: ComptePageProps): Promise<Metadata> {
  const params = await searchParams;
  const modeParam = params.mode;
  const mode = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  const title =
    mode === "coach"
      ? "Compte coach"
      : mode === "club"
        ? "Compte club"
        : "Mon compte";

  return {
    ...buildPageMetadata({
      title,
      description: "Connectez-vous ou accedez a votre espace GetYourMentor selon votre profil sportif, coach ou club.",
    }),
    alternates: {
      canonical: buildCanonical("/compte", { mode }),
    },
  };
}

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
