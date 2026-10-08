import Link from "next/link";

function SocialIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return <a className="global-footer-social" href={`#${label.toLowerCase()}`} aria-label={label}>{children}</a>;
}

export function SiteFooter() {
  return (
    <footer className="global-footer">
      <div className="global-footer-main">
        <div className="global-footer-brand">
          <Link className="global-footer-logo" href="/" aria-label="GetYourMentor, accueil">
            <span className="global-footer-mark" aria-hidden="true">✣</span>
            <span>GetYour <strong>Mentor</strong></span>
          </Link>
          <p>La plateforme française qui connecte sportifs ambitieux et coachs certifiés. Progresse à ton rythme.</p>
          <div className="global-footer-socials" aria-label="Réseaux sociaux">
            <SocialIcon label="Facebook">f</SocialIcon>
            <SocialIcon label="Instagram">◎</SocialIcon>
            <SocialIcon label="X">𝕏</SocialIcon>
            <SocialIcon label="YouTube">▶</SocialIcon>
          </div>
        </div>
        <FooterColumn title="Plateforme" links={[["Comment ça marche", "/#parcours"], ["Devenir coach", "/compte?mode=coach"], ["Tarifs", "/#tarifs"], ["Entreprises", "/inscription-club"]]} />
        <FooterColumn title="Disciplines" links={[["Football", "/recherche?sport=football"], ["Basketball", "/recherche?sport=basketball"], ["Fitness", "/recherche?sport=metiers-de-la-forme"], ["Sports de combat", "/recherche?sport=sports-de-combat"]]} />
        <FooterColumn title="Support" links={[["Centre d'aide", "/legal/accessibilite"], ["Contact", "mailto:contact@getyourmentor.fr"], ["FAQ", "/#faq"], ["Statut", "/api/health"]]} />
        <FooterColumn title="Légal" links={[["CGU", "/legal/cgu"], ["CGV", "/legal/cgv"], ["Confidentialité", "/legal/confidentialite"], ["Mentions légales", "/legal/mentions-legales"]]} />
      </div>
      <div className="global-footer-bottom">
        <small>© 2025 GetYourMentor. Démo non commerciale.</small>
        <a href="mailto:contact@getyourmentor.fr">contact@getyourmentor.fr</a>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return <nav className="global-footer-column" aria-label={title}><h2>{title}</h2>{links.map(([label, href]) => <Link key={label} href={href} aria-label={title === "Disciplines" ? `${label} dans le footer` : undefined}>{label}</Link>)}</nav>;
}
