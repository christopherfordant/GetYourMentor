"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { ContactCoachForm } from "@/components/booking-legacy/ContactCoachForm";
import { coachProfiles, type CoachProfile } from "@/lib/domain";

type ReserverSeanceLegacyPageProps = {
  legacyStyles: string;
  params: Record<string, string | undefined>;
  allowDemoFallback?: boolean;
};

type WeekDay = {
  day: string;
  date: string;
  slots: string[];
};

const bookingProfileDictionary = { football: true, basketball: true, "metiers-de-la-forme": true, "sports-de-combat": true } as const;

type BookingProfile = {
  ratingValue?: string;
  priceFrom?: number;
  followers: string;
  specialty: string;
  bio: string;
  reviews: string;
  qualification: string;
  diploma: string;
  disciplines?: string;
  sessionTypes?: string;
  availability?: string;
};

const bookingVisualDictionary = {
  football: {
    hero:
      'linear-gradient(180deg, rgba(14, 18, 28, 0.14), rgba(14, 18, 28, 0.10)), url("/design_assets/content_library/web_reference/football-coaching.jpg") center 18% / cover no-repeat',
  },
  basketball: {
    hero:
      'linear-gradient(180deg, rgba(14, 18, 28, 0.14), rgba(14, 18, 28, 0.10)), url("/design_assets/content_library/basketball/basketball-training-athlete.jpg") center 14% / cover no-repeat',
  },
  "metiers-de-la-forme": {
    hero:
      'linear-gradient(180deg, rgba(14, 18, 28, 0.12), rgba(14, 18, 28, 0.08)), url("/design_assets/sports_sources/fitness.jpg") center 10% / cover no-repeat',
  },
  "sports-de-combat": {
    hero:
      'linear-gradient(180deg, rgba(14, 18, 28, 0.14), rgba(14, 18, 28, 0.10)), url("/design_assets/content_library/combat/combat-muay-thai-kick.jpg") center 18% / cover no-repeat',
  },
} as const;

const weekSets: WeekDay[][] = [
  [
    { day: "jeudi", date: "26 mars", slots: ["10:00", "11:00", "11:30", "12:00", "13:30"] },
    { day: "vendredi", date: "27 mars", slots: ["10:00", "10:30", "11:00", "13:30", "14:00"] },
    { day: "samedi", date: "28 mars", slots: ["10:00", "17:30", "18:00"] },
    { day: "dimanche", date: "29 mars", slots: [] },
    { day: "lundi", date: "30 mars", slots: [] },
    { day: "mardi", date: "31 mars", slots: ["10:00", "10:30", "11:00", "11:30", "12:00"] },
    { day: "mercredi", date: "01 avr.", slots: ["10:00", "10:30", "11:00", "11:30", "12:00"] },
  ],
  [
    { day: "jeudi", date: "02 avr.", slots: ["09:30", "10:30", "11:30", "12:30"] },
    { day: "vendredi", date: "03 avr.", slots: ["10:00", "11:00", "16:00"] },
    { day: "samedi", date: "04 avr.", slots: ["09:00", "10:00", "11:00"] },
    { day: "dimanche", date: "05 avr.", slots: ["09:30", "10:30"] },
    { day: "lundi", date: "06 avr.", slots: [] },
    { day: "mardi", date: "07 avr.", slots: ["10:00", "12:00", "14:00"] },
    { day: "mercredi", date: "08 avr.", slots: ["09:30", "10:30", "11:30"] },
  ],
];

