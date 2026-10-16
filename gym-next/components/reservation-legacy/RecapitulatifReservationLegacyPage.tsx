"use client";

import { formatBookingSlot } from "@/lib/domain/booking-time";
import { useMemo } from "react";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";
import { DiscoveryFrame } from "@/components/discovery/DiscoveryFrame";

type RecapitulatifReservationLegacyPageProps = {
  demo: boolean;
  params: Record<string, string | undefined>;
};

function RecapMainHeader({
  coach,
  city,
}: {
  coach: string;
  city: string;
}) {
  return (
    <section className="bk-recap-header">
      <h1 data-recap-name>{coach}</h1>
      <div className="bk-recap-address" data-recap-address>{city}</div>
      <div className="bk-recap-meta" data-recap-meta>Vérifie ta demande avant de retrouver son suivi dans ton compte.</div>
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

  return (
    <section className="bk-recap-step">
      <h2>
        <span>1.</span> Séance sélectionnée
      </h2>
      <div className="bk-recap-cards" data-recap-services>
        <article className="bk-recap-service-card">
          <div className="bk-recap-service-copy">
            <strong>{service}</strong>
            <div>{`${duration} · ${price.includes("€") ? price : `${price.trim()} €`} · avec ${mentor}`}</div>
            {sport === "metiers-de-la-forme" ? (
              <div>{[format, objective, packageLabel].filter(Boolean).join(" • ")}</div>
            ) : null}
          </div>
          <a className="bk-recap-link" href={removeHref}>
            Modifier la séance
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
    <section className="bk-recap-step">
      <h2>
        <span>2.</span> Horaire demandé
      </h2>
      <div className="bk-recap-date-card">
        <div data-recap-datetime>{`${formatBookingSlot(slot)} · Europe/Paris · Démonstration`}</div>
        <a href={editHref} className="bk-recap-link" data-recap-edit>
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
    <section className="bk-recap-step">
      <h2>
        <span>3.</span> Identification
      </h2>
      <div className="bk-recap-auth-card">
        <div className="bk-recap-auth-block">
          <h3>Nouveau sur GetYourMentor ?</h3>
          <a className="bk-recap-outline-button" href={accountRedirect} data-recap-create>
            Créer mon compte
          </a>
        </div>

        <div className="bk-recap-divider">
          <span>ou</span>
        </div>

        <div className="bk-recap-auth-block">
          <h3>Vous avez déjà utilisé GetYourMentor ?</h3>
          <a className="bk-recap-dark-button" href={accountRedirect} data-recap-login>
            Se connecter pour suivre ma demande
          </a>
        </div>
      </div>
    </section>
  );
}


export function RecapitulatifReservationLegacyPage({
  demo,
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
        reservationId: params.reservationId,
        claimToken: params.claimToken,
      }),
    [coach, city, duration, format, objective, packageLabel, params.claimToken, params.reservationId, price, slot, mentor, service, sport],
  );

  const accountRedirect = useMemo(
    () =>
      buildNextPath(nextRoutes.account, {
        redirect: "paiement",
        reservationId: params.reservationId,
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
        claimToken: params.claimToken,
      }),
    [coach, city, duration, format, objective, packageLabel, params.claimToken, params.reservationId, price, slot, mentor, service, sport],
  );

  return (
    <DiscoveryFrame page="recap" demo={demo}>
      <div id="gym-booking" className="bk-recap-shell">

        <main className="bk-recap-page" data-recap-page>
          <p className="booking-eyebrow">02 / LE RÉCAPITULATIF</p>
          <RecapMainHeader coach={coach} city={city} />
          <p className="booking-note">La demande doit être acceptée par le coach avant le paiement. Le montant de ta sélection sera vérifié avant tout paiement.</p>
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

      </div>
    </DiscoveryFrame>
  );
}
