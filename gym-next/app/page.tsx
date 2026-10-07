import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";
import { isDemoFallbackAllowed } from "@/lib/runtime";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "GetYourMentor - Coaching sportif en ligne",
  description:
    "Trouvez un coach sportif, comparez les profils et réservez votre séance en ligne avec GetYourMentor.",
});

export default function HomePage() {
  return <HomePageClient allowDemoFallback={isDemoFallbackAllowed()} />;
}
