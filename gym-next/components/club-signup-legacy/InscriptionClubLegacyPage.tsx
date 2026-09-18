"use client";

import { useState } from "react";
import { nextRoutes } from "@/lib/next-routes";
import { LanguageSelector } from "@/components/common/LanguageSelector";

type InscriptionClubLegacyPageProps = {
  legacyStyles: string;
  params: Record<string, string | undefined>;
};

function ClubSignupHeader() {
  return (
    <header className="topbar topbar-light">
      <div className="brand-lockup">
        <a className="brand-name brand-link" href={nextRoutes.home}>GetYourMentor</a>
      </div>

      <nav className="sports-nav" aria-label="Sports">
        <a className="sport-link" href={`${nextRoutes.search}?sport=football`}>Football</a>
        <a className="sport-link" href={`${nextRoutes.search}?sport=basketball`}>Basketball</a>
        <a className="sport-link" href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>Fitness</a>
        <a className="sport-link" href={`${nextRoutes.search}?sport=sports-de-combat`}>Sports de combat</a>
      </nav>

      <div className="topbar-actions">
        <LanguageSelector />
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

function ClubSignupVisual() {
  return (
    <section className="club-signup-visual" aria-label="Identité GYM">
      <div className="club-signup-logo-frame">
        <img src="/design_assets/logo-getyourmentor-signup.png" alt="Logo GYM GetYourMentor" />
      </div>
    </section>
  );
}

function ClubSignupForm() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: "", longitude: "" });

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("La géolocalisation n’est pas disponible sur cet appareil.");
      return;
    }
    setLocationStatus("Recherche de la position de la structure…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ latitude: coords.latitude.toFixed(6), longitude: coords.longitude.toFixed(6) });
        setLocationStatus("Position enregistrée. Elle servira à la recherche locale.");
      },
      () => setLocationStatus("Position indisponible. Renseignez au moins la ville ou l’adresse."),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <section className="club-signup-form-panel">
      <div className="club-signup-form-card">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setStatus("");
            const response = await fetch("/api/clubs/leads", { method: "POST", body: new FormData(event.currentTarget) });
            const payload = await response.json();
            setSubmitting(false);
            setStatus(response.ok ? "Votre demande a bien été transmise. Notre équipe reviendra vers vous." : payload.error ?? "Demande impossible");
          }}
        >
        <div className="club-signup-grid">
          <label className="auth-field">
            <span>* Nom du club / structure</span>
            <input name="clubName" type="text" placeholder="Nom du club / structure" required />
          </label>

          <label className="auth-field">
            <span>* Nom du responsable</span>
            <input name="managerName" type="text" placeholder="Nom du responsable" required />
          </label>

          <label className="auth-field club-signup-grid-wide">
            <span>* Adresse mail</span>
            <input name="email" type="email" placeholder="Adresse mail" required />
          </label>

          <label className="auth-field">
            <span>Numéro de téléphone</span>
            <input name="phone" type="tel" placeholder="Numéro de téléphone" />
          </label>

          <label className="auth-field club-signup-grid-wide">
            <span>Ville / adresse de la structure</span>
            <input name="addressLabel" type="text" placeholder="Ville, quartier ou adresse" maxLength={512} />
          </label>
        </div>

        <input type="hidden" name="latitude" value={coordinates.latitude} />
        <input type="hidden" name="longitude" value={coordinates.longitude} />
        <div className="auth-field">
          <span>Localiser la structure</span>
          <button className="auth-secondary" type="button" onClick={useCurrentLocation}>Utiliser ma position</button>
          <small>La position exacte reste privée et sert uniquement à la recherche de proximité.</small>
          {locationStatus ? <p role="status">{locationStatus}</p> : null}
        </div>

        <label className="auth-field club-signup-upload">
          <span>Logo du club / structure</span>
          <div className="club-signup-dropzone"><input name="logo" type="file" accept="image/*" /></div>
        </label>

        <label className="auth-field club-signup-upload">
          <span>Pièce d&apos;identité</span>
          <div className="club-signup-dropzone"><input name="identity" type="file" accept="image/*,.pdf" /></div>
        </label>

        <label className="auth-field">
          <span>IBAN (seuls les 4 derniers caractères sont conservés)</span>
          <input name="iban" className="club-signup-iban" type="text" placeholder="FR76" />
        </label>

          <p role="status" data-club-signup-status hidden={!status}>{status}</p>
          <div className="club-signup-actions">
            <button className="auth-primary club-signup-submit" type="submit" disabled={submitting}>
              {submitting ? "Transmission..." : "Affiliez des coachs"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export function InscriptionClubLegacyPage({ legacyStyles }: InscriptionClubLegacyPageProps) {
  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell club-signup-shell">
        <ClubSignupHeader />

        <main className="club-signup-page">
          <ClubSignupVisual />
          <ClubSignupForm />
        </main>
      </div>
    </>
  );
}
