"use client";
import { formatBookingSlot } from "@/lib/domain/booking-time";

import { useEffect, useState } from "react";
import type { Reservation } from "@/lib/domain";

export function CoachRequestsPanel({ coachName, onReservationsChanged }: { coachName: string; onReservationsChanged?: (reservations: Reservation[]) => void }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
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
        onReservationsChanged?.(coachReservations);
      })
      .catch((requestError) => active && setError(requestError instanceof Error ? requestError.message : "Chargement impossible"))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [coachName, onReservationsChanged]);

  async function transition(id: string, status: "accepted" | "rejected") {
    setError("");
    const response = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(status === "accepted" ? { appointmentAt: selectedSlots[id] ?? reservations.find(r => r.id === id)?.slots[0] } : {}) }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Action impossible");
      return;
    }
    const updated = reservations.map((reservation) => reservation.id === id ? payload.data : reservation);
    setReservations(updated); onReservationsChanged?.(updated);
  }

  async function refresh() {
    setError("");
    try {
      const response = await fetch("/api/reservations");
      if (!response.ok) throw new Error("Actualisation impossible");
      const updated = (await response.json()).data;
      setReservations(updated); onReservationsChanged?.(updated);
    } catch (error) { setError(error instanceof Error ? error.message : "Actualisation impossible"); }
  }

  return (
    <section className="account-dashboard-card coach-home-requests" id="coach-requests" data-coach-requests>
      <div className="coach-home-card-head">
        <h3>Demandes de réservation</h3>
        <span>{loading ? "Chargement..." : `${reservations.filter((item) => item.status === "requested").length} à traiter`}</span>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <p>Acceptez une demande pour permettre à l’élève de payer, puis actualisez pour suivre sa confirmation. Aucun encaissement n’est demandé au coach.</p>
      <button type="button" onClick={refresh}>Actualiser les demandes et paiements</button>
      {!loading && reservations.length === 0 ? <p data-coach-empty>Aucune demande en attente.</p> : null}
      <div className="coach-home-request-list">
        {reservations.map((reservation) => (
          <article key={reservation.id} data-coach-request={reservation.id}>
            <strong>{reservation.service}</strong>
            <span>{reservation.slots.map(formatBookingSlot).join(" · ")} — {reservation.price} EUR</span>
            <span data-request-status>Statut : {reservation.status}</span>
            {reservation.status === "accepted" ? <span>En attente du paiement de l’élève</span> : null}
            {reservation.status === "paid" ? <span>Paiement élève confirmé. {reservation.financials ? `Part coach : ${(reservation.financials.coachAmountCents / 100).toFixed(2)} EUR ; commission historique : ${reservation.financials.commissionBps / 100} %.` : ""} Aucun reversement bancaire n’est effectué en démo.</span> : null}
            {reservation.reservationCode ? <span>Code : {reservation.reservationCode}</span> : null}
            {reservation.status === "requested" ? (
              <div>
                {reservation.slots.length > 1 ? <label>Créneau à confirmer<select aria-label={`Créneau à confirmer ${reservation.id}`} value={selectedSlots[reservation.id] ?? reservation.slots[0]} onChange={event => setSelectedSlots(current => ({ ...current, [reservation.id]: event.target.value }))}>{reservation.slots.map(slot => <option key={slot} value={slot}>{formatBookingSlot(slot)}</option>)}</select></label> : null}
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
