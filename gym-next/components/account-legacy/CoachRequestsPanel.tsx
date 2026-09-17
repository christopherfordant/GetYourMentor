"use client";

import { useEffect, useState } from "react";
import type { Reservation } from "@/lib/domain";

export function CoachRequestsPanel({ coachName }: { coachName: string }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/reservations")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Chargement impossible"))))
      .then((payload) => {
        if (!active) return;
        const coachReservations = (payload.data as Reservation[]).filter(
          (reservation) => reservation.coachName.toLowerCase() === coachName.toLowerCase(),
        );
        setReservations(coachReservations);
      })
      .catch((requestError) => active && setError(requestError instanceof Error ? requestError.message : "Chargement impossible"))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [coachName]);

  async function transition(id: string, status: "accepted" | "rejected") {
    setError("");
    const response = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Action impossible");
      return;
    }
    setReservations((current) => current.map((reservation) => (reservation.id === id ? payload.data : reservation)));
  }

  return (
    <section className="account-dashboard-card coach-home-requests" id="coach-requests" data-coach-requests>
      <div className="coach-home-card-head">
        <h3>Demandes de réservation</h3>
        <span>{loading ? "Chargement..." : `${reservations.filter((item) => item.status === "requested").length} à traiter`}</span>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      {!loading && reservations.length === 0 ? <p data-coach-empty>Aucune demande en attente.</p> : null}
      <div className="coach-home-request-list">
        {reservations.map((reservation) => (
          <article key={reservation.id} data-coach-request={reservation.id}>
            <strong>{reservation.service}</strong>
            <span>{reservation.slots.join(" · ")} — {reservation.price} EUR</span>
            <span data-request-status>Statut : {reservation.status}</span>
            {reservation.reservationCode ? <span>Code : {reservation.reservationCode}</span> : null}
            {reservation.status === "requested" ? (
              <div>
                <button type="button" onClick={() => transition(reservation.id, "accepted")}>Accepter</button>
                <button type="button" onClick={() => transition(reservation.id, "rejected")}>Refuser</button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
