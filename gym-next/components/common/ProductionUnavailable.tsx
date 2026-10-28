import Link from "next/link";
import { PlatformHeader } from "@/components/navigation/PlatformHeader";
import { SiteFooter } from "@/components/SiteFooter";

type ProductionUnavailableProps = { title: string; description: string };

export function ProductionUnavailable({ title, description }: ProductionUnavailableProps) {
  return <div className="site-shell"><PlatformHeader /><main className="factory-unavailable"><section>
    <p>GetYourMentor</p><h1>{title}</h1><p>{description}</p>
    <Link href="/recherche">Revenir à la recherche</Link>
  </section></main><SiteFooter /></div>;
}
