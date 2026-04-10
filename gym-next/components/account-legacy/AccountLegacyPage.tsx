"use client";

import { useMemo, useState } from "react";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";

type AccountLegacyPageProps = {
  legacyStyles: string;
  params: Record<string, string | undefined>;
};

type StepName = "signin" | "role" | "create";
type DashboardMode = "coach" | "club" | null;

const coachSessions = [
  {
    name: "Vazquez Eliott",
    age: "19 ans",
    club: "Sans club",
    objective: "Objectif : perfectionnement dribble",
    location: "Lieu : Gymnase de la Paix",
    slot: "18h - 19h",
    date: "05/04",
    href: buildNextPath(nextRoutes.coach, { sport: "basketball", city: "Lyon", coach: "Steven Fordant" }),
  },
  {
    name: "Fordant Christopher",
    age: "22 ans",
    club: "Club Horizon",
    objective: "Objectif : reprise et coordination",
    location: "Lieu : Stade des Docks",
    slot: "19h - 20h",
    date: "06/04",
    href: buildNextPath(nextRoutes.coach, { sport: "football", city: "Marseille", coach: "Steven Fordant" }),
  },
  {
    name: "Seck Madison",
    age: "24 ans",
    club: "Sans club",
    objective: "Objectif : gainage et remise en forme",
    location: "Lieu : Studio Centre Ville",
    slot: "20h - 21h",
    date: "07/04",
    href: buildNextPath(nextRoutes.coach, { sport: "metiers-de-la-forme", city: "Lille", coach: "Steven Fordant" }),
  },
];

function AccountHeader() {
  return (
    <header className="topbar topbar-light">
      <div className="brand-lockup">
        <a className="brand-name brand-link" href={nextRoutes.home}>GetYourMentor</a>
      </div>
      <nav className="sports-nav" aria-label="Sports">
        <a className="sport-link" href={`${nextRoutes.search}?sport=football`}>Football</a>
        <a className="sport-link" href={`${nextRoutes.search}?sport=basketball`}>Basketball</a>
        <a className="sport-link" href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>Metiers de la forme</a>
        <a className="sport-link" href={`${nextRoutes.search}?sport=sports-de-combat`}>Sports de combat</a>
      </nav>
      <div className="topbar-actions">
        <a className="topbar-link" href={`${nextRoutes.account}?mode=coach`}>Je suis un professionnel du sport</a>
        <div className="account-topbar-menu">
          <a className="account-button" href={nextRoutes.account} aria-current="page">
            <span className="account-button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span>Mon compte</span>
          </a>
          <button className="account-display-toggle" type="button" data-coach-display-toggle hidden aria-expanded="false" aria-controls="coach-display-menu">
            <span>Choisir l'accueil</span>
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="account-display-menu" id="coach-display-menu" data-coach-display-menu hidden>
            <label><input type="checkbox" data-coach-display-target="next-session" defaultChecked /> Prochaines seances</label>
            <label><input type="checkbox" data-coach-display-target="rating" defaultChecked /> Ma note / Mes avis</label>
            <label><input type="checkbox" data-coach-display-target="revenue" defaultChecked /> Revenus ce mois-ci</label>
          </div>
        </div>
      </div>
    </header>
  );
}

