"use client";

import { useMemo, useState } from "react";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";

type PaiementLegacyPageProps = {
  legacyStyles: string;
  params: Record<string, string | undefined>;
};

function PaymentHeader() {
  return (
    <header className="topbar topbar-light">
      <div className="brand-lockup">
        <a className="brand-name brand-link brand-name-dark" href={nextRoutes.home}>GetYourMentor</a>
      </div>

      <nav className="sports-nav sports-nav-dark" aria-label="Sports">
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=football`}>Football</a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=basketball`}>Basketball</a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>Metiers de la forme</a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=sports-de-combat`}>Sports de combat</a>
      </nav>

      <div className="topbar-actions">
        <a className="topbar-link topbar-link-dark" href={`${nextRoutes.account}?mode=coach`}>Je suis un professionnel du sport</a>
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

function PaymentMain({
  selectedMethod,
  onSelectMethod,
}: {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}) {
  return (
    <section className="payment-main">
      <div className="payment-intro">
        <p className="payment-kicker">Paiement securise</p>
        <h1>Finaliser votre reservation</h1>
        <p className="payment-subcopy">Choisissez votre mode de paiement pour confirmer votre seance GetYourMentor.</p>
        <div className="payment-intro-visual" aria-hidden="true">
          <div className="payment-intro-shot payment-intro-shot-main"></div>
          <div className="payment-intro-shot payment-intro-shot-secondary"></div>
          <div className="payment-intro-badge">Coach confirme</div>
        </div>
      </div>

      <section className="payment-card">
        <header className="payment-card-head">
          <h2>Moyen de paiement</h2>
          <p>Vous pouvez simuler les options les plus probables du tunnel.</p>
        </header>

        <div className="payment-methods">
          <button className={`payment-method${selectedMethod === "card" ? " is-active" : ""}`} type="button" data-method="card" onClick={() => onSelectMethod("card")}>
            <strong>Carte bancaire</strong>
            <span>Visa, Mastercard, CB</span>
          </button>
          <button className={`payment-method${selectedMethod === "apple-pay" ? " is-active" : ""}`} type="button" data-method="apple-pay" onClick={() => onSelectMethod("apple-pay")}>
            <strong>Apple Pay</strong>
            <span>Paiement rapide</span>
          </button>
          <button className={`payment-method${selectedMethod === "google-pay" ? " is-active" : ""}`} type="button" data-method="google-pay" onClick={() => onSelectMethod("google-pay")}>
            <strong>Google Pay</strong>
            <span>Validation instantanee</span>
          </button>
          <button className={`payment-method${selectedMethod === "onsite" ? " is-active" : ""}`} type="button" data-method="onsite" onClick={() => onSelectMethod("onsite")}>
            <strong>Sur place</strong>
            <span>Selon les conditions du coach</span>
          </button>
        </div>

        <div className="payment-form">
          <label className="payment-field">
            <span>Nom sur la carte</span>
            <input type="text" defaultValue="Client GetYourMentor" />
          </label>
          <label className="payment-field">
            <span>Numero de carte</span>
            <input type="text" defaultValue="4242 4242 4242 4242" />
          </label>
          <div className="payment-field-row">
            <label className="payment-field">
              <span>Expiration</span>
              <input type="text" defaultValue="12 / 28" />
            </label>
            <label className="payment-field">
              <span>CVC</span>
              <input type="text" defaultValue="123" />
            </label>
          </div>
          <label className="payment-checkbox">
            <input type="checkbox" defaultChecked />
            <span>J&apos;accepte les conditions de reservation du coach.</span>
          </label>
        </div>
      </section>
    </section>
  );
}

function PaymentSide({
  coach,
  city,
  service,
  duration,
  format,
  objective,
  packageLabel,
  slot,
  price,
  mentor,
  selectedMethod,
  success,
  onSubmit,
}: {
  coach: string;
  city: string;
  service: string;
  duration: string;
  format: string;
  objective: string;
  packageLabel: string;
  slot: string;
  price: string;
  mentor: string;
  selectedMethod: string;
  success: boolean;
  onSubmit: () => void;
}) {
  const summaryDuration = [duration, format, objective, packageLabel].filter(Boolean).join("  ");

  return (
    <aside className="payment-side">
      <section className="payment-summary-card">
        <div className="payment-summary-visual" aria-hidden="true"></div>
        <h2>Recapitulatif</h2>
        <div className="payment-summary-line">
          <span>Lieu / coach</span>
          <strong>{`${coach} - ${city}`}</strong>
        </div>
        <div className="payment-summary-line">
          <span>Seance</span>
          <strong>{service}</strong>
        </div>
        <div className="payment-summary-line">
          <span>Duree</span>
          <strong>{summaryDuration}</strong>
        </div>
        <div className="payment-summary-line">
          <span>Date</span>
          <strong>{`Vendredi 27 mars 2026  ${slot}`}</strong>
        </div>
        <div className="payment-summary-line">
          <span>Coach retenu</span>
          <strong>{mentor}</strong>
        </div>
        <div className="payment-summary-total">
          <span>Total</span>
          <strong>{price}</strong>
        </div>
        <button
          className="payment-submit"
          type="button"
          onClick={onSubmit}
        >
          {success ? (selectedMethod === "onsite" ? "Reservation enregistree" : "Paiement confirme") : "Payer et confirmer"}
        </button>
        <p className="payment-note">La confirmation finale est simulee dans cette maquette.</p>
      </section>

      <section className="payment-success-card" hidden={!success}>
        <h3>Reservation confirmee</h3>
        <p>Votre paiement est valide et votre seance est confirmee.</p>
        <div className="payment-success-actions">
          <a className="payment-secondary-link" href={nextRoutes.home}>Retour a l&apos;accueil</a>
          <a className="payment-primary-link" href={nextRoutes.account}>Voir mon compte</a>
        </div>
      </section>
    </aside>
  );
}

function PaymentFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">GETYOURMENTOR</div>
      <p>Trouvez votre coach sportif en quelques clics</p>
      <nav className="footer-links" aria-label="Liens legaux">
        <a href={`${nextRoutes.home}#faq-title`}>CGV</a>
        <a href={`${nextRoutes.home}#faq-title`}>CGU</a>
        <a href={`${nextRoutes.home}#faq-title`}>Politique de confidentialite</a>
        <a href={`${nextRoutes.home}#faq-title`}>Mentions legales</a>
      </nav>
      <small>&copy; 2026 GetYourMentor. Tous droits reserves.</small>
    </footer>
  );
}

export function PaiementLegacyPage({ legacyStyles, params }: PaiementLegacyPageProps) {
  const coach = params.coach || "Studio Form Marseille";
  const city = params.city || "Marseille";
  const service = params.service || "Coaching remise en forme";
  const duration = params.duration || "30min";
  const price = params.price || "35 ";
  const objective = params.objective || "";
  const format = params.format || "";
  const packageLabel = params.package || "";
  const slot = params.slot || "10:00";
  const mentor = params.mentor || "Coach confirme";
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [success, setSuccess] = useState(false);

  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell payment-shell">
        <PaymentHeader />

        <main className="payment-page" data-payment-page>
          <PaymentMain selectedMethod={selectedMethod} onSelectMethod={setSelectedMethod} />
          <PaymentSide
            coach={coach}
            city={city}
            service={service}
            duration={duration}
            format={format}
            objective={objective}
            packageLabel={packageLabel}
            slot={slot}
            price={price}
            mentor={mentor}
            selectedMethod={selectedMethod}
            success={success}
            onSubmit={() => setSuccess(true)}
          />
        </main>

        <PaymentFooter />
      </div>
    </>
  );
}
