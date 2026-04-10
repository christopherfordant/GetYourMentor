"use client";

import { nextRoutes } from "@/lib/next-routes";

type InscriptionClubLegacyPageProps = {
  legacyStyles: string;
  params: Record<string, string | undefined>;
};

function ClubSignupHeader() {
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
        <a className="account-button" href={nextRoutes.account}>
          <span className="account-button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span>Mon compte</span>
        </a>
      </div>
    </header>
  );
}

function ClubSignupVisual() {
  return (
    <section className="club-signup-visual" aria-label="Identite GYM">
      <div className="club-signup-logo-frame">
        <img src="/design_assets/logo-getyourmentor-signup.png" alt="Logo GYM GetYourMentor" />
      </div>
    </section>
  );
}

function ClubSignupForm() {
  return (
    <section className="club-signup-form-panel">
      <div className="club-signup-form-card">
        <div className="club-signup-grid">
          <label className="auth-field">
            <span>* Nom du club / structure</span>
            <input type="text" placeholder="Nom du club / structure" />
          </label>

          <label className="auth-field">
            <span>* Nom du responsable</span>
            <input type="text" placeholder="Nom du responsable" />
          </label>

          <label className="auth-field club-signup-grid-wide">
            <span>* Adresse mail</span>
            <input type="email" placeholder="Adresse mail" />
          </label>

          <label className="auth-field">
            <span>Numero de telephone</span>
            <input type="tel" placeholder="Numero de telephone" />
          </label>
        </div>

        <label className="auth-field club-signup-upload">
          <span>Logo du club / structure</span>
          <div className="club-signup-dropzone">Deposez un fichier</div>
        </label>

        <label className="auth-field club-signup-upload">
          <span>Piece d&apos;identite</span>
          <div className="club-signup-dropzone">Fournir un document telechargeable</div>
        </label>

        <label className="auth-field">
          <span>Iban</span>
          <input className="club-signup-iban" type="text" placeholder="FR76" defaultValue="FR76" />
        </label>

        <div className="club-signup-actions">
          <a className="auth-primary club-signup-submit" href={`${nextRoutes.account}?mode=club&connected=1`}>Affiliez des coachs</a>
        </div>
      </div>
    </section>
  );
}

export function InscriptionClubLegacyPage({ legacyStyles }: InscriptionClubLegacyPageProps) {
  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell club-signup-shell">
        <ClubSignupHeader />

        <main className="club-signup-page">
          <ClubSignupVisual />
          <ClubSignupForm />
        </main>
      </div>
    </>
  );
}