function AccountAuthShell({
  step,
  status,
  passwordVisible,
  onTogglePassword,
  onSubmitSignIn,
  onOpenSignup,
  onBack,
  onChooseRole,
  onSubmitCreate,
}: {
  step: StepName;
  status: string;
  passwordVisible: boolean;
  onTogglePassword: () => void;
  onSubmitSignIn: () => void;
  onOpenSignup: () => void;
  onBack: (step: StepName) => void;
  onChooseRole: (role: "sportif" | "coach" | "club") => void;
  onSubmitCreate: () => void;
}) {
  return (
    <div className="account-auth-stage" data-account-auth-shell>
      <div className={`auth-modal-step${step === "signin" ? " is-active" : ""}`} data-account-step="signin" hidden={step !== "signin"}>
        <div className="auth-card auth-card-compact">
          <h1 data-account-title>S'identifier</h1>
          <p className="auth-subtitle" data-account-subtitle>Connectez-vous pour retrouver votre espace ou poursuivre votre inscription.</p>
          <p className="auth-status-message" data-account-status hidden={!status}>{status}</p>
          <form className="auth-form" data-account-form onSubmit={(event) => { event.preventDefault(); onSubmitSignIn(); }}>
            <label className="auth-field"><span>Identifiant</span><input id="account-email" type="email" placeholder="Adresse mail" /></label>
            <label className="auth-field">
              <span>Mot de passe</span>
              <div className="password-field">
                <input id="account-password" type={passwordVisible ? "text" : "password"} placeholder="Mot de passe" />
                <button className={`password-toggle${passwordVisible ? " is-visible" : ""}`} type="button" aria-controls="account-password" aria-label={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={passwordVisible ? "true" : "false"} onClick={onTogglePassword}>
                  <span className="eye-open" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></span>
                  <span className="eye-closed" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M4 4 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></span>
                </button>
              </div>
            </label>
            <a className="auth-link" href={nextRoutes.account} data-account-forgot>Mot de passe oublié ?</a>
            <button className="auth-primary" type="submit" data-account-login>Se connecter</button>
          </form>
          <button className="auth-pill-button" type="button">Se connecter avec Gmail</button>
          <button className="auth-pill-button auth-pill-button-light" type="button" data-account-signup onClick={onOpenSignup}>Nouveau ? Inscription</button>
        </div>
      </div>
      <div className={`auth-modal-step${step === "role" ? " is-active" : ""}`} data-account-step="role" hidden={step !== "role"}>
        <div className="auth-card auth-card-wide">
          <h1>Vous êtes :</h1>
          <div className="auth-role-grid">
            <button className="auth-role-card" type="button" data-account-role="sportif" onClick={() => onChooseRole("sportif")}><strong>Un(e) sportif(ve)</strong></button>
            <div className="auth-role-separator">ou</div>
            <button className="auth-role-card" type="button" data-account-role="coach" onClick={() => onChooseRole("coach")}><strong>Un(e) coach</strong></button>
            <div className="auth-role-separator">ou</div>
            <button className="auth-role-card auth-role-card-detail" type="button" data-account-role="club" onClick={() => onChooseRole("club")}><strong>Association sportive<br />Club<br />Structure</strong></button>
          </div>
          <div className="auth-step-actions"><button className="auth-inline-button" type="button" data-account-back="signin" onClick={() => onBack("signin")}>Retour</button></div>
        </div>
      </div>
      <div className={`auth-modal-step${step === "create" ? " is-active" : ""}`} data-account-step="create" hidden={step !== "create"}>
        <div className="auth-card auth-card-compact">
          <h1>Renseignez votre adresse mail :</h1>
          <form className="auth-form" data-account-create-form onSubmit={(event) => { event.preventDefault(); onSubmitCreate(); }}>
            <label className="auth-field"><span>Adresse mail</span><input type="email" placeholder="Adresse mail" /></label>
            <label className="auth-field"><span>Confirmation de l'adresse mail</span><input type="email" placeholder="Confirmez l'adresse mail" /></label>
            <label className="auth-field"><span>Créez votre mot de passe</span><input type="password" placeholder="Mot de passe" /></label>
            <label className="auth-field"><span>Confirmez votre mot de passe</span><input type="password" placeholder="Confirmation du mot de passe" /></label>
            <button className="auth-primary" type="submit">Continuer</button>
          </form>
          <button className="auth-pill-button" type="button">Connectez-vous avec Google</button>
          <div className="auth-step-actions"><button className="auth-inline-button" type="button" data-account-back="signin" onClick={() => onBack("signin")}>Retour</button></div>
        </div>
      </div>
    </div>
  );
}

function CoachDashboard({ coachName, sessionIndex, onNextSession }: { coachName: string; sessionIndex: number; onNextSession: () => void }) {
  const session = coachSessions[sessionIndex];
  return (
    <section className="account-dashboard coach-home" data-account-dashboard="coach">
      <aside className="coach-home-sidebar">
        <button className="coach-home-nav-main is-active" type="button">Accueil</button>
        <div className="coach-home-nav-group"><div className="coach-home-nav-heading">Organisation</div><a href="#coach-planning">Planning</a><a href="#coach-messages">Messagerie</a><a href="#coach-contents">Mes contenus</a><a href="#coach-templates">Mes templates</a><a href="#coach-athletes">Mes sportifs</a></div>
        <div className="coach-home-nav-group"><div className="coach-home-nav-heading">Mes données</div><a href="#coach-dashboard">Tableau de bord</a><a href="#coach-payments">Mes paiements</a><a href="#coach-rib">Mon RIB</a><a href="#coach-subscription">Mon abonnement</a><a href="#coach-bills">Mes factures</a></div>
        <div className="coach-home-nav-footer"><a href="#coach-invitations">Invitation</a><a href="#coach-help">Conseils et aides</a><a href={nextRoutes.home}>Déconnexion</a></div>
      </aside>
      <section className="coach-home-planning account-dashboard-card" id="coach-planning">
        <div className="coach-home-card-head"><h3>Mon planning</h3><span>Aujourd'hui</span></div>
        <div className="coach-home-day-switch"><button type="button" aria-label="Jour précédent">‹</button><strong>Aujourd'hui</strong><button type="button" aria-label="Jour suivant">›</button></div>
        <div className="coach-home-schedule">
          <article><strong>18h - 19h</strong><span>Vazquez Eliott</span><a href={buildNextPath(nextRoutes.coach, { sport: "football", city: "Marseille", coach: coachName })}>Voir fiche</a></article>
          <article><strong>19h - 20h</strong><span>Fordant Christopher</span><a href={buildNextPath(nextRoutes.coach, { sport: "metiers-de-la-forme", city: "Lille", coach: coachName })}>Voir fiche</a></article>
          <article><strong>20h - 21h</strong><span>Creneau disponible</span><a href={buildNextPath(nextRoutes.coach, { sport: "football", city: "Paris", coach: coachName })}>Ouvrir</a></article>
          <article><strong>21h - 22h</strong><span>Fordant Sélyan</span><a href={buildNextPath(nextRoutes.coach, { sport: "football", city: "Lyon", coach: coachName })}>Voir fiche</a></article>
        </div>
      </section>
      <div className="coach-home-focus">
        <article className="account-dashboard-card coach-home-next-session" id="coach-dashboard" data-coach-display-block="next-session"><div className="coach-home-card-head"><h3>Prochaines séances</h3><div className="coach-home-next-head-actions"><span>{session.date}</span><button className="coach-home-next-arrow" type="button" aria-label="Séance suivante" onClick={onNextSession}>›</button></div></div><div className="coach-home-next-copy coach-home-next-copy--plain"><strong>{session.name}</strong><span>{session.age}</span><span>{session.club}</span><span>{session.objective}</span><span>{session.location}</span><span>{session.slot}</span></div><a className="coach-home-inline-link" href={session.href}>Voir fiche sportive</a></article>
        <article className="account-dashboard-card coach-home-rating" data-coach-display-block="rating"><div className="coach-home-mini-tabs"><span className="is-active">Ma note</span><span>Mes avis</span></div><div className="coach-home-rating-score">4,1 / 5</div><p>Note globale sur la pédagogie, la qualité de suivi et la clarté des séances.</p></article>
        <article className="account-dashboard-card coach-home-revenue" id="coach-payments" data-coach-display-block="revenue"><div className="coach-home-card-head"><h3>Revenus ce mois-ci</h3><span>Mars</span></div><div className="coach-home-revenue-amount">450 EUR</div><p>Montant validé sur les réservations confirmées et les séances réalisées.</p></article>
        <article className="account-dashboard-card coach-home-profile-preview" data-coach-display-block="profile-preview"><div className="coach-home-card-head"><h3>Aperçu de mon profil</h3><span>Vue élève</span></div><div className="coach-home-profile-preview-head"><strong>{coachName}</strong><span>Coach vérifié - remise en forme</span></div><div className="coach-home-profile-preview-grid"><div><span>Zone</span><strong>Lille centre</strong></div><div><span>Formats</span><strong>Individuel, duo, visio</strong></div><div><span>Tarif d'appel</span><strong>39 EUR / séance</strong></div><div><span>Disponibilité</span><strong>Prochain créneau : jeudi 18h</strong></div></div><p className="coach-home-profile-preview-copy">L'élève voit ici les informations essentielles avant de cliquer : zone, formats de séance, premier prix, disponibilité et niveau de confiance.</p></article>
        <div className="coach-home-standalone-cta"><a className="coach-home-inline-link coach-home-inline-link--ghost coach-home-inline-link-prominent" href={buildNextPath(nextRoutes.coach, { sport: "metiers-de-la-forme", city: "Lille", coach: coachName })}>Voir mon profil en ligne</a></div>
      </div>
      <section className="account-dashboard-card coach-home-messages" id="coach-messages"><div className="coach-home-card-head"><h3>Messagerie</h3><span>4 conversations</span></div><div className="coach-home-message-list"><article><strong>Fordant Steven</strong><span>Question sur la prochaine séance et la disponibilité du terrain.</span></article><article><strong>Fordant Christopher</strong><span>Demande d'ajustement d'horaire pour la session de demain.</span></article><article><strong>Vazquez Eliott</strong><span>Confirmation de présence et besoin de conseils avant la séance.</span></article><article><strong>Seck Madison</strong><span>Retour sur les contenus premium et demande d'accès au planning.</span></article></div></section>
    </section>
  );
}

function ClubDashboard() {
  return (
    <section className="account-dashboard coach-home club-home" data-account-dashboard="club">
      <aside className="coach-home-sidebar club-home-sidebar">
        <button className="coach-home-nav-main is-active" type="button">Accueil</button>
        <div className="coach-home-nav-group"><div className="coach-home-nav-heading">Organisation</div><a href="#club-planning">Planning du club</a><a href="#club-messages">Messagerie</a><a href="#club-coaches">Mes coachs affiliés</a><a href="#club-contents">Mes contenus</a><a href="#club-templates">Mes templates</a></div>
        <div className="coach-home-nav-group"><div className="coach-home-nav-heading">Mes données</div><a href="#club-overview">Tableau de bord</a><a href="#club-payments">Mes paiements</a><a href="#club-rib">Mon RIB</a><a href="#club-subscription">Mon abonnement</a><a href="#club-bills">Mes factures</a></div>
        <div className="coach-home-nav-footer"><a href="#club-help">Conseils et aides</a><a href={nextRoutes.home}>Déconnexion</a></div>
      </aside>
      <section className="coach-home-planning account-dashboard-card club-home-planning" id="club-planning">
        <div className="coach-home-card-head"><h3>Planning du club</h3><span>Aujourd'hui</span></div>
        <div className="coach-home-day-switch"><button type="button" aria-label="Jour précédent">‹</button><strong>Aujourd'hui</strong><button type="button" aria-label="Jour suivant">›</button></div>
        <div className="coach-home-schedule">
          <article><strong>18h - 19h</strong><span>Steven Fordant - groupe U17</span><a href={buildNextPath(nextRoutes.coach, { sport: "football", city: "Marseille", coach: "Steven Fordant" })}>Voir fiche</a></article>
          <article><strong>19h - 20h</strong><span>Kenza Training - séance cardio</span><a href={buildNextPath(nextRoutes.coach, { sport: "metiers-de-la-forme", city: "Lille", coach: "Kenza Training Club" })}>Voir fiche</a></article>
          <article><strong>20h - 21h</strong><span>Créneau libre pour un nouveau coach</span><a href={buildNextPath(nextRoutes.clubSignup, { source: "compte" })}>Gérer</a></article>
        </div>
      </section>
      <div className="coach-home-focus club-home-focus">
        <article className="account-dashboard-card coach-home-next-session club-home-next-session" id="club-overview" data-coach-display-block="next-session"><div className="coach-home-card-head"><h3>Prochaines séances</h3><div className="coach-home-next-head-actions"><span>05/04</span><button className="coach-home-next-arrow" type="button" aria-label="Séance suivante">›</button></div></div><div className="coach-home-next-copy coach-home-next-copy--plain"><strong>Steven Fordant</strong><span>Football - groupe U17</span><span>Responsable : Christopher Fordant</span><span>Lieu : Complexe sportif Marseille Est</span><span>18h - 19h</span></div><a className="coach-home-inline-link" href={buildNextPath(nextRoutes.coach, { sport: "football", city: "Marseille", coach: "Steven Fordant" })}>Voir la séance</a></article>
        <article className="account-dashboard-card club-home-summary-card" data-coach-display-block="rating"><div className="coach-home-card-head"><h3>Mes coachs affiliés</h3><span>4 actifs</span></div><div className="club-home-stat-grid"><div><span>Coachs actifs</span><strong>4</strong></div><div><span>Séances ce mois</span><strong>28</strong></div><div><span>Structures suivies</span><strong>2</strong></div><div><span>Taux d'occupation</span><strong>81%</strong></div></div></article>
        <article className="account-dashboard-card coach-home-revenue club-home-revenue" id="club-payments" data-coach-display-block="revenue"><div className="coach-home-card-head"><h3>Revenus du club</h3><span>Mars</span></div><div className="coach-home-revenue-amount">2 450 EUR</div><p>Montant validé sur les séances facturées, les coachs affiliés et les encaissements confirmés du mois.</p></article>
        <article className="account-dashboard-card club-home-profile-preview"><div className="coach-home-card-head"><h3>Aperçu de la structure</h3><span>Vue publique</span></div><div className="coach-home-profile-preview-head"><strong>Club Horizon Marseille</strong><span>Football, préparation physique, accompagnement jeune</span></div><div className="club-home-preview-badges"><span>4 coachs certifiés</span><span>7 créneaux cette semaine</span><span>Dès 29 EUR</span></div><div className="coach-home-profile-preview-grid"><div><span>Disciplines</span><strong>Football, prépa physique, reprise</strong></div><div><span>Formats</span><strong>Individuel, petits groupes, stages</strong></div><div><span>Lieu</span><strong>Marseille Est, accès facile et parking</strong></div><div><span>Rythme</span><strong>Cours chaque semaine et planning visible</strong></div></div><p className="coach-home-profile-preview-copy">Comme sur les sites de forme, l'idée est de montrer tout de suite ce qu'on pratique, avec qui, à quel rythme et à partir de quel niveau de prix.</p><div className="club-home-preview-actions"><a className="coach-home-inline-link" href={`${nextRoutes.search}?sport=football&city=Marseille`}>Voir le club en ligne</a><a className="coach-home-inline-link coach-home-inline-link--ghost" href={`${nextRoutes.search}?sport=football&city=Marseille`}>Voir les coachs affiliés</a></div></article>
      </div>
      <section className="account-dashboard-card coach-home-messages club-home-messages" id="club-messages"><div className="coach-home-card-head"><h3>Messagerie</h3><span>5 conversations</span></div><div className="coach-home-message-list"><article><strong>Steven Fordant</strong><span>Demande de validation pour le créneau U17 de jeudi soir.</span></article><article><strong>Madison Seck</strong><span>Question sur l'affiliation d'un nouveau coach pour la structure.</span></article><article><strong>Parent - Eliott Vazquez</strong><span>Besoin d'informations sur les séances et les disponibilités du club.</span></article><article><strong>Christopher Fordant</strong><span>Suivi du paiement de mars et ajustement du RIB de la structure.</span></article></div></section>
    </section>
  );
}

function AccountFooter() {
  return (
    <footer className="account-footer">
      <div className="account-footer-grid">
        <div className="account-footer-brand"><div className="footer-brand">GETYOURMENTOR</div><div className="account-socials" aria-label="Réseaux sociaux"><a href="#instagram" aria-label="Instagram">IG</a><a href="#facebook" aria-label="Facebook">FB</a></div></div>
        <div className="account-footer-column"><h3>À propos de GetYourMentor</h3><a href={`${nextRoutes.account}?mode=coach`}>Je suis un professionnel du sport</a><a href={`${nextRoutes.account}?mode=coach`}>Rejoignez-nous</a><a href={`${nextRoutes.home}#faq-title`}>CGU</a><a href={`${nextRoutes.home}#faq-title`}>Politique de confidentialité</a><a href={`${nextRoutes.home}#faq-title`}>Gestion des cookies</a><a href={`${nextRoutes.home}#faq-title`}>Accessibilité</a></div>
        <div className="account-footer-column"><h3>Trouvez votre coach</h3><a href={`${nextRoutes.search}?sport=football`}>Football</a><a href={`${nextRoutes.search}?sport=basketball`}>Basketball</a><a href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>Fitness</a><a href={`${nextRoutes.search}?sport=sports-de-combat`}>Sports de combat</a><a href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>Coaching en visio</a><a href={`${nextRoutes.search}?sport=football`}>Coaching en présentiel</a></div>
        <div className="account-footer-column"><h3>Recherches fréquentes</h3><a href={`${nextRoutes.directory}?sport=football&city=Paris`}>Coach sportif Paris</a><a href={`${nextRoutes.directory}?sport=metiers-de-la-forme&city=Marseille`}>Coach sportif Marseille</a><a href={`${nextRoutes.directory}?sport=basketball&city=Lyon`}>Coach sportif Lyon</a><a href={`${nextRoutes.directory}?sport=metiers-de-la-forme&city=Lille`}>Coach fitness Lille</a></div>
      </div>
      <div className="account-footer-bottom">Copyright &copy; 2026 GetYourMentor</div>
    </footer>
  );
}

export function AccountLegacyPage({ legacyStyles, params }: AccountLegacyPageProps) {
  const mode = params.mode;
  const redirect = params.redirect;
  const isCoachMode = mode === "coach";
  const isClubMode = mode === "club";
  const [step, setStep] = useState<StepName>("signin");
  const [status, setStatus] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>(
    params.connected === "1" && redirect !== "paiement" ? (isClubMode ? "club" : isCoachMode ? "coach" : null) : null,
  );
  const [sessionIndex, setSessionIndex] = useState(0);

  const paymentTarget = useMemo(
    () =>
      buildNextPath(nextRoutes.payment, {
        sport: params.sport,
        city: params.city,
        coach: params.coach,
        service: params.service,
        duration: params.duration,
        price: params.price,
        slot: params.slot,
        mentor: params.mentor,
        connected: "1",
      }),
    [params],
  );

  const coachName = params.coach || "Steven Fordant";
  const session = coachSessions[sessionIndex];

  const revealDashboard = (modeToShow: DashboardMode) => {
    if (!modeToShow) return;
    setStatus("");
    setStep("signin");
    setDashboardMode(modeToShow);
  };

  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell account-shell">
        <AccountHeader />
        <main className={`account-page${dashboardMode ? " is-coach-mode" : ""}`} data-account-page>
          <section className="account-panel">
            {!dashboardMode ? (
              <AccountAuthShell
                step={step}
                status={status}
                passwordVisible={passwordVisible}
                onTogglePassword={() => setPasswordVisible((current) => !current)}
                onSubmitSignIn={() => {
                  if (redirect === "paiement") {
                    window.location.href = paymentTarget;
                    return;
                  }
                  if (isCoachMode) {
                    revealDashboard("coach");
                    return;
                  }
                  if (isClubMode) {
                    revealDashboard("club");
                    return;
                  }
                  setStatus("Connexion simulee. Vous pouvez maintenant reprendre votre reservation ou naviguer dans le site.");
                }}
                onOpenSignup={() => {
                  if (redirect === "paiement") {
                    window.location.href = paymentTarget;
                    return;
                  }
                  setStep("create");
                }}
                onBack={setStep}
                onChooseRole={(role) => {
                  if (role === "club") {
                    window.location.href = buildNextPath(nextRoutes.clubSignup, { source: "compte" });
                    return;
                  }
                  setStep("create");
                }}
                onSubmitCreate={() => setStep("role")}
              />
            ) : null}
            {dashboardMode === "coach" ? <CoachDashboard coachName={coachName} sessionIndex={sessionIndex} onNextSession={() => setSessionIndex((current) => (current + 1) % coachSessions.length)} /> : null}
            {dashboardMode === "club" ? <ClubDashboard /> : null}
          </section>
        </main>
        <AccountFooter />
      </div>
    </>
  );
}
