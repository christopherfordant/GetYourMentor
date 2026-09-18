"use client";

import { useEffect, useMemo, useState } from "react";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { CoachRequestsPanel } from "@/components/account-legacy/CoachRequestsPanel";
import { CoachProfileEditor } from "@/components/account-legacy/CoachProfileEditor";
import { MessageInbox } from "@/components/account-legacy/MessageInbox";
import { AthleteDashboard } from "@/components/account-legacy/AthleteDashboard";
import { AdminDashboard } from "@/components/account-legacy/AdminDashboard";
import { findCoach, type CoachProfile, type Reservation } from "@/lib/domain";

type AccountLegacyPageProps = {
  legacyStyles: string;
  params: Record<string, string | undefined>;
  allowDemoFallback?: boolean;
};

type StepName = "signin" | "role" | "create";
type DashboardMode = "sportif" | "coach" | "club" | "admin" | null;

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
        <a className="brand-name brand-link" href={nextRoutes.home}>
          GetYourMentor
        </a>
      </div>
      <nav className="sports-nav" aria-label="Sports">
        <a className="sport-link" href={`${nextRoutes.search}?sport=football`}>
          Football
        </a>
        <a className="sport-link" href={`${nextRoutes.search}?sport=basketball`}>
          Basketball
        </a>
        <a className="sport-link" href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>
          Fitness
        </a>
        <a className="sport-link" href={`${nextRoutes.search}?sport=sports-de-combat`}>
          Sports de combat
        </a>
      </nav>
      <div className="topbar-actions">
        <LanguageSelector />
        <a className="topbar-link" href={`${nextRoutes.account}?mode=coach`}>
          Je suis coach
        </a>
        <div className="account-topbar-menu">
          <a className="account-button" href={nextRoutes.account} aria-current="page">
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
          <button
            className="account-display-toggle"
            type="button"
            data-coach-display-toggle
            hidden
            aria-expanded="false"
            aria-controls="coach-display-menu"
          >
            <span>Choisir l'accueil</span>
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path
                d="M7 10l5 5 5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="account-display-menu" id="coach-display-menu" data-coach-display-menu hidden>
            <label>
              <input type="checkbox" data-coach-display-target="next-session" defaultChecked /> Prochaines séances
            </label>
            <label>
              <input type="checkbox" data-coach-display-target="rating" defaultChecked /> Ma note / Mes avis
            </label>
            <label>
              <input type="checkbox" data-coach-display-target="revenue" defaultChecked /> Revenus ce mois-ci
            </label>
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
  onSubmitSignIn: (credentials: { email: string; password: string }) => void | Promise<void>;
  onOpenSignup: () => void;
  onBack: (step: StepName) => void;
  onChooseRole: (role: "sportif" | "coach" | "club") => void | Promise<void>;
  onSubmitCreate: (credentials: {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    email: string;
    emailConfirmation: string;
    password: string;
    passwordConfirmation: string;
    termsAccepted: boolean;
  }) => void | Promise<void>;
}) {
  return (
    <div className="account-auth-stage" data-account-auth-shell>
      <div className={`auth-modal-step${step === "signin" ? " is-active" : ""}`} data-account-step="signin" hidden={step !== "signin"}>
        <div className="auth-card auth-card-compact">
          <h1 data-account-title>S'identifier</h1>
          <p className="auth-subtitle" data-account-subtitle>
            Connectez-vous pour retrouver votre espace ou poursuivre votre inscription.
          </p>
          <p className="auth-status-message" data-account-status hidden={!status}>
            {status}
          </p>
          <form
            className="auth-form"
            data-account-form
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              onSubmitSignIn({
                email: String(form.get("email") ?? ""),
                password: String(form.get("password") ?? ""),
              });
            }}
          >
            <label className="auth-field">
              <span>Prénom</span>
              <input name="firstName" type="text" placeholder="Prénom" autoComplete="given-name" />
            </label>
            <label className="auth-field">
              <span>Nom</span>
              <input name="lastName" type="text" placeholder="Nom" autoComplete="family-name" />
            </label>
            <label className="auth-field">
              <span>Téléphone</span>
              <input name="phone" type="tel" placeholder="Téléphone" autoComplete="tel" />
            </label>
            <label className="auth-field">
              <span>Identifiant</span>
              <input id="account-email" name="email" type="email" placeholder="Adresse mail" />
            </label>
            <label className="auth-field">
              <span>Mot de passe</span>
              <div className="password-field">
                <input id="account-password" name="password" type={passwordVisible ? "text" : "password"} placeholder="Mot de passe" />
                <button
                  className={`password-toggle${passwordVisible ? " is-visible" : ""}`}
                  type="button"
                  aria-controls="account-password"
                  aria-label={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={passwordVisible ? "true" : "false"}
                  onClick={onTogglePassword}
                >
                  <span className="eye-open" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path
                        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <span className="eye-closed" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path
                        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M4 4 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
              </div>
            </label>
            <a className="auth-link" href={nextRoutes.account} data-account-forgot>
              Mot de passe oublié ?
            </a>
            <button className="auth-primary" type="submit" data-account-login>
              Se connecter
            </button>
          </form>
          <button className="auth-pill-button" type="button">
            Se connecter avec Gmail
          </button>
          <button className="auth-pill-button auth-pill-button-light" type="button" data-account-signup onClick={onOpenSignup}>
            Nouveau ? Inscription
          </button>
        </div>
      </div>
      <div className={`auth-modal-step${step === "role" ? " is-active" : ""}`} data-account-step="role" hidden={step !== "role"}>
        <div className="auth-card auth-card-wide">
          <h1>Vous êtes :</h1>
          <div className="auth-role-grid">
            <button className="auth-role-card" type="button" data-account-role="sportif" onClick={() => onChooseRole("sportif")}>
              <strong>Un(e) sportif(ve)</strong>
            </button>
            <div className="auth-role-separator">ou</div>
            <button className="auth-role-card" type="button" data-account-role="coach" onClick={() => onChooseRole("coach")}>
              <strong>Un(e) coach</strong>
            </button>
            <div className="auth-role-separator">ou</div>
            <button className="auth-role-card auth-role-card-detail" type="button" data-account-role="club" onClick={() => onChooseRole("club")}>
              <strong>
                Association sportive
                <br />
                Club
                <br />
                Structure
              </strong>
            </button>
          </div>
          <div className="auth-step-actions">
            <button className="auth-inline-button" type="button" data-account-back="signin" onClick={() => onBack("signin")}>
              Retour
            </button>
          </div>
        </div>
      </div>
      <div className={`auth-modal-step${step === "create" ? " is-active" : ""}`} data-account-step="create" hidden={step !== "create"}>
        <div className="auth-card auth-card-compact">
          <h1>Renseignez votre adresse mail :</h1>
          <form
            className="auth-form"
            data-account-create-form
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              onSubmitCreate({
                firstName: String(form.get("firstName") ?? ""),
                lastName: String(form.get("lastName") ?? ""),
                phone: String(form.get("phone") ?? ""),
                city: String(form.get("city") ?? ""),
                email: String(form.get("email") ?? ""),
                emailConfirmation: String(form.get("emailConfirmation") ?? ""),
                password: String(form.get("password") ?? ""),
                passwordConfirmation: String(form.get("passwordConfirmation") ?? ""),
                termsAccepted: form.get("termsAccepted") === "on",
              });
            }}
          >
            <label className="auth-field">
              <span>Adresse mail</span>
              <input name="email" type="email" placeholder="Adresse mail" />
            </label>
            <label className="auth-field">
              <span>Confirmation de l'adresse mail</span>
              <input name="emailConfirmation" type="email" placeholder="Confirmez l'adresse mail" />
            </label>
            <label className="auth-field">
              <span>Créez votre mot de passe</span>
              <input name="password" type="password" placeholder="Mot de passe" />
            </label>
            <label className="auth-field">
              <span>Confirmez votre mot de passe</span>
              <input name="passwordConfirmation" type="password" placeholder="Confirmation du mot de passe" />
            </label>
            <label className="auth-field">
              <span>Prénom</span>
              <input name="firstName" type="text" placeholder="Prénom" autoComplete="given-name" />
            </label>
            <label className="auth-field">
              <span>Nom</span>
              <input name="lastName" type="text" placeholder="Nom" autoComplete="family-name" />
            </label>
            <label className="auth-field">
              <span>Téléphone</span>
              <input name="phone" type="tel" placeholder="Téléphone" autoComplete="tel" />
            </label>
            <label className="auth-field">
              <span>Ville / zone</span>
              <input name="city" type="text" placeholder="Ville ou zone de pratique" autoComplete="address-level2" />
            </label>
            <label className="auth-checkbox">
              <input name="termsAccepted" type="checkbox" />
              <span>J’accepte les CGU et la politique de confidentialité.</span>
            </label>
            <button className="auth-primary" type="submit">
              Continuer
            </button>
          </form>
          <button className="auth-pill-button" type="button">
            Connectez-vous avec Google
          </button>
          <div className="auth-step-actions">
            <button className="auth-inline-button" type="button" data-account-back="signin" onClick={() => onBack("signin")}>
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoachDashboard({
  coachName,
  coachId,
  allowDemoFallback,
  sessionIndex,
  onNextSession,
}: {
  coachName: string;
  coachId?: string;
  allowDemoFallback: boolean;
  sessionIndex: number;
  onNextSession: () => void;
}) {
  const session = allowDemoFallback ? coachSessions[sessionIndex] : null;
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(() => allowDemoFallback ? findCoach(coachName) : null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    fetch(`/api/coaches/${encodeURIComponent(coachId ?? coachName)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Profil indisponible"))))
      .then((payload) => setCoachProfile(payload.data as CoachProfile))
      .catch(() => {
        if (!allowDemoFallback) setCoachProfile(null);
      });
  }, [allowDemoFallback, coachId, coachName]);

  useEffect(() => {
    fetch("/api/reservations")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Chargement impossible"))))
      .then((payload) => setReservations((payload.data as Reservation[]).filter((reservation) => reservation.coachName.toLowerCase() === coachName.toLowerCase())))
      .catch(() => setReservations([]));
  }, [coachName]);

  const nextReservation = reservations.find((reservation) => ["accepted", "paid"].includes(reservation.status)) ?? reservations[0];

  const requestedCount = reservations.filter((reservation) => reservation.status === "requested").length;
  const acceptedCount = reservations.filter((reservation) => ["accepted", "paid"].includes(reservation.status)).length;
  const paidRevenue = reservations.filter((reservation) => reservation.status === "paid").reduce((total, reservation) => total + reservation.price, 0);

  return (
    <section className="account-dashboard coach-home" data-account-dashboard="coach">
      <aside className="coach-home-sidebar">
        <button className="coach-home-nav-main is-active" type="button">
          Accueil
        </button>
        <div className="coach-home-nav-group">
          <div className="coach-home-nav-heading">Organisation</div>
          <a href="#coach-planning">Planning</a>
          <a href="#coach-messages">Messagerie</a>
          <a href="#coach-contents">Mes contenus</a>
          <a href="#coach-templates">Mes templates</a>
          <a href="#coach-athletes">Mes sportifs</a>
        </div>
        <div className="coach-home-nav-group">
          <div className="coach-home-nav-heading">Mes données</div>
          <a href="#coach-dashboard">Tableau de bord</a>
          <a href="#coach-payments">Mes paiements</a>
          <a href="#coach-rib">Mon RIB</a>
          <a href="#coach-subscription">Mon abonnement</a>
          <a href="#coach-bills">Mes factures</a>
        </div>
        <div className="coach-home-nav-footer">
          <a href="#coach-invitations">Invitation</a>
          <a href="#coach-help">Conseils et aides</a>
          <a href={nextRoutes.home} onClick={async (event) => { event.preventDefault(); await fetch("/api/auth/sign-out", { method: "POST" }); window.location.assign(nextRoutes.home); }}>Déconnexion</a>
        </div>
      </aside>
      <section className="coach-home-planning account-dashboard-card" id="coach-planning">
        <div className="coach-home-card-head">
          <h3>Mon planning</h3>
          <span>Aujourd'hui</span>
        </div>
        <div className="coach-home-day-switch">
          <button type="button" aria-label="Jour précédent">
            ‹
          </button>
          <strong>Aujourd'hui</strong>
          <button type="button" aria-label="Jour suivant">
            ›
          </button>
        </div>
        <div className="coach-home-schedule">
          {allowDemoFallback ? coachSessions.map((demoSession) => (
            <article key={demoSession.name}>
              <strong>{demoSession.slot}</strong>
              <span>{demoSession.name}</span>
              <a href={demoSession.href}>Voir fiche</a>
            </article>
          )) : reservations.length ? reservations.map((reservation) => (
            <article key={reservation.id}>
              <strong>{reservation.slots.join(" · ")}</strong>
              <span>{reservation.service}</span>
              <span>Statut : {reservation.status}</span>
            </article>
          )) : <p data-coach-schedule-empty>Aucune séance enregistrée.</p>}
        </div>
      </section>
      <CoachRequestsPanel coachName={coachName} />
      {coachProfile ? (
        <CoachProfileEditor
          coachId={coachProfile.id}
          specialty={coachProfile.specialty}
          city={coachProfile.city}
          priceFrom={coachProfile.priceFrom}
          description={coachProfile.description}
          disciplines={coachProfile.disciplines}
          diplomas={coachProfile.diplomas}
          sessionTypes={coachProfile.sessionTypes}
          availability={coachProfile.availability}
          photoUrl={coachProfile.photoUrl}
          bankAccountLast4={coachProfile.bankAccountLast4}
          latitude={coachProfile.latitude}
          longitude={coachProfile.longitude}
          serviceRadiusKm={coachProfile.serviceRadiusKm}
          gender={coachProfile.gender}
          practice={coachProfile.practice}
          level={coachProfile.level}
          format={coachProfile.format}
          availabilityTags={coachProfile.availabilityTags}
        />
      ) : (
        <section className="account-dashboard-card" data-coach-profile-unavailable>
          <h3>Profil coach indisponible</h3>
          <p>Votre profil sera affiché dès qu’il aura été créé et vérifié par l’administrateur.</p>
        </section>
      )}
      <MessageInbox recipientName={coachName} />
      <section className="account-dashboard-card coach-home-summary" data-coach-summary>
        <div className="coach-home-card-head">
          <h3>Mon activité</h3>
          <span>Données actualisées</span>
        </div>
        <div className="coach-home-profile-preview-grid">
          <div><span>Demandes à traiter</span><strong data-coach-request-count>{requestedCount}</strong></div>
          <div><span>Réservations confirmées</span><strong data-coach-accepted-count>{acceptedCount}</strong></div>
          <div><span>Paiements reçus</span><strong data-coach-paid-count>{paidRevenue} EUR</strong></div>
        </div>
      </section>
      <div className="coach-home-focus">
        <article className="account-dashboard-card coach-home-next-session" id="coach-dashboard" data-coach-display-block="next-session">
          <div className="coach-home-card-head">
            <h3>Prochaines séances</h3>
            <div className="coach-home-next-head-actions">
              <span>{session?.date ?? (nextReservation ? nextReservation.slots.join(" · ") : "À planifier")}</span>
              {session ? <button className="coach-home-next-arrow" type="button" aria-label="Séance suivante" onClick={onNextSession}>›</button> : null}
            </div>
          </div>
          <div className="coach-home-next-copy coach-home-next-copy--plain">
            {session ? <><strong>{session.name}</strong><span>{session.age}</span><span>{session.club}</span><span>{session.objective}</span><span>{session.location}</span><span>{session.slot}</span></> : nextReservation ? <><strong>{nextReservation.service}</strong><span>{nextReservation.duration}</span><span>{nextReservation.city}</span><span>Statut : {nextReservation.status}</span><span>{nextReservation.price} EUR</span></> : <p data-coach-next-empty>Aucune séance à venir.</p>}
          </div>
          {session ? <a className="coach-home-inline-link" href={session.href}>Voir fiche sportive</a> : null}
        </article>
        <article className="account-dashboard-card coach-home-rating" data-coach-display-block="rating">
          <div className="coach-home-mini-tabs">
            <span className="is-active">Ma note</span>
            <span>Mes avis</span>
          </div>
          <div className="coach-home-rating-score">{coachProfile ? `${coachProfile.rating.toFixed(1)} / 5` : "Non renseignée"}</div>
          <p>{coachProfile ? `${coachProfile.reviewCount} avis vérifiés.` : "La note sera affichée après les premiers avis vérifiés."}</p>
        </article>
        <article className="account-dashboard-card coach-home-revenue" id="coach-payments" data-coach-display-block="revenue">
          <div className="coach-home-card-head">
            <h3>Revenus ce mois-ci</h3>
            <span>Mars</span>
          </div>
          <div className="coach-home-revenue-amount">{paidRevenue} EUR</div>
          <p>Montant calculé sur les réservations payées.</p>
        </article>
        <article className="account-dashboard-card coach-home-profile-preview" data-coach-display-block="profile-preview">
          <div className="coach-home-card-head">
            <h3>Aperçu de mon profil</h3>
            <span>Vue élève</span>
          </div>
          <div className="coach-home-profile-preview-head">
            <strong>{coachProfile?.name ?? coachName}</strong>
            <span>{coachProfile?.verified ? "Coach vérifié" : "Profil en attente de vérification"}</span>
          </div>
          <div className="coach-home-profile-preview-grid">
            <div>
              <span>Zone</span>
              <strong>{coachProfile?.city ?? "À renseigner"}</strong>
            </div>
            <div>
              <span>Formats</span>
              <strong>{coachProfile?.sessionTypes ?? "À renseigner"}</strong>
            </div>
            <div>
              <span>Tarif d'appel</span>
              <strong>{coachProfile ? `${coachProfile.priceFrom} EUR / séance` : "À renseigner"}</strong>
            </div>
            <div>
              <span>Disponibilité</span>
              <strong>{coachProfile?.availability ?? "À renseigner"}</strong>
            </div>
          </div>
          <p className="coach-home-profile-preview-copy">
            L'élève voit ici les informations essentielles avant de cliquer : zone, formats de séance, premier prix, disponibilité et niveau de confiance.
          </p>
        </article>
        <div className="coach-home-standalone-cta">
          <a
            className="coach-home-inline-link coach-home-inline-link--ghost coach-home-inline-link-prominent"
            href={buildNextPath(nextRoutes.coach, { sport: "metiers-de-la-forme", city: "Lille", coach: coachName })}
          >
            Voir mon profil en ligne
          </a>
        </div>
      </div>
      {allowDemoFallback ? <section className="account-dashboard-card coach-home-messages" id="coach-messages">
        <div className="coach-home-card-head">
          <h3>Messagerie</h3>
          <span>4 conversations</span>
        </div>
        <div className="coach-home-message-list">
          <article>
            <strong>Fordant Steven</strong>
            <span>Question sur la prochaine séance et la disponibilité du terrain.</span>
          </article>
          <article>
            <strong>Fordant Christopher</strong>
            <span>Demande d'ajustement d'horaire pour la session de demain.</span>
          </article>
          <article>
            <strong>Vazquez Eliott</strong>
            <span>Confirmation de présence et besoin de conseils avant la séance.</span>
          </article>
          <article>
            <strong>Seck Madison</strong>
            <span>Retour sur les contenus premium et demande d'accès au planning.</span>
          </article>
        </div>
      </section> : null}
    </section>
  );
}

function ClubLeadPanel() {
  const [lead, setLead] = useState<{
    clubName: string;
    managerName: string;
    email: string;
    phone?: string;
    logoFileName?: string;
    identityFileName?: string;
    createdAt: string;
    status: "pending" | "contacted" | "closed";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/clubs/me", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Demande club indisponible");
        if (active) setLead(payload.data ?? null);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Demande club indisponible");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="account-dashboard club-home" data-account-dashboard="club">
      <section className="account-dashboard-card" data-club-production-state>
        <h1>Espace club</h1>
        {loading ? <p data-club-lead-loading>Verification de votre demande d'affiliation...</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {!loading && !error && lead ? (
          <div data-club-lead-status>
            <p><strong>{lead.clubName}</strong> - demande envoyee le {new Date(lead.createdAt).toLocaleDateString("fr-FR")}</p>
            <p>Statut : <strong>{lead.status === "pending" ? "Demande recue" : lead.status === "contacted" ? "Prise de contact en cours" : "Dossier cloture"}</strong></p>
            <p>Prochaine etape avec {lead.managerName} : nous vous recontacterons a {lead.email}.</p>
            {lead.logoFileName || lead.identityFileName ? <p>Pieces transmises : {[lead.logoFileName, lead.identityFileName].filter(Boolean).join(" - ")}</p> : null}
          </div>
        ) : null}
        {!loading && !error && !lead ? <p>Aucune demande d'affiliation n'est rattachee a ce compte.</p> : null}
      </section>
    </section>
  );
}

function ClubDashboard({ allowDemoFallback }: { allowDemoFallback: boolean }) {
  if (!allowDemoFallback) return <ClubLeadPanel />;
  if (!allowDemoFallback) {
    return (
      <section className="account-dashboard club-home" data-account-dashboard="club">
        <section className="account-dashboard-card" data-club-production-state>
          <h1>Espace club</h1>
          <p>Votre espace sera disponible après validation de votre demande d’affiliation et configuration de vos coachs.</p>
          <a className="coach-home-inline-link" href={nextRoutes.clubSignup}>Préparer une demande club</a>
        </section>
      </section>
    );
  }

  return (
    <section className="account-dashboard coach-home club-home" data-account-dashboard="club">
      <aside className="coach-home-sidebar club-home-sidebar">
        <button className="coach-home-nav-main is-active" type="button">
          Accueil
        </button>
        <div className="coach-home-nav-group">
          <div className="coach-home-nav-heading">Organisation</div>
          <a href="#club-planning">Planning du club</a>
          <a href="#club-messages">Messagerie</a>
          <a href="#club-coaches">Mes coachs affiliés</a>
          <a href="#club-contents">Mes contenus</a>
          <a href="#club-templates">Mes templates</a>
        </div>
        <div className="coach-home-nav-group">
          <div className="coach-home-nav-heading">Mes données</div>
          <a href="#club-overview">Tableau de bord</a>
          <a href="#club-payments">Mes paiements</a>
          <a href="#club-rib">Mon RIB</a>
          <a href="#club-subscription">Mon abonnement</a>
          <a href="#club-bills">Mes factures</a>
        </div>
        <div className="coach-home-nav-footer">
          <a href="#club-help">Conseils et aides</a>
          <a href={nextRoutes.home} onClick={async (event) => { event.preventDefault(); await fetch("/api/auth/sign-out", { method: "POST" }); window.location.assign(nextRoutes.home); }}>Déconnexion</a>
        </div>
      </aside>
      <section className="coach-home-planning account-dashboard-card club-home-planning" id="club-planning">
        <div className="coach-home-card-head">
          <h3>Planning du club</h3>
          <span>Aujourd'hui</span>
        </div>
        <div className="coach-home-day-switch">
          <button type="button" aria-label="Jour précédent">
            ‹
          </button>
          <strong>Aujourd'hui</strong>
          <button type="button" aria-label="Jour suivant">
            ›
          </button>
        </div>
        <div className="coach-home-schedule">
          <article>
            <strong>18h - 19h</strong>
            <span>Steven Fordant - groupe U17</span>
            <a href={buildNextPath(nextRoutes.coach, { sport: "football", city: "Marseille", coach: "Steven Fordant" })}>Voir fiche</a>
          </article>
          <article>
            <strong>19h - 20h</strong>
            <span>Kenza Training - séance cardio</span>
            <a href={buildNextPath(nextRoutes.coach, { sport: "metiers-de-la-forme", city: "Lille", coach: "Kenza Training Club" })}>Voir fiche</a>
          </article>
          <article>
            <strong>20h - 21h</strong>
            <span>Créneau libre pour un nouveau coach</span>
            <a href={buildNextPath(nextRoutes.clubSignup, { source: "compte" })}>Gérer</a>
          </article>
        </div>
      </section>
      <div className="coach-home-focus club-home-focus">
        <article className="account-dashboard-card coach-home-next-session club-home-next-session" id="club-overview" data-coach-display-block="next-session">
          <div className="coach-home-card-head">
            <h3>Prochaines séances</h3>
            <div className="coach-home-next-head-actions">
              <span>05/04</span>
              <button className="coach-home-next-arrow" type="button" aria-label="Séance suivante">
                ›
              </button>
            </div>
          </div>
          <div className="coach-home-next-copy coach-home-next-copy--plain">
            <strong>Steven Fordant</strong>
            <span>Football - groupe U17</span>
            <span>Responsable : Christopher Fordant</span>
            <span>Lieu : Complexe sportif Marseille Est</span>
            <span>18h - 19h</span>
          </div>
          <a className="coach-home-inline-link" href={buildNextPath(nextRoutes.coach, { sport: "football", city: "Marseille", coach: "Steven Fordant" })}>
            Voir la séance
          </a>
        </article>
        <article className="account-dashboard-card club-home-summary-card" data-coach-display-block="rating">
          <div className="coach-home-card-head">
            <h3>Mes coachs affiliés</h3>
            <span>4 actifs</span>
          </div>
          <div className="club-home-stat-grid">
            <div>
              <span>Coachs actifs</span>
              <strong>4</strong>
            </div>
            <div>
              <span>Séances ce mois</span>
              <strong>28</strong>
            </div>
            <div>
              <span>Structures suivies</span>
              <strong>2</strong>
            </div>
            <div>
              <span>Taux d'occupation</span>
              <strong>81%</strong>
            </div>
          </div>
        </article>
        <article className="account-dashboard-card coach-home-revenue club-home-revenue" id="club-payments" data-coach-display-block="revenue">
          <div className="coach-home-card-head">
            <h3>Revenus du club</h3>
            <span>Mars</span>
          </div>
          <div className="coach-home-revenue-amount">2 450 EUR</div>
          <p>Montant validé sur les séances facturées, les coachs affiliés et les encaissements confirmés du mois.</p>
        </article>
        <article className="account-dashboard-card club-home-profile-preview">
          <div className="coach-home-card-head">
            <h3>Aperçu de la structure</h3>
            <span>Vue publique</span>
          </div>
          <div className="coach-home-profile-preview-head">
            <strong>Club Horizon Marseille</strong>
            <span>Football, préparation physique, accompagnement jeune</span>
          </div>
          <div className="club-home-preview-badges">
            <span>4 coachs certifiés</span>
            <span>7 créneaux cette semaine</span>
            <span>Dès 29 EUR</span>
          </div>
          <div className="coach-home-profile-preview-grid">
            <div>
              <span>Disciplines</span>
              <strong>Football, prépa physique, reprise</strong>
            </div>
            <div>
              <span>Formats</span>
              <strong>Individuel, petits groupes, stages</strong>
            </div>
            <div>
              <span>Lieu</span>
              <strong>Marseille Est, accès facile et parking</strong>
            </div>
            <div>
              <span>Rythme</span>
              <strong>Cours chaque semaine et planning visible</strong>
            </div>
          </div>
          <p className="coach-home-profile-preview-copy">
            Comme sur les sites de forme, l'idée est de montrer tout de suite ce qu'on pratique, avec qui, à quel rythme et à partir de quel niveau de prix.
          </p>
          <div className="club-home-preview-actions">
            <a className="coach-home-inline-link" href={`${nextRoutes.search}?sport=football&city=Marseille`}>
              Voir le club en ligne
            </a>
            <a className="coach-home-inline-link coach-home-inline-link--ghost" href={`${nextRoutes.search}?sport=football&city=Marseille`}>
              Voir les coachs affiliés
            </a>
          </div>
        </article>
      </div>
      <section className="account-dashboard-card coach-home-messages club-home-messages" id="club-messages">
        <div className="coach-home-card-head">
          <h3>Messagerie</h3>
          <span>5 conversations</span>
        </div>
        <div className="coach-home-message-list">
          <article>
            <strong>Steven Fordant</strong>
            <span>Demande de validation pour le créneau U17 de jeudi soir.</span>
          </article>
          <article>
            <strong>Madison Seck</strong>
            <span>Question sur l'affiliation d'un nouveau coach pour la structure.</span>
          </article>
          <article>
            <strong>Parent - Eliott Vazquez</strong>
            <span>Besoin d'informations sur les séances et les disponibilités du club.</span>
          </article>
          <article>
            <strong>Christopher Fordant</strong>
            <span>Suivi du paiement de mars et ajustement du RIB de la structure.</span>
          </article>
        </div>
      </section>
    </section>
  );
}

function AccountFooter() {
  return (
    <footer className="account-footer">
      <div className="account-footer-grid">
        <div className="account-footer-brand">
          <div className="footer-brand">GETYOURMENTOR</div>
          <div className="account-socials" aria-label="Réseaux sociaux">
            <a href="#instagram" aria-label="Instagram">
              IG
            </a>
            <a href="#facebook" aria-label="Facebook">
              FB
            </a>
          </div>
        </div>
        <div className="account-footer-column">
          <h3>A propos de GetYourMentor</h3>
          <a href={`${nextRoutes.account}?mode=coach`}>Je suis coach</a>
          <a href={`${nextRoutes.account}?mode=coach`}>Rejoignez-nous</a>
          <a href="/legal/cgu">CGU</a>
          <a href="/legal/confidentialite">Politique de confidentialité</a>
          <a href="/legal/cookies">Gestion des cookies</a>
          <a href="/legal/accessibilite">Accessibilité</a>
        </div>
        <div className="account-footer-column">
          <h3>Trouvez votre coach</h3>
          <a href={`${nextRoutes.search}?sport=football`}>Football</a>
          <a href={`${nextRoutes.search}?sport=basketball`}>Basketball</a>
          <a href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>Fitness</a>
          <a href={`${nextRoutes.search}?sport=sports-de-combat`}>Sports de combat</a>
          <a href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>Coaching en visio</a>
          <a href={`${nextRoutes.search}?sport=football`}>Coaching en présentiel</a>
        </div>
        <div className="account-footer-column">
          <h3>Recherches fréquentes</h3>
          <a href={`${nextRoutes.directory}?sport=football&city=Paris`}>Coach sportif Paris</a>
          <a href={`${nextRoutes.directory}?sport=metiers-de-la-forme&city=Marseille`}>Coach sportif Marseille</a>
          <a href={`${nextRoutes.directory}?sport=basketball&city=Lyon`}>Coach sportif Lyon</a>
          <a href={`${nextRoutes.directory}?sport=metiers-de-la-forme&city=Lille`}>Coach fitness Lille</a>
        </div>
      </div>
      <div className="account-footer-bottom">Copyright &copy; 2026 GetYourMentor</div>
    </footer>
  );
}

export function AccountLegacyPage({ legacyStyles, params, allowDemoFallback = false }: AccountLegacyPageProps) {
  const mode = params.mode;
  const redirect = params.redirect;
  const isCoachMode = mode === "coach";
  const isClubMode = mode === "club";
  const isAdminMode = mode === "admin";
  const [step, setStep] = useState<StepName>("signin");
  const [status, setStatus] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [authenticatedCoachName, setAuthenticatedCoachName] = useState("");
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>(
    params.connected === "1" && redirect !== "paiement" ? (isClubMode ? "club" : isCoachMode ? "coach" : isAdminMode ? "admin" : "sportif") : null,
  );
  const [sessionIndex, setSessionIndex] = useState(0);
  const [pendingSignup, setPendingSignup] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    email: string;
    password: string;
    termsAccepted: boolean;
  } | null>(null);

  const paymentTarget = useMemo(
    () =>
      buildNextPath(nextRoutes.payment, {
        sport: params.sport,
        city: params.city,
        coach: params.coach,
        service: params.service,
        duration: params.duration,
        price: params.price,
        objective: params.objective,
        format: params.format,
        package: params.package,
        slot: params.slot,
        mentor: params.mentor,
        reservationId: params.reservationId,
        claimToken: params.claimToken,
        connected: "1",
      }),
    [params],
  );

  const coachName = params.coach || authenticatedCoachName || "Steven Fordant";

  const revealDashboard = (modeToShow: DashboardMode) => {
    if (!modeToShow) return;
    setStatus("");
    setStep("signin");
    setDashboardMode(modeToShow);
  };

  return (
    <>
      <style jsx global>{`${legacyStyles}
        [data-account-form] > .auth-field:nth-child(1),
        [data-account-form] > .auth-field:nth-child(2),
        [data-account-form] > .auth-field:nth-child(3) { display: none; }
      `}</style>
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
                onSubmitSignIn={async ({ email, password }) => {
                  const response = await fetch("/api/auth/sign-in", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, role: isCoachMode ? "coach" : isClubMode ? "club" : isAdminMode ? "admin" : "sportif" }),
                  });
                  const payload = await response.json();
                  if (!response.ok) {
                    setStatus(payload.error ?? "Connexion impossible");
                    return;
                  }
                  if (isCoachMode && payload.data?.coachName) setAuthenticatedCoachName(payload.data.coachName);
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
                  if (isAdminMode) {
                    revealDashboard("admin");
                    return;
                  }
                  revealDashboard("sportif");
                }}
                onOpenSignup={() => {
                  if (redirect === "paiement") {
                    window.location.href = paymentTarget;
                    return;
                  }
                  setStep("create");
                }}
                onBack={setStep}
                onChooseRole={async (role) => {
                  if (role === "club") {
                    window.location.href = buildNextPath(nextRoutes.clubSignup, { source: "compte" });
                    return;
                  }
                  if (!pendingSignup) {
                    setStatus("Commencez par renseigner vos informations.");
                    setStep("create");
                    return;
                  }
                  const response = await fetch("/api/auth/sign-up", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...pendingSignup, role }),
                  });
                  const payload = await response.json();
                  if (!response.ok) {
                    setStatus(payload.error ?? "Inscription impossible");
                    setStep("create");
                    return;
                  }
                  if (role === "coach" && payload.data?.coachName) setAuthenticatedCoachName(payload.data.coachName);
                  revealDashboard(role);
                }}
                onSubmitCreate={({ firstName, lastName, phone, city, email, emailConfirmation, password, passwordConfirmation, termsAccepted }) => {
                  if (!firstName || !lastName || !phone) {
                    setStatus("Prénom, nom et téléphone sont requis.");
                    return;
                  }
                  if (!email || email !== emailConfirmation) {
                    setStatus("Les adresses email doivent correspondre.");
                    return;
                  }
                  if (!password || password !== passwordConfirmation) {
                    setStatus("Les mots de passe doivent correspondre.");
                    return;
                  }
                  if (!termsAccepted) {
                    setStatus("Vous devez accepter les CGU pour continuer.");
                    return;
                  }
                  setPendingSignup({ firstName, lastName, phone, city, email, password, termsAccepted });
                  setStatus("");
                  setStep("role");
                }}
              />
            ) : null}
            {dashboardMode === "sportif" ? <AthleteDashboard /> : null}
            {dashboardMode === "admin" ? <AdminDashboard /> : null}
            {dashboardMode === "coach" ? (
              <CoachDashboard
                coachName={coachName}
                coachId={params.coachId}
                allowDemoFallback={allowDemoFallback}
                sessionIndex={sessionIndex}
                onNextSession={() => setSessionIndex((current) => (current + 1) % coachSessions.length)}
              />
            ) : null}
            {dashboardMode === "club" ? <ClubDashboard allowDemoFallback={allowDemoFallback} /> : null}
          </section>
        </main>
        <AccountFooter />
      </div>
    </>
  );
}
