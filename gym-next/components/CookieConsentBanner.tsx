"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "gym-cookie-consent-v1";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    setVisible(window.localStorage.getItem(CONSENT_KEY) === null);
  }, []);

  function saveChoice(choice: "essential" | "refused") {
    window.localStorage.setItem(CONSENT_KEY, choice);
    setVisible(false);
  }

  if (visible === null) return null;

  if (!visible) {
    return <button type="button" className="cookie-preferences-trigger" onClick={() => setVisible(true)}>Préférences cookies</button>;
  }

  return (
    <aside className="cookie-consent-banner" role="dialog" aria-label="Préférences de cookies" aria-live="polite">
      <div>
        <strong>Votre confidentialité compte</strong>
        <p>
          GetYourMentor utilise uniquement les éléments nécessaires à la session et à la sécurité. Aucun outil de mesure d’audience
          n’est activé sans votre choix. <a href="/legal/cookies">En savoir plus</a>
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-consent-secondary" onClick={() => saveChoice("refused")}>Refuser le non nécessaire</button>
        <button type="button" className="cookie-consent-primary" onClick={() => saveChoice("essential")}>Continuer avec le nécessaire</button>
      </div>
    </aside>
  );
}
