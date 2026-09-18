import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { AccountLegacyPage } from "@/components/account-legacy/AccountLegacyPage";
import { currentSession } from "@/lib/auth";
import { isDemoFallbackAllowed } from "@/lib/runtime";
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
  const stylesheetPath = path.join(process.cwd(), "app", "legacy-prototype.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  const normalizedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const session = await currentSession();
  if (session) {
    normalizedParams.connected = "1";
    if (session.coachId) normalizedParams.coachId = session.coachId;
    if (!normalizedParams.mode && session.role !== "sportif") normalizedParams.mode = session.role;
  }

  return <AccountLegacyPage legacyStyles={legacyStyles} params={normalizedParams} allowDemoFallback={isDemoFallbackAllowed()} />;
}
