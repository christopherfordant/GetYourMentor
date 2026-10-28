import { PlatformHeader } from "@/components/navigation/PlatformHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return <div className="site-shell"><PlatformHeader /><main className="factory-unavailable"><section>
    <p>Erreur 404</p><h1>Cette page est introuvable</h1>
    <p>Le lien a peut-être changé. Retrouve les mentors et les disciplines depuis la recherche.</p>
    <a href="/recherche">Revenir à la recherche</a>
  </section></main><SiteFooter /></div>;
}
