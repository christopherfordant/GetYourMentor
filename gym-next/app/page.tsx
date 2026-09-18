import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";
import { isDemoFallbackAllowed } from "@/lib/runtime";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Accueil coaching sportif",
  description:
    "Plateforme web de coaching sportif pour trouver un coach, comparer les profils et reserver une seance en ligne.",
});

export default function HomePage() {
  return <HomePageClient allowDemoFallback={isDemoFallbackAllowed()} />;
}
