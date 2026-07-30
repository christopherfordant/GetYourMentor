import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { AccueilLegacyPage } from "@/components/home-legacy/AccueilLegacyPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Accueil coaching sportif",
  description:
    "Plateforme web de coaching sportif pour trouver un coach, comparer les profils et reserver une seance en ligne.",
});

export default function HomePage() {
  const stylesheetPath = path.join(process.cwd(), "..", "prototype-site", "styles.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  return <AccueilLegacyPage legacyStyles={legacyStyles} />;
}
