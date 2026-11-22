import DemoBooking from "@/components/demo/DemoBooking";
import { PlatformHeader } from "@/components/navigation/PlatformHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";
export const metadata = { title: "Parcours sportif de démonstration", robots: { index: false, follow: false } };

export default function DemoPage() {
  return (
    <div className="site-shell">
      <PlatformHeader demo />
      <DemoBooking />
      <SiteFooter />
    </div>
  );
}
