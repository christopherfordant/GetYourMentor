"use client";
import { formatBookingSlot } from "@/lib/domain/booking-time";

import { useEffect, useMemo, useState } from "react";
import { ReviewForm } from "@/components/payment-legacy/ReviewForm";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";
import { LanguageSelector } from "@/components/common/LanguageSelector";

type PaiementLegacyPageProps = {
  legacyStyles: string;
  params: Record<string, string | undefined>;
  provider?: "local" | "stripe";
};

function PaymentHeader() {
  return (
    <header className="topbar topbar-light">
      <div className="brand-lockup">
        <a className="brand-name brand-link brand-name-dark" href={nextRoutes.home}>GetYourMentor</a>
      </div>

      <nav className="sports-nav sports-nav-dark" aria-label="Sports">
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=football`}>Football</a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=basketball`}>Basketball</a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>Fitness</a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=sports-de-combat`}>Sports de combat</a>
      </nav>

      <div className="topbar-actions">
        <LanguageSelector />
        <a className="topbar-link topbar-link-dark" href={`${nextRoutes.account}?mode=coach`}>Je suis coach</a>
        <a className="account-button" href={nextRoutes.account}>
          <span className="account-button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span>Mon compte</span>
        </a>
      </div>
    </header>
  );
}

function PaymentMain({
  selectedMethod,
  onSelectMethod,
  provider,
}: {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  provider: "local" | "stripe";
}) {
  return (
    <section className="payment-main">
      <div className="payment-intro">
        <p className="payment-kicker">Paiement securise</p>
        <h1>Finaliser votre reservation</h1>
        <p className="payment-subcopy">Choisissez votre mode de paiement pour confirmer votre seance GetYourMentor.</p>
        <div className="payment-intro-visual" aria-hidden="true">
          <div className="payment-intro-shot payment-intro-shot-main"></div>
          <div className="payment-intro-shot payment-intro-shot-secondary"></div>
          <div className="payment-intro-badge">Coach confirme</div>
        </div>
      </div>

      <section className="payment-card">
        <header className="payment-card-head">
          <h2>Moyen de paiement</h2>
          <p>{provider === "stripe" ? "Les coordonnées bancaires sont saisies uniquement sur la page sécurisée Stripe." : "Paiement de démonstration : aucun débit réel. Ne saisissez aucune donnée bancaire."}</p>
        </header>

        {provider === "local" ? <div className="payment-methods">
          <button className={`payment-method${selectedMethod === "card" ? " is-active" : ""}`} type="button" data-method="card" onClick={() => onSelectMethod("card")}>
            <strong>Carte bancaire</strong>
            <span>Visa, Mastercard, CB</span>
          </button>
          <button className={`payment-method${selectedMethod === "apple-pay" ? " is-active" : ""}`} type="button" data-method="apple-pay" onClick={() => onSelectMethod("apple-pay")}>
            <strong>Apple Pay</strong>
            <span>Paiement rapide</span>
          </button>
          <button className={`payment-method${selectedMethod === "google-pay" ? " is-active" : ""}`} type="button" data-method="google-pay" onClick={() => onSelectMethod("google-pay")}>
            <strong>Google Pay</strong>
            <span>Validation instantanee</span>
          </button>
          <button className={`payment-method${selectedMethod === "onsite" ? " is-active" : ""}`} type="button" data-method="onsite" onClick={() => onSelectMethod("onsite")}>
            <strong>Sur place</strong>
            <span>Selon les conditions du coach</span>
          </button>
        </div> : null}

        {provider === "local" ? <div className="payment-form">
          <label className="payment-field">
            <span>Nom sur la carte</span>
            <input type="text" defaultValue="Client fictif GetYourMentor" readOnly />
          </label>
          <label className="payment-field">
            <span>Numero de carte</span>
            <input type="text" defaultValue="4242 4242 4242 4242" readOnly />
          </label>
          <div className="payment-field-row">
            <label className="payment-field">
              <span>Expiration</span>
              <input type="text" defaultValue="12 / 28" readOnly />
            </label>
            <label className="payment-field">
              <span>CVC</span>
              <input type="text" defaultValue="123" readOnly />
            </label>
          </div>
          <label className="payment-checkbox">
            <input type="checkbox" defaultChecked />
            <span>J&apos;accepte les conditions de reservation du coach.</span>
          </label>
        </div> : null}
      </section>
    </section>
  );
}

function PaymentSide({
  coach,
  city,
  service,
  duration,
  format,
  objective,
  packageLabel,
  slot,
  price,
  mentor,
  selectedMethod,
  success,
  onSubmit,
  paymentReady,
  paymentError,
  reservationStatus,
  reservationCode,
  reservationId,
  processing,
  awaitingConfirmation,
  appointmentLabel,
}: {
  coach: string;
  city: string;
  service: string;
  duration: string;
  format: string;
  objective: string;
  packageLabel: string;
  slot: string;
  price: string;
  mentor: string;
  selectedMethod: string;
  success: boolean;
  onSubmit: () => void;
  paymentReady: boolean;
  paymentError: string;
  reservationStatus: string;
  reservationCode: string;
  reservationId: string;
  processing: boolean;
  awaitingConfirmation: boolean;
  appointmentLabel: string;
}) {
  const summaryDuration = [duration, format, objective, packageLabel].filter(Boolean).join(" • ");

  return (
    <aside className="payment-side">
      <section className="payment-summary-card">
        <div className="payment-summary-visual" aria-hidden="true"></div>
        <h2>Recapitulatif</h2>
        <div className="payment-summary-line">
          <span>Lieu / coach</span>
          <strong>{`${coach} - ${city}`}</strong>
        </div>
        <div className="payment-summary-line">
          <span>Seance</span>
          <strong>{service}</strong>
        </div>
        <div className="payment-summary-line">
          <span>Duree</span>
          <strong>{summaryDuration}</strong>
        </div>
        <div className="payment-summary-line">
          <span>Date</span>
          <strong>{appointmentLabel || slot}</strong>
        </div>
        <div className="payment-summary-line">
          <span>Coach retenu</span>
          <strong>{mentor}</strong>
        </div>
        <div className="payment-summary-total">
          <span>Total</span>
          <strong>{price}</strong>
        </div>
        <button
          className="payment-submit"
          type="button"
          disabled={!paymentReady || success || processing}
          aria-label={success ? (selectedMethod === "onsite" ? "Reservation enregistree" : "Paiement confirme") : undefined}
          onClick={onSubmit}
        >
          {processing ? "Traitement en cours…" : success ? (selectedMethod === "onsite" ? "Réservation enregistrée" : "Paiement confirmé") : paymentReady ? "Payer et confirmer" : "Paiement indisponible"}
        </button>
        <p className="payment-note" data-payment-status>
          {paymentError || (success ? "Paiement confirmé." : awaitingConfirmation ? "Confirmation en cours. Le retour de Stripe ne confirme pas encore votre réservation." : reservationStatus === "requested" ? "En attente de validation par le coach." : reservationStatus === "accepted" ? "Demande acceptée : vous pouvez payer." : "Réservation introuvable.")}
        </p>
        {reservationCode ? <p data-payment-code>Code de réservation : {reservationCode}</p> : null}
      </section>

      <section className="payment-success-card" hidden={!success}>
        <h3>Reservation confirmee</h3>
        <p>Votre paiement est valide et votre seance est confirmee.</p>
        <div className="payment-success-actions">
          <a className="payment-secondary-link" href={nextRoutes.home}>Retour a l&apos;accueil</a>
          <a className="payment-primary-link" href={nextRoutes.account}>Voir mon compte</a>
        </div>
        {reservationId ? <ReviewForm reservationId={reservationId} /> : null}
      </section>
    </aside>
  );
}

import { SiteFooter } from "@/components/SiteFooter";
function PaymentFooter() { return <SiteFooter />; }

export function PaiementLegacyPage({ legacyStyles, params, provider = "local" }: PaiementLegacyPageProps) {
  const [serverReservation, setServerReservation] = useState<{ coachName: string; city: string; service: string; duration: string; price: number; appointmentAt?: string; slots: string[] } | null>(null);
  const coach = serverReservation?.coachName || params.coach || "Studio Form Marseille";
  const city = serverReservation?.city || params.city || "Marseille";
  const service = serverReservation?.service || params.service || "Coaching remise en forme";
  const duration = serverReservation?.duration || params.duration || "30min";
  const price = serverReservation ? `${serverReservation.price.toFixed(2)} EUR` : params.price || "35 ";
  const objective = params.objective || "";
  const format = params.format || "";
  const packageLabel = params.package || "";
  const slot = params.slot || "10:00";
  const mentor = params.mentor || "Coach confirme";
  const reservationId = params.reservationId || "";
  const claimToken = params.claimToken || "";
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [success, setSuccess] = useState(false);
  const [reservationStatus, setReservationStatus] = useState("");
  const [reservationCode, setReservationCode] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [processing, setProcessing] = useState(false);
  const awaitingConfirmation = params.payment === "success" && !success;

  useEffect(() => {
    if (!reservationId) {
      setPaymentError("Cette réservation ne possède pas encore d’identifiant.");
      return;
    }

    fetch(`/api/reservations/${reservationId}?claimToken=${encodeURIComponent(claimToken)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Réservation introuvable."))))
      .then((payload) => {
        setServerReservation(payload.data);
        setReservationStatus(payload.data.status);
        setReservationCode(payload.data.reservationCode ?? "");
        if (payload.data.status === "paid") setSuccess(true);
      })
      .catch((error) => setPaymentError(error instanceof Error ? error.message : "Réservation introuvable."));
  }, [claimToken, reservationId]);

  useEffect(() => {
    if (!reservationId || params.payment !== "success") return;
    let attempts = 0;
    const interval = window.setInterval(async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/reservations/${reservationId}?claimToken=${encodeURIComponent(claimToken)}`);
        if (response.ok) {
          const payload = await response.json();
          setServerReservation(payload.data);
          setReservationStatus(payload.data.status);
          setReservationCode(payload.data.reservationCode ?? "");
          if (payload.data.status === "paid") { setSuccess(true); window.clearInterval(interval); }
        }
      } catch { /* Keep pending rather than claiming success on a network failure. */ }
      if (attempts >= 15) window.clearInterval(interval);
    }, 2000);
    return () => window.clearInterval(interval);
  }, [claimToken, params.payment, reservationId]);

  useEffect(() => {
    if (params.payment === "cancelled") setPaymentError("Le paiement a été annulé. Votre demande reste en attente.");
  }, [params.payment]);

  async function handlePayment() {
    if (!reservationId || processing) return;
    setProcessing(true);
    setPaymentError("");
    try {
      const response = await fetch(`/api/reservations/${reservationId}/payment`, {
        method: "POST",
        headers: claimToken ? { "x-reservation-claim-token": claimToken } : undefined,
      });
      const payload = await response.json();
      if (!response.ok) {
        setPaymentError(payload.error ?? "Paiement impossible.");
        return;
      }
      if (payload.data.checkoutUrl) {
        window.location.assign(payload.data.checkoutUrl);
        return;
      }
      setReservationStatus(payload.data.status);
      setReservationCode(payload.data.reservationCode ?? "");
      setSuccess(true);
    } catch {
      setPaymentError("Le service de paiement est momentanément indisponible.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell payment-shell">
        <PaymentHeader />

        <main className="payment-page" data-payment-page>
          <PaymentMain selectedMethod={selectedMethod} onSelectMethod={setSelectedMethod} provider={provider} />
          <PaymentSide
            coach={coach}
            city={city}
            service={service}
            duration={duration}
            format={format}
            objective={objective}
            packageLabel={packageLabel}
            slot={slot}
            price={price}
            mentor={mentor}
            selectedMethod={selectedMethod}
            success={success}
            onSubmit={handlePayment}
            paymentReady={reservationStatus === "accepted" && !paymentError && !awaitingConfirmation}
            paymentError={paymentError}
            reservationStatus={reservationStatus}
            reservationCode={reservationCode}
            reservationId={reservationId}
            processing={processing}
            awaitingConfirmation={awaitingConfirmation}
            appointmentLabel={`${formatBookingSlot(serverReservation?.appointmentAt || serverReservation?.slots[0] || slot)} · Europe/Paris`}
          />
        </main>

        <PaymentFooter />
      </div>
    </>
  );
}
