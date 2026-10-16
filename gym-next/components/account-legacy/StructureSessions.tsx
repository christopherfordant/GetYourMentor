"use client";
import { formatBookingSlot } from "@/lib/domain/booking-time";
import { useEffect, useState } from "react";
import type { StructureOffer } from "@/lib/structure-offers";

type Summary = { id: string; coachName: string; service: string; slots: string[]; status: string; price: number; reservationCode?: string };

export function StructureSessions() {
  const [offers, setOffers] = useState<Omit<StructureOffer, "ownerEmail">[]>([]);
  const [reservations, setReservations] = useState<Summary[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      const [a, b] = await Promise.all([fetch("/api/structures/offers?mine=1"), fetch("/api/structures/reservations")]);
      if (!a.ok || !b.ok) throw new Error("Chargement du planning impossible");
      setOffers((await a.json()).data); setReservations((await b.json()).data);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Planning indisponible"); }
  }
  useEffect(() => { void load(); }, []);
  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const values = new FormData(event.currentTarget);
    try {
      const slot = String(values.get("slot"));
      const response = await fetch("/api/structures/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: values.get("title"), duration: "1 heure", capacity: Number(values.get("capacity")), slots: [new Date(slot).toISOString()] }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error);
      await load(); setMessage("Séance publiée. Un élève peut maintenant la demander.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Publication impossible"); }
    finally { setBusy(false); }
  }
  return <section className="account-dashboard-card" id="structure-sessions" data-structure-sessions>
    <h2>Séances et planning de ma structure</h2>
    <p>Proposez une séance avec votre coach affilié. L’élève fait sa demande, le coach accepte, puis l’élève paie. Vous suivez la réservation dans ce planning.</p>
    <p>Démo : Steven Fordant est affilié au compte club@example.com. Les autres structures doivent d’abord faire valider leur affiliation. Le tarif et la commission proviennent du profil coach ; aucun reversement réel n’est effectué.</p>
    <form onSubmit={publish} data-structure-publish>
      <label className="auth-field">Nom de la séance<input name="title" required maxLength={120} /></label>
      <label className="auth-field">Créneau de la séance<input name="slot" type="datetime-local" required /></label>
      <label className="auth-field">Places disponibles<input name="capacity" type="number" min="1" max="50" defaultValue="1" required /></label>
      <p>Une demande = une place. Saisie horaire dans le fuseau de votre appareil ; planning affiché en Europe/Paris.</p>
      <p>Durée : 1 heure. Tarif du coach appliqué à la demande.</p>
      <button type="submit" className="auth-primary" disabled={busy}>{busy ? "Publication…" : "Publier la séance"}</button>
    </form>
    {message ? <p role="status">{message}</p> : null}
    <p><a href="/structures">Voir les séances proposées aux élèves</a></p>
    <button className="auth-secondary" type="button" onClick={load}>Actualiser le planning</button>
    <h3>Mes séances proposées</h3>
    {offers.length ? offers.map((offer) => <article key={offer.id}><strong>{offer.title}</strong><p>Capacité : {offer.capacity ?? 1} place(s)</p><p>{offer.slots.map((s) => formatBookingSlot(s)).join(" · ")}</p></article>) : <p>Aucune séance publiée.</p>}
    <h3>Demandes et paiements des élèves</h3>
    {reservations.length ? reservations.map((r) => <article key={r.id} data-structure-reservation={r.id}><strong>{r.service}</strong><p>{r.coachName} · {r.price} EUR</p><p>{r.slots.map((s) => formatBookingSlot(s)).join(" · ")}</p><p data-structure-status>Statut : {r.status}</p>{r.reservationCode ? <p>Code : {r.reservationCode}</p> : null}</article>) : <p>Aucune demande pour vos séances.</p>}
  </section>;
}
