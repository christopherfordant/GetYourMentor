"use client";
import { formatBookingSlot } from "@/lib/domain/booking-time";
import { useEffect, useState } from "react";
import type { StructureOffer } from "@/lib/structure-offers";
import styles from "./group-booking.module.css";
type Offer = Omit<StructureOffer, "ownerEmail"> & { individualPrice?: number; coachName?: string; availability?: Array<{ slot: string; remaining: number }>; groupPrices?: Array<{ participantCount: number; totalCents: number }> };
type Person = { firstName: string; lastName: string; age: string; email: string };
const emptyPerson = (): Person => ({ firstName: "", lastName: "", age: "", email: "" });
function OfferBooking({ offer }: { offer: Offer }) {
  const [count, setCount] = useState(1);
  const [people, setPeople] = useState<Person[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const places = (slot: string) => offer.availability?.find(a => a.slot === slot)?.remaining ?? offer.capacity ?? 1;
  const future = offer.slots.filter(s => Date.parse(s) > Date.now() && places(s) > 0);
  const [slot, setSlot] = useState(() => future[0] ?? "");
  const remaining = places(slot);
  const total = count === 1 ? offer.individualPrice : (offer.groupPrices?.find(p => p.participantCount === count)?.totalCents ?? NaN) / 100;
  const visible = people.slice(0, Math.max(0, count - 1));
  function resize(next: number) {
    if (!Number.isInteger(next) || next < 1 || next > Math.min(remaining, 50)) return;
    setCount(next); setPeople(previous => Array.from({ length: Math.max(previous.length, next - 1) }, (_, i) => previous[i] ?? emptyPerson()));
  }
  async function reserve(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ structureOfferId: offer.id, slots: [values.get("slot")], participantCount: count, additionalParticipants: visible.map(p => ({ ...p, age: Number(p.age) })) }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error);
      window.location.assign("/compte?mode=sportif#account-content");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Demande impossible"); setBusy(false); }
  }
  return <article className={styles.card} data-structure-offer={offer.id}><h2>{offer.title}</h2>{offer.coachName ? <p>Coach : {offer.coachName}</p> : null}{offer.location ? <p>Lieu : {offer.location}</p> : null}<p>{offer.duration} · {offer.capacity ?? 1} place(s) au total · Horaires Europe/Paris</p>{!future.length ? <p>Aucun créneau futur avec des places disponibles.</p> : <form onSubmit={reserve}>
    <label>Créneau proposé<select name="slot" value={slot} onChange={e => setSlot(e.target.value)} required>{future.map(slot => <option key={slot} value={slot}>{formatBookingSlot(slot)} · {places(slot)} place(s) disponible(s)</option>)}</select></label>
    <label>Nombre de participants, vous compris<input type="number" min="1" max={Math.min(remaining, 50)} value={count} onChange={e => resize(Number(e.target.value))} required /></label>
    {visible.map((person, i) => <fieldset key={i}><legend>Participant {i + 2}</legend><div className={styles.fields}>{([['firstName','Prénom'],['lastName','Nom'],['age','Âge'],['email','Email']] as const).map(([key, label]) => <label key={key}>{label}<input type={key === 'age' ? 'number' : key === 'email' ? 'email' : 'text'} min={key === 'age' ? 0 : undefined} max={key === 'age' ? 120 : undefined} maxLength={key === 'email' ? 254 : 80} value={person[key]} autoComplete="off" required onChange={e => setPeople(previous => previous.map((p,index) => index === i ? { ...p, [key]: e.target.value } : p))} /></label>)}</div></fieldset>)}
    {visible.some(p => p.age !== '' && Number(p.age) < 18) ? <p className={styles.note}>Démonstration : les conditions d’encadrement des mineurs restent à valider. Aucune autorisation parentale réelle n’est recueillie ou réputée acquise.</p> : null}
    {count > 1 ? <p>Une demande pour {count} participants, soit {count} places. Aucun compte ni email automatique n’est créé pour les personnes supplémentaires.</p> : null}
    <p className={styles.note} data-group-total>{Number.isFinite(total) && total! > 0 ? `Montant total : ${total!.toFixed(2)} EUR${count > 1 ? ' pour le groupe' : ''}. Paiement simulé après acceptation du coach.` : 'Le coach doit définir un tarif total pour cette taille de groupe.'}</p>
    <button disabled={busy || !Number.isFinite(total) || total! <= 0 || count > remaining}>{busy ? "Envoi…" : count === 1 ? "Demander ce créneau" : "Demander pour mon groupe"}</button>
  </form>}{message ? <p role="alert">{message} <a href="/compte?mode=sportif">Mon compte sportif</a></p> : null}</article>;
}
export function StructureOffers({ coachId }: { coachId?: string } = {}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch(coachId ? `/api/coaches/sessions?coachId=${encodeURIComponent(coachId)}` : "/api/structures/offers").then(async r => { if (!r.ok) throw new Error("Séances indisponibles. Rechargez la page pour réessayer."); setOffers((await r.json()).data); }).catch(e => setMessage(e.message)).finally(() => setLoading(false)); }, [coachId]);
  return <section data-public-structure-offers>{loading ? <p role="status">Chargement des séances…</p> : message ? <p role="alert">{message}</p> : !offers.length ? <p>Aucune séance proposée pour le moment.</p> : offers.map(offer => <OfferBooking key={offer.id} offer={offer} />)}</section>;
}
