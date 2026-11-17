import type { Metadata } from "next";
import { EditorialHome } from "@/components/home/EditorialHome";
import { isDemoRecruiterEntryEnabled } from "@/lib/demo-recruiter-session";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "GetYourMentor - Coaching sportif en ligne",
  description:
    "Trouvez un coach sportif, comparez les profils et réservez votre séance en ligne avec GetYourMentor.",
});

export default function HomePage() {
  return <EditorialHome recruiterDemoAvailable={isDemoRecruiterEntryEnabled()} />;
}
