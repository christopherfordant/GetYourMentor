"use client";

import { useEffect, useState } from "react";
import type { Reservation } from "@/lib/domain";
import { MessageInbox } from "@/components/account-legacy/MessageInbox";

export function AthleteDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

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
      body: JSON.stringify({ slots: [slot] }),
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
        <h2>Fidélité</h2>
        <p data-loyalty-count>{loading ? "Chargement..." : `${paidCount} séance${paidCount > 1 ? "s" : ""} payée${paidCount > 1 ? "s" : ""}`}</p>
        <progress max={target} value={progress} aria-label="Progression fidélité" />
        <p>{paidCount >= target ? "Avantage fidélité disponible." : `${target - progress} séance${target - progress > 1 ? "s" : ""} avant le prochain avantage.`}</p>
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
            <span data-athlete-reservation-status>Statut : {reservation.status}</span>
            {reservation.reservationCode ? <span>Code : {reservation.reservationCode}</span> : null}
            {reservation.status === "paid" || reservation.status === "accepted" || reservation.status === "requested" ? (
              <button type="button" onClick={() => cancel(reservation.id)}>Annuler la réservation</button>
            ) : null}
            {reservation.status === "paid" || reservation.status === "accepted" ? (
              <div data-athlete-reschedule={reservation.id}>
                <input type="text" data-reschedule-slot placeholder="Nouveau créneau" aria-label="Nouveau créneau" />
                <button type="button" onClick={(event) => reschedule(reservation.id, event.currentTarget.parentElement?.querySelector<HTMLInputElement>("[data-reschedule-slot]") as HTMLInputElement)}>Déplacer</button>
              </div>
            ) : null}
            {reservation.status === "cancelled" ? <span>Remboursement : {reservation.refundPercent ?? 0}% ({reservation.refundAmount ?? 0} EUR)</span> : null}
          </article>
        ))}
      </section>
      <MessageInbox />
    </section>
  );
}
