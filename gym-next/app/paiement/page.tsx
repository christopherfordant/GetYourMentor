import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { PaiementLegacyPage } from "@/components/payment-legacy/PaiementLegacyPage";
import { buildCanonical, buildPageMetadata } from "@/lib/seo";

type PaiementPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PaiementPageProps): Promise<Metadata> {
  const params = await searchParams;
  const coachParam = params.coach;
  const sportParam = params.sport;
  const cityParam = params.city;
  const coach = Array.isArray(coachParam) ? coachParam[0] : coachParam;
  const sport = Array.isArray(sportParam) ? sportParam[0] : sportParam;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;

  return {
    ...buildPageMetadata({
      title: coach ? `Paiement - ${coach}` : "Paiement de la reservation",
      description: "Finalisez le paiement de votre reservation sportive sur GetYourMentor.",
    }),
    alternates: {
      canonical: buildCanonical("/paiement", { sport, city, coach }),
    },
  };
}

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
