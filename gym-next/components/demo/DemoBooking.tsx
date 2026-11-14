"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./DemoBooking.module.css";

type Slot = { key: string; dayOffset: number; startsAtUtc: string; durationMinutes: number };
type Coach = { fixtureKey: string; name: string; sport: string; city: string; service: string; priceCents: number; slots: Slot[] };
type Reservation = { id: string; coachName: string; sport: string; service: string; appointmentAt: string; status: "accepted"; approvalMode: "simulated"; priceCents: number; paymentStatus: "not_started" | "simulated_confirmed"; createdAt: string };
type ApiFailure = { error?: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json().catch(() => ({})) as T & ApiFailure;
  if (!response.ok) throw new Error(body.error || "Une erreur est survenue. Réessayez.");
  return body;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatTemplate(slot: Slot) {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + slot.dayOffset));
  const day = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(date);
  const time = slot.startsAtUtc.slice(0, 5);
  return `${day} à ${time} UTC · ${slot.durationMinutes} min`;
}

function formatAppointment(value: string) {
  return `${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" }).format(new Date(value))} UTC`;
}

export default function DemoBooking() {
  const [active, setActive] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [coachKey, setCoachKey] = useState("");
  const [slotKey, setSlotKey] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPrivateState = useCallback(async () => {
    const session = await request<{ active: boolean }>("/api/demo/session");
    setActive(session.active);
    if (!session.active) {
      setCoaches([]);
      setReservations([]);
      return;
    }
    const [catalog, mine] = await Promise.all([
      request<{ coaches: Coach[] }>("/api/demo/catalog"),
      request<{ reservations: Reservation[] }>("/api/demo/reservations"),
    ]);
    setCoaches(catalog.coaches);
    setReservations(mine.reservations);
    setCoachKey((current) => current || catalog.coaches[0]?.fixtureKey || "");
    setSlotKey((current) => current || catalog.coaches[0]?.slots[0]?.key || "");
  }, []);

  useEffect(() => {
    let mounted = true;
    void loadPrivateState().catch((cause: unknown) => {
      if (mounted) setError(cause instanceof Error ? cause.message : "La démonstration est indisponible.");
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [loadPrivateState]);

  const selectedCoach = useMemo(() => coaches.find((coach) => coach.fixtureKey === coachKey), [coaches, coachKey]);
  const selectedSlot = useMemo(() => selectedCoach?.slots.find((slot) => slot.key === slotKey), [selectedCoach, slotKey]);
  const resetKey = () => setIdempotencyKey(crypto.randomUUID());

  async function start() {
    setBusy(true); setError(""); setNotice("");
    try {
      await request("/api/demo/session", { method: "POST", body: "{}" });
      await loadPrivateState();
      setNotice("Votre session de démonstration est prête. Elle est conservée sur cet appareil pendant 24 heures.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Impossible de démarrer la session."); }
    finally { setBusy(false); }
  }

  async function book() {
    if (!selectedCoach || !selectedSlot) return;
    setBusy(true); setError(""); setNotice("");
    const key = idempotencyKey || crypto.randomUUID();
    setIdempotencyKey(key);
    try {
      await request("/api/demo/reservations", { method: "POST", body: JSON.stringify({ fixtureKey: selectedCoach.fixtureKey, slotKey: selectedSlot.key, idempotencyKey: key }) });
      await loadPrivateState();
      setNotice("La réservation de démonstration a été acceptée automatiquement. Vous pouvez maintenant confirmer le paiement simulé.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "La réservation n’a pas abouti."); }
    finally { setBusy(false); }
  }

  async function pay(reservationId: string) {
    setBusy(true); setError(""); setNotice("");
    try {
      await request("/api/demo/payment", { method: "POST", body: JSON.stringify({ reservationId }) });
      await loadPrivateState();
      setNotice("Paiement de démonstration confirmé. Aucun paiement réel n’a été effectué.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Le paiement de démonstration n’a pas abouti."); }
    finally { setBusy(false); }
  }

  async function erase() {
    if (!window.confirm("Effacer cette session et ses réservations de démonstration ? Les profils fictifs partagés seront conservés.")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await request("/api/demo/session", { method: "DELETE", body: "{}" });
      setActive(false); setCoaches([]); setReservations([]); setCoachKey(""); setSlotKey(""); setIdempotencyKey("");
      setNotice("Votre session et ses données ont été effacées. Les profils fictifs partagés ont été conservés.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "L’effacement n’a pas pu être confirmé."); }
    finally { setBusy(false); }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <a className={styles.back} href="/">← Retour à GetYourMentor</a>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>PARCOURS SPORTIF · ENVIRONNEMENT DE DÉMONSTRATION</p>
          <h1>Réserver une séance, étape par étape</h1>
          <p>Choisissez un coach fictif et un créneau, observez l’acceptation de démonstration, puis terminez par un paiement simulé.</p>
          <div className={styles.notice}><strong>Aucun paiement réel.</strong> Aucune carte bancaire n’est demandée. L’acceptation est automatique et simulée ; aucun coach réel ni aucune IA ne prennent de décision.</div>
        </header>

        {error && <p className={styles.error} role="alert">{error}</p>}
        {notice && <p className={styles.success} role="status">{notice}</p>}
        {loading ? <p className={styles.status} role="status">Vérification de votre session…</p> : !active ? (
          <section className={styles.startCard} aria-labelledby="start-title">
            <span className={styles.step}>01</span>
            <div><h2 id="start-title">Démarrer votre session de test</h2><p>Une session anonyme et isolée permet de retrouver vos réservations sur cet appareil. Elle expire après 24 heures et peut être effacée à tout moment.</p></div>
            <button className={styles.primary} onClick={start} disabled={busy}>{busy ? "Préparation…" : "Commencer le parcours"}</button>
          </section>
        ) : (
          <div className={styles.columns}>
            <section className={styles.panel} aria-labelledby="choose-title">
              <span className={styles.step}>02</span><h2 id="choose-title">Choisir un coach fictif</h2>
              {coaches.length === 0 ? <p>Aucun coach fictif n’est actuellement disponible dans le catalogue de démonstration.</p> : <>
                <label className={styles.label} htmlFor="coach">Coach de démonstration</label>
                <select id="coach" className={styles.select} value={coachKey} onChange={(event) => { setCoachKey(event.target.value); setSlotKey(coaches.find((item) => item.fixtureKey === event.target.value)?.slots[0]?.key ?? ""); resetKey(); }}>
                  {coaches.map((coach) => <option key={coach.fixtureKey} value={coach.fixtureKey}>{coach.name} · {coach.sport}</option>)}
                </select>
                {selectedCoach && <div className={styles.coachCard}><div className={styles.avatar} aria-hidden="true">{selectedCoach.sport.slice(0, 1)}</div><div><h3>{selectedCoach.name}</h3><p>{selectedCoach.service} · {selectedCoach.city}</p></div><strong>{formatPrice(selectedCoach.priceCents)}<small> / séance</small></strong></div>}
                <h3 className={styles.subheading}>Choisir un créneau</h3>
                {!selectedCoach?.slots.length ? <p>Aucun créneau de démonstration disponible pour ce coach.</p> : <div className={styles.slotList} role="radiogroup" aria-label="Créneaux de démonstration">
                  {selectedCoach.slots.map((slot) => <label key={slot.key} className={`${styles.slot} ${slotKey === slot.key ? styles.slotSelected : ""}`}><input type="radio" name="slot" value={slot.key} checked={slotKey === slot.key} onChange={() => { setSlotKey(slot.key); resetKey(); }} /><span>{formatTemplate(slot)}</span></label>)}
                </div>}
                <button className={styles.primary} onClick={book} disabled={busy || !selectedSlot}>{busy ? "Réservation…" : "Demander et accepter la réservation de démonstration"}</button>
                <p className={styles.helper}>Le serveur crée ou réutilise un acteur fictif stable et accepte la demande selon une règle de démonstration.</p>
              </>}
            </section>

            <section className={styles.panel} aria-labelledby="reservations-title">
              <span className={styles.step}>03</span><h2 id="reservations-title">Votre réservation et le paiement</h2>
              {reservations.length === 0 ? <p className={styles.empty}>Votre réservation apparaîtra ici après le choix du créneau.</p> : <div className={styles.reservations}>
                {reservations.map((reservation) => <article key={reservation.id} className={styles.reservation}>
                  <div className={styles.reservationHeader}><div><h3>{reservation.sport} avec {reservation.coachName}</h3><p>{reservation.service}</p></div><span className={styles.badge}>Acceptée · simulation</span></div>
                  <p><strong>Créneau :</strong> {formatAppointment(reservation.appointmentAt)}</p><p><strong>Montant affiché :</strong> {formatPrice(reservation.priceCents)}</p>
                  {reservation.paymentStatus === "simulated_confirmed" ? <p className={styles.paid}>Paiement de démonstration confirmé. Aucun paiement réel n’a été effectué.</p> : <button className={styles.primary} onClick={() => pay(reservation.id)} disabled={busy}>Confirmer le paiement simulé</button>}
                </article>)}
              </div>}
              <p className={styles.helper}>Le paiement ne contacte aucun prestataire et ne collecte aucune donnée de carte.</p>
            </section>
          </div>
        )}

        {active && <section className={styles.erase}><div><h2>Terminer votre essai</h2><p>Effacez les données de cette session. Les coachs fictifs communs à la démonstration ne seront pas supprimés.</p></div><button className={styles.secondary} onClick={erase} disabled={busy}>Effacer mes données de démonstration</button></section>}
        <footer className={styles.footer}>Démonstration isolée · Session temporaire de 24 h · Aucun paiement ni message externe</footer>
      </div>
    </main>
  );
}
