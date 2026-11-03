import { discoverySports } from '@/lib/sports-catalogue';
import Link from "next/link";
import { LanguageSelector } from "./common/LanguageSelector";
import { FooterUtilitySlot } from "./FooterUtilities";
import { SocialLinks } from "./SocialLinks";
import styles from './footer-disciplines.module.css';

export function SiteFooter() {
  return <footer className="gym-footer">
    <FooterUtilitySlot />
    <div className="gym-footer-brand"><Link href="/" aria-label="GetYourMentor, accueil"><b>GYM<span aria-hidden="true">↗</span></b><span>GetYourMentor</span></Link><SocialLinks /><LanguageSelector placement="footer" /></div>
    <div className="gym-footer-links">
      <FooterColumn title="Plateforme" links={[["Comment ça marche","/#espace"],["Devenir coach","/compte?mode=coach"],["Tarifs","/#forfaits"],["Entreprises","/inscription-club"]]} />
      <DisciplinesColumn />
      <FooterColumn title="Support" links={[["FAQ","/#faq"],["Accessibilité","/legal/accessibilite"],["Cookies","/legal/cookies"],["Plan du site","/plan-du-site"]]} />
      <FooterColumn title="Légal" links={[["CGU","/legal/cgu"],["CGV","/legal/cgv"],["Confidentialité","/legal/confidentialite"],["Mentions légales et contact","/legal/mentions-legales"]]} />
    </div>
    <small className="gym-footer-bottom">© 2026 GetYourMentor · Démo non commerciale.</small>
  </footer>;
}

function FooterColumn({title,links}:{title:string;links:Array<[string,string]>}) {
  return <nav className="gym-footer-column" aria-label={title}><h2>{title}</h2>{links.map(([label,href]) => <Link key={label} href={href} >{label}</Link>)}</nav>;
}

function DisciplinesColumn() {
  const first = discoverySports.slice(0,4);
  const remaining = discoverySports.slice(4);
  const links = (sports: typeof first) => sports.map(([slug,label])=><Link key={slug} href={`/recherche?sport=${slug}`}>{label}</Link>);
  return <nav className={`gym-footer-column ${styles.disciplines}`} aria-label="Disciplines"><h2 className={remaining.length ? styles.heading : undefined}>Disciplines</h2>{links(first)}
    {remaining.length > 0 && <details className={styles.more}><summary aria-label={`Disciplines : autres sports (${remaining.length})`} title="Afficher ou masquer les autres disciplines"><span className={styles.toggleTitle} aria-hidden="true">Disciplines</span><svg className={styles.chevron} width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></summary><div className={styles.remaining}>{links(remaining)}</div></details>}
  </nav>;
}
