"use client";
import { formatBookingSlot } from "@/lib/domain/booking-time";
import { useEffect, useState } from "react";
import type { StructureOffer } from "@/lib/structure-offers";
export function StructureOffers() {
  const [offers, setOffers] = useState<Omit<StructureOffer, "ownerEmail">[]>([]);
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { fetch("/api/structures/offers").then(async (r) => { if (!r.ok) throw new Error("Séances indisponibles"); setOffers((await r.json()).data); }).catch((e) => setMessage(e.message)); }, []);
  async function reserve(offer: Omit<StructureOffer, "ownerEmail">, slot: string) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ structureOfferId: offer.id, slots: [slot] }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error);
      window.location.assign("/compte?mode=sportif#account-content");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Demande impossible"); setBusy(false); }
  }
  return <section data-public-structure-offers>{message ? <p role="status">{message} <a href="/compte?mode=sportif">Se connecter comme élève</a></p> : null}
    {!offers.length && !message ? <p>Une structure peut publier sa séance depuis son compte.</p> : null}
    {offers.map((offer) => <article className="account-dashboard-card" key={offer.id} data-structure-offer={offer.id}><h2>{offer.title}</h2><p>Coach affilié : Steven Fordant · {offer.duration} · {offer.capacity ?? 1} place(s) · Europe/Paris</p>{offer.slots.filter((s) => Date.parse(s) > Date.now()).map((slot) => <p key={slot}>{formatBookingSlot(slot)} <button type="button" disabled={busy} onClick={() => reserve(offer, slot)}>Demander ce créneau</button></p>)}</article>)}
  </section>;
}
