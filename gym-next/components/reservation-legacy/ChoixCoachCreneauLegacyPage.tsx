"use client";

import { useMemo, useState } from "react";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";

type ChoixCoachCreneauLegacyPageProps = {
  legacyStyles: string;
  params: Record<string, string | undefined>;
};

type WeekDay = {
  day: string;
  date: string;
  slots: string[];
};

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

const coaches = [
  { id: "SP", name: "Sans preference" },
  { id: "M", name: "Mika" },
  { id: "T", name: "Titi" },
  { id: "Y", name: "Yullia" },
  { id: "S", name: "Sabine" },
];

function ReservationHeader() {
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

function ReservationMainHeader({
  coach,
  city,
}: {
  coach: string;
  city: string;
}) {
  return (
    <section className="reservation-header">
      <h1 data-multi-name>{coach}</h1>
      <div className="reservation-address" data-multi-address>{`10 Rue du Sport, ${city}`}</div>
      <div className="reservation-meta" data-multi-meta>4.9 (423 avis) • Coaching premium</div>
    </section>
  );
}

function ReservationSelectedStep({
  service,
  serviceMeta,
  selectedMentor,
  onMentorChange,
  onBackToCoach,
  backToCoachHref,
}: {
  service: string;
  serviceMeta: string;
  selectedMentor: string;
  onMentorChange: (mentor: string) => void;
  onBackToCoach: () => void;
  backToCoachHref: string;
}) {
  return (
    <section className="reservation-step">
      <h2>
        <span>1.</span> Seance selectionnee
      </h2>
      <div className="reservation-selection-panel">
        <div className="reservation-selection-top">
          <div className="reservation-selection-copy">
            <strong data-multi-service>{service}</strong>
            <div data-multi-service-meta>{serviceMeta}</div>
          </div>
          <a
            className="reservation-remove"
            href={backToCoachHref}
            data-multi-remove
            onClick={(event) => {
              event.preventDefault();
              onBackToCoach();
            }}
          >
            Supprimer
          </a>
        </div>

        <div className="reservation-coach-choice">
          <p>Choisir avec qui ?</p>
          <div className="reservation-coach-grid" data-multi-coaches>
            {coaches.map((item) => (
              <button
                key={item.name}
                className={`reservation-coach-option${item.name === selectedMentor ? " is-active" : ""}`}
                type="button"
                data-mentor={item.name}
                onClick={() => onMentorChange(item.name)}
              >
                <span className="reservation-coach-id">{item.id}</span>
                <span className="reservation-coach-name">{item.name}</span>
                <span className="reservation-coach-radio" aria-hidden="true"></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="reservation-add-button" type="button" data-multi-add onClick={onBackToCoach}>
        + Ajouter une seance a la suite
      </button>
    </section>
  );
}

function ReservationCalendarStep({
  weekIndex,
  selectedSlot,
  onPrevWeek,
  onNextWeek,
  onSelectSlot,
  confirmHref,
}: {
  weekIndex: number;
  selectedSlot: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectSlot: (slot: string) => void;
  confirmHref: string;
}) {
  const currentWeek = weekSets[weekIndex];

  return (
    <section className="reservation-step">
      <h2>
        <span>2.</span> Choix de la date &amp; heure
      </h2>
      <div className="reservation-calendar-card">
        <div className="reservation-calendar-head">
          <button className="calendar-arrow" type="button" aria-label="Semaine precedente" data-calendar-prev onClick={onPrevWeek}>
            ‹
          </button>
          <div className="reservation-days" data-multi-days>
            {currentWeek.map((item) => (
              <div className="reservation-day" key={`${item.day}-${item.date}`}>
                <strong>{item.day}</strong>
                <span>{item.date}</span>
              </div>
            ))}
          </div>
          <button className="calendar-arrow" type="button" aria-label="Semaine suivante" data-calendar-next onClick={onNextWeek}>
            ›
          </button>
        </div>
        <div className="reservation-slots-grid" data-multi-slots-grid>
          {currentWeek.map((item) => (
            <div className="reservation-slot-column" key={`${item.day}-${item.date}-slots`}>
              {item.slots.length ? (
                item.slots.map((slot) => (
                  <button
                    key={`${item.day}-${slot}`}
                    className={`reservation-slot${slot === selectedSlot ? " is-selected" : ""}`}
                    type="button"
                    data-slot={slot}
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
      <div className="reservation-cta-row">
        <a className="reservation-confirm-button" href={confirmHref} data-multi-confirm>
          Reserver mon creneau
        </a>
      </div>
    </section>
  );
}

function ReservationFooter() {
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

export function ChoixCoachCreneauLegacyPage({
  legacyStyles,
  params,
}: ChoixCoachCreneauLegacyPageProps) {
  const sport = params.sport || "metiers-de-la-forme";
  const city = params.city || "Marseille";
  const coach = params.coach || "Studio Form Marseille";
  const service = params.service || "Coaching remise en forme";
  const duration = params.duration || "30min";
  const price = params.price || "35 ";
  const objective = params.objective || "";
  const format = params.format || "";
  const packageLabel = params.package || "";

  const [selectedSlot, setSelectedSlot] = useState(params.slot || "10:00");
  const [selectedMentor, setSelectedMentor] = useState(params.mentor || "Sans preference");
  const [weekIndex, setWeekIndex] = useState(0);

  const serviceMeta = [duration, price, format, objective, packageLabel].filter(Boolean).join("  ");

  const confirmHref = useMemo(
    () =>
      buildNextPath(nextRoutes.recap, {
        sport,
        city,
        coach,
        service,
        duration,
        price,
        objective,
        format,
        package: packageLabel,
        slot: selectedSlot,
        mentor: selectedMentor,
      }),
    [coach, city, duration, format, objective, packageLabel, price, selectedMentor, selectedSlot, service, sport],
  );

  const backToCoachHref = useMemo(
    () =>
      buildNextPath(nextRoutes.coach, {
        sport,
        city,
        coach,
      }),
    [coach, city, sport],
  );

  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell reservation-shell">
        <ReservationHeader />

        <main className="reservation-page reservation-page-wide" data-reservation-multi-page>
          <ReservationMainHeader coach={coach} city={city} />
          <ReservationSelectedStep
            service={service}
            serviceMeta={serviceMeta}
            selectedMentor={selectedMentor}
            onMentorChange={setSelectedMentor}
            backToCoachHref={backToCoachHref}
            onBackToCoach={() => {
              window.location.href = backToCoachHref;
            }}
          />
          <ReservationCalendarStep
            weekIndex={weekIndex}
            selectedSlot={selectedSlot}
            onPrevWeek={() => setWeekIndex((current) => (current === 0 ? weekSets.length - 1 : current - 1))}
            onNextWeek={() => setWeekIndex((current) => (current + 1) % weekSets.length)}
            onSelectSlot={setSelectedSlot}
            confirmHref={confirmHref}
          />
        </main>

        <ReservationFooter />
      </div>
    </>
  );
}
