"use client";
import { formatBookingSlot } from "@/lib/domain/booking-time";

import { useEffect, useState } from "react";
import type { Reservation } from "@/lib/domain";
import { MessageInbox } from "@/components/account-legacy/MessageInbox";
import { ReservationReview } from "@/components/account-legacy/ReservationReview";

export function AthleteDashboard({ demo = false }: { demo?: boolean }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [reviewsReady, setReviewsReady] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reviews", { signal: controller.signal, cache: "no-store" }).then(async response => { if (!response.ok) throw new Error(); return response.json(); }).then(payload => { if (!Array.isArray(payload.data)) throw new Error(); setReviewIds(payload.data.map((row: { reservationId: string }) => row.reservationId)); setReviewsReady(true); }).catch(() => { if (!controller.signal.aborted) setReviewsReady(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetch("/api/reservations")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Chargement impossible"))))
      .then((payload) => setReservations(payload.data as Reservation[]))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, []);

  const paidCount = reservations.filter((item) => item.status === "paid").length;
  const target = 5;
  const progress = Math.min(paidCount, target);

  async function cancel(id: string) {
    setError("");
    const response = await fetch(`/api/reservations/${id}/cancel`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Annulation impossible");
      return;
    }
    setReservations((current) => current.map((item) => item.id === id ? payload.data : item));
  }

  async function reschedule(id: string, input: HTMLInputElement) {
    setError("");
    const slot = input.value.trim();
    if (!slot) {
      setError("Indiquez un nouveau créneau.");
      return;
    }
    const response = await fetch(`/api/reservations/${id}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots: [new Date(slot).toISOString()] }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Déplacement impossible");
      return;
    }
    setReservations((current) => current.map((item) => item.id === id ? payload.data : item));
    input.value = "";
  }

  function searchNearby(radiusKm: number) {
    if (!navigator.geolocation) {
      setLocationStatus("La géolocalisation n’est pas disponible sur cet appareil.");
      return;
    }
    setLocationStatus("Recherche de coachs à proximité…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const query = new URLSearchParams({ latitude: String(coords.latitude), longitude: String(coords.longitude), radiusKm: String(radiusKm) });
        window.location.assign(`/coachs?${query.toString()}`);
      },
      () => setLocationStatus("Autorisez la position pour rechercher les coachs autour de vous."),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 },
    );
  }

  return (
    <section className="account-dashboard athlete-home" data-athlete-dashboard>
      <div className="account-dashboard-card">
        <p>Mon espace sportif</p>
        <h1>Bienvenue sur GetYourMentor</h1>
        <p>Retrouvez vos demandes, vos séances confirmées et votre progression.</p>
      </div>
      <section className="account-dashboard-card" data-loyalty-card>
        <h2>{demo ? "Fidélité — aperçu de démonstration" : "Mes séances payées"}</h2>
        <p data-loyalty-count>{loading ? "Chargement..." : `${paidCount} séance${paidCount > 1 ? "s" : ""} payée${paidCount > 1 ? "s" : ""}`}</p>
        {demo ? <progress max={target} value={progress} aria-label="Progression fidélité de démonstration" /> : null}
        {demo ? <p>Palier indicatif de {target} paiements simulés : {progress}/{target}. Aucun avantage commercial ni réduction n’est activé.</p> : null}
      </section>
      <section className="account-dashboard-card" data-athlete-location>
        <h2>Trouver un coach près de moi</h2>
        <p>Utilisez votre position pour afficher les coachs vérifiés dans votre rayon.</p>
        <div className="account-inline-actions">
          {[1, 5, 10].map((radiusKm) => <button className="auth-secondary" type="button" key={radiusKm} onClick={() => searchNearby(radiusKm)}>{radiusKm} km</button>)}
        </div>
        {locationStatus ? <p role="status">{locationStatus}</p> : null}
      </section>
      <section className="account-dashboard-card" data-athlete-reservations>
        <h2>Mes réservations</h2>
        {error ? <p role="alert">{error}</p> : null}
        {loading ? <p>Chargement...</p> : reservations.length === 0 ? <p>Aucune réservation pour le moment.</p> : reservations.map((reservation) => (
          <article key={reservation.id} data-athlete-reservation={reservation.id}>
            <strong>{reservation.service}</strong>
            <span>{reservation.coachName} · {reservation.price} EUR</span>
            {(reservation.participantCount ?? 1) > 1 ? <details><summary>{reservation.participantCount} participants · prix total du groupe</summary><p>Vous êtes le réservant et participez à la séance.</p><ul>{reservation.additionalParticipants?.map((person, i) => <li key={i}>{person.firstName} {person.lastName} · {person.age} ans · {person.email}</li>)}</ul><p>L’annulation concerne le groupe entier.</p></details> : null}
            <span>{reservation.slots.map(formatBookingSlot).join(" · ")} · Europe/Paris</span>
            <span data-athlete-reservation-status>Statut : {reservation.status}</span>
            {reservation.reservationCode ? <span>Code : {reservation.reservationCode}</span> : null}
            {reservation.status === "accepted" ? <a className="reservation-payment-link" href={`/paiement?reservationId=${encodeURIComponent(reservation.id)}`}>Payer ma séance</a> : null}
            {reservation.status === "paid" || reservation.status === "accepted" || reservation.status === "requested" ? (
              <button type="button" onClick={() => cancel(reservation.id)}>Annuler la réservation</button>
            ) : null}
            {!reservation.structureOfferId && (reservation.status === "paid" || reservation.status === "accepted") ? (
              <div data-athlete-reschedule={reservation.id}>
                <input type="datetime-local" data-reschedule-slot placeholder="Nouveau créneau" aria-label="Nouveau créneau" />
                <button type="button" onClick={(event) => reschedule(reservation.id, event.currentTarget.parentElement?.querySelector<HTMLInputElement>("[data-reschedule-slot]") as HTMLInputElement)}>Déplacer</button>
              </div>
            ) : null}
            {reservation.status === "cancelled" ? <span>Remboursement : {reservation.refundPercent ?? 0}% ({reservation.refundAmount ?? 0} EUR)</span> : null}
            {reservation.status === "paid" ? <ReservationReview reservation={reservation} reviewed={reviewIds.includes(reservation.id)} ready={reviewsReady} onCreated={() => setReviewIds(ids => [...ids, reservation.id])} /> : null}
          </article>
        ))}
      </section>
      <MessageInbox />
    </section>
  );
}