function BookingHeader() {
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
          Fitness
        </a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=sports-de-combat`}>
          Sports de combat
        </a>
      </nav>

      <div className="topbar-actions">
        <LanguageSelector />
        <a className="topbar-link topbar-link-dark" href={`${nextRoutes.account}?mode=coach`}>
          Je suis coach
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

function BookingScorePanel({
  profile,
}: {
  profile: BookingProfile;
}) {
  return (
    <section className="booking-score-panel booking-score-panel-side">
      <p className="booking-score-label">Note :</p>
      <div className="booking-score-display" data-booking-score-large>
        {profile.ratingValue ?? "Pas encore de note"}
      </div>
      <p className="booking-score-meta" data-booking-score-copy>
        {profile.reviews}
      </p>
      <p className="booking-score-breakdown">Note du catalogue ; sous-notes non disponibles.</p>
      <div className="booking-score-facts">
        <div className="booking-score-fact">
          <span>Activité</span>
          <strong data-booking-score-followers>{profile.followers}</strong>
        </div>
        <div className="booking-score-fact">
          <span>Qualification</span>
          <strong data-booking-qualification>{profile.qualification}</strong>
        </div>
        <div className="booking-score-fact">
          <span>Diplome</span>
          <strong data-booking-diploma>{profile.diploma}</strong>
        </div>
      </div>
    </section>
  );
}

function BookingHeroSection({
  coach,
  city,
  profile,
  heroBackground,
  activeTab,
  onTabChange,
  galleryMainRef,
}: {
  coach: string;
  city: string;
  profile: BookingProfile;
  heroBackground: string;
  activeTab: "apropos" | "planning" | "contenus";
  onTabChange: (value: "apropos" | "planning" | "contenus") => void;
  galleryMainRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="booking-profile-hero">
      <div className="booking-profile-top">
        <div className="booking-title-wrap">
          <h1 data-booking-name>{coach}</h1>
        </div>

        <p data-booking-price>À partir de {profile.priceFrom} EUR</p>
        <div className="booking-profile-meta" data-booking-geo-hover>
          <div className="booking-address" data-booking-address>{city}</div>
        </div>
      </div>

      <div className="booking-profile-showcase">
        <div className="booking-profile-showcase-grid">
          <div className="booking-gallery booking-gallery-profile">
            <button className="booking-gallery-arrow booking-gallery-arrow-left" type="button" aria-label="Image precedente">
            ‹
            </button>
            <div
              ref={galleryMainRef}
              className="booking-gallery-main"
              data-booking-gallery-main
              style={{ background: heroBackground }}
            ></div>
            <button className="booking-gallery-arrow booking-gallery-arrow-right" type="button" aria-label="Image suivante">
            ›
            </button>
            <span className="booking-gallery-caption">Visuel d’illustration, sans identification du coach.</span>
          </div>

          <aside className="booking-profile-score-wrap">
            <BookingScorePanel profile={profile} />
          </aside>
        </div>
      </div>

      <div className="booking-profile-lead">
        <div>
          <strong data-booking-heading>{`Construis ta prochaine session avec ${coach}`}</strong>
          <p>Choisis ton objectif, propose tes disponibilités et reçois la validation du coach.</p>
        </div>
        <button className="booking-primary-action" type="button" onClick={() => onTabChange("planning")}>
          Reserver
        </button>
      </div>

      <nav
        className="booking-tabs booking-tabs-profile"
        aria-label="Sections du profil"
      >
        <button
          className={`booking-tab${activeTab === "apropos" ? " is-active" : ""}`}
          type="button"
          data-booking-tab="apropos"
          onClick={() => onTabChange("apropos")}
        >
          A propos
        </button>
        <button
          className={`booking-tab${activeTab === "planning" ? " is-active" : ""}`}
          type="button"
          data-booking-tab="planning"
          onClick={() => onTabChange("planning")}
        >
          Planning
        </button>
        <button
          className={`booking-tab${activeTab === "contenus" ? " is-active" : ""}`}
          type="button"
          data-booking-tab="contenus"
          onClick={() => onTabChange("contenus")}
        >
          Contenus
        </button>
      </nav>
      <div className="booking-tabs-spacer" data-booking-tabs-spacer aria-hidden="true"></div>
    </section>
  );
}

function BookingAProposPane({
  coach,
  profile,
  isActive,
}: {
  coach: string;
  profile: BookingProfile;
  isActive: boolean;
}) {
  return (
    <section className={`booking-pane${isActive ? " is-active" : ""}`} data-booking-pane="apropos" id="booking-apropos-section">
      <div className="booking-pane-grid">
        <div className="booking-pane-main booking-pane-main-wide">
          <article className="booking-story-card">
            <h2>
              A propos de <span data-booking-short-name>{coach.split(" ").slice(-1)[0] || coach}</span>
            </h2>
            <p data-booking-bio>{profile.bio}</p>
            <div className="booking-story-points">
              <div className="booking-story-point">
                <strong>Disciplines</strong>
                <span data-booking-disciplines>{profile.disciplines ?? profile.specialty}</span>
              </div>
              <div className="booking-story-point">
                <strong>Formats de séance</strong>
                <span data-booking-session-types>{profile.sessionTypes ?? "Individuel, présentiel"}</span>
              </div>
              <div className="booking-story-point">
                <strong>Diplômes</strong>
                <span data-booking-public-diplomas>{profile.diploma}</span>
              </div>
              <div className="booking-story-point">
                <strong>Disponibilités indicatives</strong>
                <span data-booking-availability>{profile.availability ?? "Sur demande"}</span>
              </div>
            </div>
            <p>
              L'approche reste volontairement simple : comprendre vite votre besoin, cadrer une seance utile, puis vous faire repartir avec des reperes clairs. Le but n'est pas de surcharger la session, mais d'installer un vrai rythme de progression que vous pouvez tenir dans la duree.
            </p>
            <p>
              Selon votre niveau, la seance peut etre plus technique, plus physique ou davantage orientee prise de confiance. Chaque detail est pense pour garder une sensation premium, lisible et credible du debut a la fin.
            </p>
          </article>

          <article className="booking-story-card">
            <h3>La seance</h3>
            <p>
              Chaque rendez-vous est pense pour rester simple, lisible et efficace. On commence par un point rapide sur votre niveau, votre energie du jour et votre objectif principal, puis on construit une seance claire avec des exercices vraiment utiles.
            </p>
            <div className="booking-story-points">
              <div className="booking-story-point">
                <strong>Avant la seance</strong>
                <span>Brief rapide, objectif du jour, adaptation au niveau et au contexte.</span>
              </div>
              <div className="booking-story-point">
                <strong>Pendant la seance</strong>
                <span>Exercices corriges, rythme progressif, feedback direct et concret.</span>
              </div>
              <div className="booking-story-point">
                <strong>Apres la seance</strong>
                <span>Mini bilan, points forts, axes de progression et recommandation suivante.</span>
              </div>
            </div>
          </article>

          <article className="booking-story-card">
            <h3>Infos pratiques</h3>
            <p>
              Tout est organise pour que la reservation reste fluide : choix du creneau, confirmation, preparation et rappel des conditions. Vous savez donc tres vite comment la seance va se derouler et ce que vous devez prevoir avant d'arriver.
            </p>
            <div className="booking-practical-grid">
              <div className="booking-practical-item">
                <span>Format</span>
                <strong>Individuel, duo ou visio selon le coach</strong>
              </div>
              <div className="booking-practical-item">
                <span>Confirmation</span>
                <strong>Confirmation après acceptation du coach</strong>
              </div>
              <div className="booking-practical-item">
                <span>Paiement</span>
                <strong>Paiement après acceptation</strong>
              </div>
              <div className="booking-practical-item">
                <span>Annulation</span>
                <strong>Report possible selon les disponibilites</strong>
              </div>
            </div>
          </article>

          <article className="booking-story-card">
            <h3>Ce que vous allez travailler</h3>
            <p>
              Le contenu de la seance s'adapte a votre objectif du moment. On peut etre sur une logique de progression technique, de reprise, de performance ou simplement de remise en confiance avec un cadre clair et rassurant.
            </p>
            <div className="booking-story-columns">
              <div className="booking-story-check">
                <strong>Axes possibles</strong>
                <span>Technique, rythme, coordination, intensite, lecture du jeu ou execution.</span>
              </div>
              <div className="booking-story-check">
                <strong>Adaptation</strong>
                <span>Le coach ajuste le contenu selon votre niveau, votre energie et vos disponibilites.</span>
              </div>
            </div>
          </article>

          <article className="booking-story-card">
            <h3>Suivi et progression</h3>
            <p>
              L'interet de la plateforme n'est pas seulement de reserver une fois. La page est aussi pensee pour montrer qu'il peut y avoir une suite logique : recommandations, prochaine seance, et visibilite sur votre progression si vous continuez avec le meme coach.
            </p>
            <div className="booking-story-sequence">
              <div className="booking-story-sequence-item">
                <span>01</span>
                <strong>Observation du niveau et du besoin reel</strong>
              </div>
              <div className="booking-story-sequence-item">
                <span>02</span>
                <strong>Seance cadre avec exercices utiles et retours directs</strong>
              </div>
              <div className="booking-story-sequence-item">
                <span>03</span>
                <strong>Prochaine etape recommandee pour garder une progression claire</strong>
              </div>
            </div>
          </article>
        </div>

        <ContactCoachForm coach={coach} />

      </div>
    </section>
  );
}

function BookingPlanningPane({
  isActive,
  weekIndex,
  selectedSlot,
  confirmHref,
  onPrevWeek,
  onNextWeek,
  onSelectSlot,
}: {
  isActive: boolean;
  weekIndex: number;
  selectedSlot: string;
  confirmHref: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectSlot: (slot: string) => void;
}) {
  const currentWeek = weekSets[weekIndex];

  return (
    <section className={`booking-pane${isActive ? " is-active" : ""}`} data-booking-pane="planning" id="booking-planning-section">
      <div className="booking-planning-shell">
        <p className="discovery-note">Planning indicatif de présentation. Les créneaux, la durée et le prix de la prestation sont vérifiés à l’étape de réservation. Toute demande reste soumise à l’acceptation du coach.</p>
        <header className="booking-section-head booking-section-head-planning">
          <h2>Date et heure</h2>
          <p>Choisissez directement votre creneau disponible.</p>
        </header>

        <div className="reservation-calendar-card booking-calendar-card">
          <div className="reservation-calendar-head">
            <button className="calendar-arrow" type="button" aria-label="Semaine precedente" data-booking-calendar-prev onClick={onPrevWeek}>
              ‹
            </button>
            <div className="reservation-days" data-booking-days>
              {currentWeek.map((item) => (
                <div className="reservation-day" key={`${item.day}-${item.date}`}>
                  <strong>{item.day}</strong>
                  <span>{item.date}</span>
                </div>
              ))}
            </div>
            <button className="calendar-arrow" type="button" aria-label="Semaine suivante" data-booking-calendar-next onClick={onNextWeek}>
              ›
            </button>
          </div>
          <div className="reservation-slots-grid" data-booking-slots-grid>
            {currentWeek.map((item) => (
              <div className="reservation-slot-column" key={`${item.day}-${item.date}-slots`}>
                {item.slots.length ? (
                  item.slots.map((slot) => (
                    <button
                      key={`${item.day}-${slot}`}
                      className={`reservation-slot${slot === selectedSlot ? " is-selected" : ""}`}
                      type="button"
                      data-booking-slot={slot}
                      onClick={() => onSelectSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <button className="reservation-slot" type="button" disabled>
                    -
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="reservation-cta-row booking-cta-row">
          <a className="reservation-confirm-button" href={confirmHref} data-booking-confirm>
            Reserver mon creneau
          </a>
        </div>
      </div>
    </section>
  );
}

function BookingContenusPane({
  allowDemoPreview,
  isActive,
  coach,
  specialty,
}: {
  allowDemoPreview: boolean;
  isActive: boolean;
  coach: string;
  specialty: string;
}) {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <section className={`booking-pane${isActive ? " is-active" : ""}`} data-booking-pane="contenus" id="booking-contenus-section">
      <section className="booking-content-social" data-content-lock-root>
        <div className="booking-content-profile">
          <div className="booking-content-cover"></div>
          <div className="booking-content-avatar"></div>
          <div className="booking-content-profile-copy">
            <strong data-content-coach-name>{coach}</strong>
            <span data-content-specialty>{specialty}</span>
          </div>
          <button
            className="booking-content-subscribe"
            type="button"
            data-content-unlock
            onClick={() => setUnlocked(true)}
            disabled={!allowDemoPreview || unlocked}
          >
            {unlocked ? "Prévisualisation de démo" : allowDemoPreview ? "Prévisualiser les contenus (simulation)" : "Fonction à venir"}
          </button>
        </div>

        <div className="booking-content-lock-note" data-content-lock-note>
          Aperçu de contenus en préparation. Aucun abonnement actif, aucun avantage Premium et aucun paiement déclenché.
        </div>

        <div className={`booking-content-feed ${unlocked ? "is-unlocked" : "is-locked"}`} data-content-feed>
          <article className="booking-content-tile booking-content-tile-1">
            <span className="booking-content-lock">Verrouille</span>
          </article>
          <article className="booking-content-tile booking-content-tile-2">
            <span className="booking-content-lock">Verrouille</span>
          </article>
          <article className="booking-content-tile booking-content-tile-3">
            <span className="booking-content-lock">Verrouille</span>
          </article>
          <article className="booking-content-tile booking-content-tile-4">
            <span className="booking-content-lock">Verrouille</span>
          </article>
          <article className="booking-content-tile booking-content-tile-5">
            <span className="booking-content-lock">Verrouille</span>
          </article>
          <article className="booking-content-tile booking-content-tile-6">
            <span className="booking-content-lock">Verrouille</span>
          </article>
        </div>
      </section>
    </section>
  );
}

import { SiteFooter } from "@/components/SiteFooter";
function BookingFooter() { return <SiteFooter />; }

export function ReserverSeanceLegacyPage({ legacyStyles, params, allowDemoFallback = false }: ReserverSeanceLegacyPageProps) {
  const sportSlug = useMemo(() => {
    const sport = params.sport;
    if (sport && sport in bookingProfileDictionary) {
      return sport as keyof typeof bookingProfileDictionary;
    }
    return "metiers-de-la-forme";
  }, [params.sport]);

  const coach = params.coach || "Studio Form Marseille";
  const city = params.city || "Paris";
  const [coachData, setCoachData] = useState<CoachProfile | null>(() => allowDemoFallback ? coachProfiles.find(item => item.id === coach || item.name.toLowerCase() === coach.toLowerCase()) ?? null : null);
  useEffect(() => {
    let active = true;
    fetch(`/api/coaches/${encodeURIComponent(coach)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Profil indisponible"))))
      .then((payload) => {
        if (active && payload.data && (payload.data.id === coach || payload.data.name?.toLowerCase() === coach.toLowerCase())) setCoachData(payload.data as CoachProfile);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [coach]);
  const profile = {
    followers: "Activité non publiée",
    qualification: coachData?.verified ? "Profil vérifié" : "Vérification à confirmer",
    reviews: coachData?.reviewCount ? `${coachData.reviewCount} avis` : "Pas encore d’avis",
    ratingValue: coachData?.reviewCount ? `${coachData.rating.toFixed(1)} / 5` : "Pas encore de note",
    priceFrom: coachData?.priceFrom,
    specialty: coachData?.specialty ?? "",
    bio: coachData?.description ?? "",
    diploma: coachData?.diplomas?.replace(/\s+—\s+à compléter$/i, "") ?? "",
    disciplines: coachData?.disciplines ?? "",
    sessionTypes: coachData?.sessionTypes ?? "",
    availability: coachData?.availability ?? "",
  };
  const coachLabel = coachData?.name ?? coach;
  const coachCity = coachData?.city ?? city;
  const resolvedSport = coachData?.sport === "fitness" ? "metiers-de-la-forme" : coachData?.sport ?? sportSlug;
  const visual = bookingVisualDictionary[resolvedSport];
  const [selectedSlot, setSelectedSlot] = useState(params.slot || weekSets[0][0].slots[0] || "10:00");
  const confirmHref = useMemo(
    () =>
      buildNextPath(nextRoutes.slot, {
        sport: resolvedSport,
        city: coachCity,
        coach: coachData?.id ?? coach,
        service: coachData?.specialty ?? "Coaching",
        duration: "45min",
        price: String(coachData?.priceFrom ?? ""),
        slot: selectedSlot,
        mentor: coach,
      }),
    [resolvedSport, coachCity, coach, coachData, selectedSlot],
  );
  const [activeTab, setActiveTab] = useState<"apropos" | "planning" | "contenus">("apropos");
  const [weekIndex, setWeekIndex] = useState(0);
  const galleryMainRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef(false);


  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const targets = {
      apropos: "booking-apropos-section",
      planning: "booking-planning-section",
      contenus: "booking-contenus-section",
    } as const;

    const target = document.getElementById(targets[activeTab]);
    target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }, [activeTab]);

  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell booking-shell" id="gym-discovery" data-gym-discovery="profile">
        <BookingHeader />
        <main className="booking-page booking-profile-page" data-booking-page>
          {!coachData ? (
            <section className="booking-card" data-coach-unavailable>
              <h1>Profil coach indisponible</h1>
              <p>Cette fiche sera accessible après la configuration du catalogue de préproduction.</p>
            </section>
          ) : (
            <>
              <BookingHeroSection
                coach={coachLabel}
                city={coachCity}
                profile={profile}
                heroBackground={visual.hero}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                galleryMainRef={galleryMainRef}
              />
              <BookingAProposPane coach={coachLabel} profile={profile} isActive={activeTab === "apropos"} />
              <BookingPlanningPane
                isActive={activeTab === "planning"}
                weekIndex={weekIndex}
                selectedSlot={selectedSlot}
                confirmHref={confirmHref}
                onPrevWeek={() => setWeekIndex((current) => (current === 0 ? weekSets.length - 1 : current - 1))}
                onNextWeek={() => setWeekIndex((current) => (current + 1) % weekSets.length)}
                onSelectSlot={setSelectedSlot}
              />
              <BookingContenusPane allowDemoPreview={allowDemoFallback} isActive={activeTab === "contenus"} coach={coachLabel} specialty={profile.specialty} />
            </>
          )}
        </main>
        <BookingFooter />
      </div>
    </>
  );
}
