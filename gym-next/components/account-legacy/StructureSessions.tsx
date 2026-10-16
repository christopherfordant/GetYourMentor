"use client";
import { formatBookingSlot } from "@/lib/domain/booking-time";
import { useEffect, useState } from "react";
import styles from "@/components/group-booking.module.css";
import type { StructureOffer } from "@/lib/structure-offers";

type Summary = { id: string; coachName: string; service: string; slots: string[]; status: string; price: number; participantCount?: number; reservationCode?: string };

export function StructureSessions({ coach = false }: { coach?: boolean } = {}) {
  const [offers, setOffers] = useState<Omit<StructureOffer, "ownerEmail">[]>([]);
  const [reservations, setReservations] = useState<Summary[]>([]);
  const [coaches, setCoaches] = useState<Array<{ id: string; name: string }>>([]);
  const [coachId, setCoachId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      const [a, b, c] = await Promise.all([fetch(coach ? "/api/coaches/sessions?mine=1" : "/api/structures/offers?mine=1"), coach ? Promise.resolve(null) : fetch("/api/structures/reservations"), coach ? Promise.resolve(null) : fetch("/api/affiliations", { cache: "no-store" })]);
      if (!a.ok || (b && !b.ok) || (c && !c.ok)) throw new Error("Chargement du planning impossible");
      setOffers((await a.json()).data); if (b) setReservations((await b.json()).data);
      const active = c ? (await c.json()).data.filter((r: { status: string; structureConsent: boolean; coachConsent: boolean }) => r.status === "accepted" && r.structureConsent && r.coachConsent).map((r: { coachId: string; coachName: string }) => ({ id: r.coachId, name: r.coachName })) : [];
      setCoaches(active); setCoachId(previous => active.some((c: { id: string }) => c.id === previous) ? previous : active[0]?.id ?? "");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Planning indisponible"); }
  }
  useEffect(() => { void load(); const reload = () => { void load(); }; window.addEventListener("gym-affiliations-updated", reload); return () => window.removeEventListener("gym-affiliations-updated", reload); }, [coach]);
  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const values = new FormData(event.currentTarget);
    try {
      const slot = String(values.get("slot"));
      const response = await fetch(coach ? "/api/coaches/sessions" : "/api/structures/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(coach ? { location: values.get("location") } : { coachId }), title: values.get("title"), duration: coach ? `${values.get("duration")} minutes` : "1 heure", capacity: Number(values.get("capacity")), slots: [new Date(slot).toISOString()] }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error);
      await load(); setMessage("Séance publiée. Un élève peut maintenant la demander.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Publication impossible"); }
    finally { setBusy(false); }
  }
  return <section className={`account-dashboard-card ${coach ? styles.card : ""}`} id={coach ? "coach-sessions" : "structure-sessions"} data-structure-sessions={coach ? undefined : true} data-coach-sessions={coach ? true : undefined}>
    <h2>{coach ? "Mes séances collectives" : "Séances et planning de ma structure"}</h2>
    <p>{coach ? "Publiez une séance collective avec un lieu, une durée et une capacité. Aucune affiliation à une structure n’est nécessaire." : "Proposez une séance avec votre coach affilié."} L’élève fait sa demande, le coach accepte, puis l’élève paie. Vous suivez la réservation dans ce planning.</p>
    <p>{coach ? "Votre profil doit être validé pour publier une séance." : "Seuls les coachs ayant un accord réciproque peuvent être choisis."} Le tarif du coach sélectionné est appliqué ; aucun reversement réel n’est effectué en démo.</p>
    <form onSubmit={publish} data-structure-publish={!coach ? true : undefined} data-coach-publish={coach ? true : undefined}>
      {!coach ? <><label className="auth-field">Coach responsable<select name="coachId" value={coachId} onChange={e => setCoachId(e.target.value)} required disabled={busy || !coaches.length}><option value="">Choisir un coach affilié</option>{coaches.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
      {!coaches.length ? <p>Un accord réciproque avec un coach est nécessaire avant publication.</p> : null}</> : null}
      <label className="auth-field">Nom de la séance<input name="title" required maxLength={120} /></label>
      {coach ? <><label className="auth-field">Lieu de rendez-vous<input name="location" required maxLength={240} /></label><label className="auth-field">Durée en minutes<input name="duration" type="number" min="1" max="480" defaultValue="60" required /></label></> : null}
      <label className="auth-field">Créneau de la séance<input name="slot" type="datetime-local" required /></label>
      <label className="auth-field">Places disponibles<input name="capacity" type="number" min={coach ? 2 : 1} max="50" defaultValue={coach ? 4 : 1} required /></label>
      <p>Chaque participant occupe une place, y compris dans une réservation groupée. Saisie horaire dans le fuseau de votre appareil ; planning affiché en Europe/Paris.</p>
      <p>{coach ? "Sport issu du profil. Prix total selon les tarifs de groupe définis ci-dessus." : "Durée : 1 heure. Tarif du coach appliqué à la demande."}</p>
      <button type="submit" className="auth-primary" disabled={busy || (!coach && !coachId)}>{busy ? "Publication…" : "Publier la séance"}</button>
    </form>
    {message ? <p role="status">{message}</p> : null}
    {!coach ? <p><a href="/structures">Voir les séances proposées aux élèves</a></p> : null}
    <button className="auth-secondary" type="button" onClick={load}>Actualiser le planning</button>
    <h3>Mes séances proposées</h3>
    {offers.length ? offers.map((offer) => <article key={offer.id}><strong>{offer.title}</strong><p>Capacité : {offer.capacity ?? 1} place(s) · {offer.duration}</p>{offer.location ? <p>{offer.location}</p> : null}{coach ? <a href={`/coach?coach=${encodeURIComponent(offer.coachId)}#collective-sessions`}>Voir la séance sur ma fiche</a> : null}<p>{offer.slots.map((s) => formatBookingSlot(s)).join(" · ")}</p></article>) : <p>Aucune séance publiée.</p>}
    {!coach ? <><h3>Demandes et paiements des élèves</h3>
    {reservations.length ? reservations.map((r) => <article key={r.id} data-structure-reservation={r.id}><strong>{r.service}</strong><p>{r.coachName} · {r.price} EUR</p><p>{r.slots.map((s) => formatBookingSlot(s)).join(" · ")}</p><p>{r.participantCount ?? 1} participant(s)</p><p data-structure-status>Statut : {r.status}</p>{r.reservationCode ? <p>Code : {r.reservationCode}</p> : null}</article>) : <p>Aucune demande pour vos séances.</p>}</> : <p>Retrouvez les demandes, paiements simulés et réservations dans les sections habituelles de votre compte.</p>}
  </section>;
}
