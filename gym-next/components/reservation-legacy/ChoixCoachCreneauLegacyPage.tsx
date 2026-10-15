"use client";

import { useEffect, useMemo, useState } from "react";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";
import { DiscoveryFrame } from "@/components/discovery/DiscoveryFrame";

type ChoixCoachCreneauLegacyPageProps = {
  demo: boolean;
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

function ReservationMainHeader({
  coach,
  city,
}: {
  coach: string;
  city: string;
}) {
  return (
    <section className="bk-reservation-header">
      <h1 data-multi-name>{coach}</h1>
      <div className="bk-reservation-address" data-multi-address>{city}</div>
      <p className="bk-reservation-meta" data-multi-meta>Une demande, puis l’accord du coach. Le paiement vient après son acceptation.</p>
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
    <section className="bk-reservation-step">
      <h2>
        <span>1.</span> Seance selectionnee
      </h2>
      <div className="bk-reservation-selection-panel">
        <div className="bk-reservation-selection-top">
          <div className="bk-reservation-selection-copy">
            <strong data-multi-service>{service}</strong>
            <div data-multi-service-meta>{serviceMeta}</div>
          </div>
          <a
            className="bk-reservation-remove"
            href={backToCoachHref}
            data-multi-remove
            onClick={(event) => {
              event.preventDefault();
              onBackToCoach();
            }}
          >
            Revoir le coach
          </a>
        </div>

        <div className="bk-reservation-coach-choice">
          <p>Choisir avec qui ?</p>
          <div className="bk-reservation-coach-grid" data-multi-coaches>
            {coaches.map((item) => (
              <button
                key={item.name}
                className={`bk-reservation-coach-option${item.name === selectedMentor ? " is-active" : ""}`}
                type="button"
                aria-pressed={item.name === selectedMentor}
                data-mentor={item.name}
                onClick={() => onMentorChange(item.name)}
              >
                <span className="bk-reservation-coach-id">{item.id}</span>
                <span className="bk-reservation-coach-name">{item.name}</span>
                <span className="bk-reservation-coach-radio" aria-hidden="true"></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="bk-reservation-add-button" type="button" data-multi-add onClick={onBackToCoach}>
        Choisir une autre séance
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
  onConfirm,
  submitting,
  error,
  bookedSlots,
  availabilityLoading,
  availabilityError,
  onRetry,
}: {
  weekIndex: number;
  selectedSlot: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectSlot: (slot: string) => void;
  confirmHref: string;
  onConfirm: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  submitting: boolean;
  error: string;
  bookedSlots: string[];
  availabilityLoading: boolean;
  availabilityError: string;
  onRetry: () => void;
}) {
  const currentWeek = weekSets[weekIndex];

  return (
    <section className="bk-reservation-step">
      <h2>
        <span>2.</span> Choix de la date &amp; heure
      </h2>
      <p className="booking-calendar-help">Choisis un horaire disponible. Sur mobile, fais défiler le calendrier horizontalement pour voir tous les jours.</p>
      <div className="bk-reservation-calendar-card" tabIndex={0} role="region" aria-label="Calendrier des horaires de démonstration" aria-busy={availabilityLoading}>
        {availabilityLoading ? <p className="bk-reservation-loading" role="status">Vérification des disponibilités…</p> : null}
        {availabilityError ? <div className="bk-reservation-inline-error"><p role="alert">{availabilityError}</p><button type="button" onClick={onRetry}>Réessayer les disponibilités</button></div> : null}
        <div className="bk-reservation-calendar-head">
          <button className="calendar-arrow" type="button" aria-label="Semaine precedente" data-calendar-prev onClick={onPrevWeek}>
            ‹
          </button>
          <div className="bk-reservation-days" data-multi-days>
            {currentWeek.map((item) => (
              <div className="bk-reservation-day" key={`${item.day}-${item.date}`}>
                <strong>{item.day}</strong>
                <span>{item.date}</span>
              </div>
            ))}
          </div>
          <button className="calendar-arrow" type="button" aria-label="Semaine suivante" data-calendar-next onClick={onNextWeek}>
            ›
          </button>
        </div>
        <div className="bk-reservation-slots-grid" data-multi-slots-grid>
          {currentWeek.map((item) => (
            <div className="bk-reservation-slot-column" key={`${item.day}-${item.date}-slots`}>
              {item.slots.length ? (
                item.slots.map((slot) => (
                  <button
                    key={`${item.day}-${slot}`}
                    className={`bk-reservation-slot${slot === selectedSlot ? " is-selected" : ""}${bookedSlots.includes(slot) ? " is-booked" : ""}`}
                    type="button"
                    aria-label={`${item.day} ${item.date}, ${slot}${bookedSlots.includes(slot) ? ", indisponible" : ""}`}
                    aria-pressed={slot === selectedSlot}
                    data-slot={slot}
                    data-slot-booked={bookedSlots.includes(slot) ? "true" : "false"}
                    disabled={bookedSlots.includes(slot)}
                    onClick={() => onSelectSlot(slot)}
                  >
                    {bookedSlots.includes(slot) ? `${slot} (pris)` : slot}
                  </button>
                ))
              ) : (
                <button className="bk-reservation-slot" type="button" disabled>
                  -
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bk-reservation-cta-row">
        <a
          className="bk-reservation-confirm-button"
          href={confirmHref}
          data-multi-confirm
          aria-busy={submitting}
          aria-disabled={Boolean(availabilityError) || availabilityLoading || submitting || !selectedSlot || bookedSlots.includes(selectedSlot)}
          onClick={onConfirm}
        >
          {submitting ? "Envoi de la demande…" : availabilityLoading ? "Vérification…" : "Envoyer ma demande"}
        </a>
      </div>
      {error ? <p role="alert" className="bk-reservation-error">{error}</p> : null}
    </section>
  );
}


export function ChoixCoachCreneauLegacyPage({
  demo,
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
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const displayPrice = price.includes("€") ? price : `${price.trim()} €`;
  const serviceMeta = [duration, displayPrice, format, objective, packageLabel].filter(Boolean).join(" · ");

  useEffect(() => {
    setAvailabilityLoading(true);
    setAvailabilityError("");
    fetch(`/api/reservations?coachId=${encodeURIComponent(coach)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Disponibilités indisponibles"))))
      .then((payload) => {
        const slots = (payload.data as Array<{ status: string; slots: string[] }>)
          .filter((item) => ["requested", "accepted", "paid"].includes(item.status))
          .flatMap((item) => item.slots);
        setBookedSlots(slots);
        setSelectedSlot((current) => (slots.includes(current) ? "" : current));
      })
    .catch(() => {
      setBookedSlots([]);
      setAvailabilityError("Les disponibilités n’ont pas pu être vérifiées. Vous pouvez réessayer.");
    })
    .finally(() => setAvailabilityLoading(false));
  }, [coach, availabilityAttempt]);

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

  async function handleConfirm(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (submitting) return;
    if (availabilityError) {
      setError("Réessayez la vérification des disponibilités avant d’envoyer votre demande.");
      return;
    }
    if (availabilityLoading) {
      setError("Patientez pendant la vérification des disponibilités.");
      return;
    }
    if (!selectedSlot || bookedSlots.includes(selectedSlot)) {
      setError("Sélectionnez un créneau disponible.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach,
          service,
          duration,
          price: Number(price.replace(/[^0-9.,]/g, "").replace(",", ".")) || undefined,
          slots: [selectedSlot],
        }),
      });

      if (!response.ok) throw new Error("La demande n'a pas pu être envoyée.");
      const payload = await response.json();
      window.location.href = buildNextPath(nextRoutes.recap, {
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
         reservationId: payload.data.id,
         claimToken: payload.data.claimToken,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "La demande n'a pas pu être envoyée.");
      setSubmitting(false);
    }
  }

  return (
    <DiscoveryFrame page="slot" demo={demo}>
      <div id="gym-booking" className="bk-reservation-shell">

        <main className="bk-reservation-page bk-reservation-page-wide" data-reservation-multi-page>
          <p className="booking-eyebrow">01 / LA DEMANDE DE SÉANCE</p>
          <ReservationMainHeader coach={coach} city={city} />
          <p className="booking-note">Calendrier de démonstration : les dates de mars et avril 2026 et les mentors ci-dessous sont des exemples. Ces horaires ne permettent pas de réserver une séance réelle.</p>
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
            onSelectSlot={(slot) => {
              setSelectedSlot(slot);
              setError("");
            }}
            confirmHref={confirmHref}
            onConfirm={handleConfirm}
            submitting={submitting}
            error={error}
            bookedSlots={bookedSlots}
            availabilityLoading={availabilityLoading}
            availabilityError={availabilityError}
            onRetry={() => setAvailabilityAttempt(current => current + 1)}
          />
        </main>

      </div>
    </DiscoveryFrame>
  );
}
