"use client";

import { useMemo } from "react";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";

type RecapitulatifReservationLegacyPageProps = {
  legacyStyles: string;
  params: Record<string, string | undefined>;
};

function RecapHeader() {
  return (
    <header className="topbar topbar-light">
      <div className="brand-lockup">
        <a className="brand-name brand-link brand-name-dark" href={nextRoutes.home}>
          GetYourMentor
        </a>
      </div>

      <nav className="sports-nav sports-nav-dark" aria-label="Sports">
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=football`}>
          Football
        </a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=basketball`}>
          Basketball
        </a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>
          Metiers de la forme
        </a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=sports-de-combat`}>
          Sports de combat
        </a>
      </nav>

      <div className="topbar-actions">
        <a className="topbar-link topbar-link-dark" href={`${nextRoutes.account}?mode=coach`}>
          Je suis un professionnel du sport
        </a>
        <a className="account-button" href={nextRoutes.account}>
          <span className="account-button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>Mon compte</span>
        </a>
      </div>
    </header>
  );
}

function RecapMainHeader({
  coach,
  city,
}: {
  coach: string;
  city: string;
}) {
  return (
    <section className="recap-header">
      <h1 data-recap-name>{coach}</h1>
      <div className="recap-address" data-recap-address>{`10 Rue du Sport, ${city}`}</div>
      <div className="recap-meta" data-recap-meta>4.9 (284 avis) • Coaching premium</div>
      <div className="recap-header-visual" aria-hidden="true">
        <div className="recap-header-shot recap-header-shot-main"></div>
        <div className="recap-header-shot recap-header-shot-side"></div>
      </div>
    </section>
  );
}

function RecapServicesSection({
  sport,
  city,
  coach,
  service,
  duration,
  price,
  objective,
  format,
  packageLabel,
  slot,
  mentor,
}: {
  sport: string;
  city: string;
  coach: string;
  service: string;
  duration: string;
  price: string;
  objective: string;
  format: string;
  packageLabel: string;
  slot: string;
  mentor: string;
}) {
  const removeHref = buildNextPath(nextRoutes.slot, {
    sport,
    city,
    coach,
    service,
    duration,
    price,
    objective,
    format,
    package: packageLabel,
    slot,
    mentor,
  });

  const modifyHref = buildNextPath(nextRoutes.coach, {
    sport,
    city,
    coach,
  });

  return (
    <section className="recap-step">
      <h2>
        <span>1.</span> Seances selectionnees
      </h2>
      <div className="recap-cards" data-recap-services>
        <article className="recap-service-card">
          <div className="recap-service-copy">
            <strong>{service}</strong>
            <div>{`${duration} • ${price} • avec ${mentor}`}</div>
            {sport === "metiers-de-la-forme" ? (
              <div>{[format, objective, packageLabel].filter(Boolean).join(" • ")}</div>
            ) : null}
          </div>
          <a className="recap-link" href={removeHref}>
            Supprimer
          </a>
        </article>
        <article className="recap-service-card">
          <div className="recap-service-copy">
            <strong>Bilan express avant seance</strong>
            <div>10min • inclus dans votre reservation</div>
          </div>
          <a className="recap-link" href={modifyHref}>
            Modifier
          </a>
        </article>
      </div>
    </section>
  );
}

function RecapDatetimeSection({
  editHref,
  slot,
}: {
  editHref: string;
  slot: string;
}) {
  return (
    <section className="recap-step">
      <h2>
        <span>2.</span> Date et heure selectionnees
      </h2>
      <div className="recap-date-card">
        <div data-recap-datetime>{`Vendredi 27 mars 2026 a ${slot}`}</div>
        <a href={editHref} className="recap-link" data-recap-edit>
          Modifier
        </a>
      </div>
    </section>
  );
}

function RecapAuthSection({
  accountRedirect,
}: {
  accountRedirect: string;
}) {
  return (
    <section className="recap-step">
      <h2>
        <span>3.</span> Identification
      </h2>
      <div className="recap-auth-card">
        <div className="recap-auth-block">
          <h3>Nouveau sur GetYourMentor ?</h3>
          <a className="recap-outline-button" href={accountRedirect} data-recap-create>
            Creer mon compte
          </a>
        </div>

        <div className="recap-divider">
          <span>ou</span>
        </div>

        <div className="recap-auth-block">
          <h3>Vous avez deja utilise GetYourMentor ?</h3>
          <a className="recap-dark-button" href={accountRedirect} data-recap-login>
            Se connecter pour acceder au paiement
          </a>
        </div>
      </div>
    </section>
  );
}

function RecapFooter() {
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

export function RecapitulatifReservationLegacyPage({
  legacyStyles,
  params,
}: RecapitulatifReservationLegacyPageProps) {
  const sport = params.sport || "metiers-de-la-forme";
  const city = params.city || "Marseille";
  const coach = params.coach || "Studio Form Marseille";
  const service = params.service || "Coaching remise en forme";
  const duration = params.duration || "30min";
  const price = params.price || "35 ";
  const objective = params.objective || "";
  const format = params.format || "";
  const packageLabel = params.package || "";
  const slot = params.slot || "10:00";
  const mentor = params.mentor || "Coach confirme";

  const editHref = useMemo(
    () =>
      buildNextPath(nextRoutes.slot, {
        sport,
        city,
        coach,
        service,
        duration,
        price,
        objective,
        format,
        package: packageLabel,
        slot,
        mentor,
      }),
    [coach, city, duration, format, objective, packageLabel, price, slot, mentor, service, sport],
  );

  const accountRedirect = useMemo(
    () =>
      buildNextPath(nextRoutes.account, {
        redirect: "paiement",
        sport,
        city,
        coach,
        service,
        duration,
        price,
        objective,
        format,
        package: packageLabel,
        slot,
        mentor,
      }),
    [coach, city, duration, format, objective, packageLabel, price, slot, mentor, service, sport],
  );

  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell recap-shell">
        <RecapHeader />

        <main className="recap-page" data-recap-page>
          <RecapMainHeader coach={coach} city={city} />
          <RecapServicesSection
            sport={sport}
            city={city}
            coach={coach}
            service={service}
            duration={duration}
            price={price}
            objective={objective}
            format={format}
            packageLabel={packageLabel}
            slot={slot}
            mentor={mentor}
          />
          <RecapDatetimeSection editHref={editHref} slot={slot} />
          <RecapAuthSection accountRedirect={accountRedirect} />
        </main>

        <RecapFooter />
      </div>
    </>
  );
}
