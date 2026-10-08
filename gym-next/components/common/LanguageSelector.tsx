"use client";

import { useEffect, useState } from "react";

export function detectInitialLanguage(stored: string | null, browserLanguage?: string) {
  if (stored && ["fr", "en", "es", "de", "it", "pt"].includes(stored)) return stored;
  const browser = browserLanguage?.toLowerCase() ?? "";
  if (browser.startsWith("en")) return "en";
  if (browser.startsWith("es")) return "es";
  if (browser.startsWith("de")) return "de";
  if (browser.startsWith("it")) return "it";
  if (browser.startsWith("pt")) return "pt";
  return "fr";
}

export function LanguageSelector({ className = "" }: { className?: string }) {
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem("gym-language");
    // French remains the safe default, but honour an available English browser
    // preference until the user makes an explicit choice.
    setLanguage(detectInitialLanguage(stored, window.navigator.language));
  }, []);

  const setSelectedLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("gym-language", nextLanguage);
  };

  return (
    <label className={`language-selector language-selector-native ${className}`.trim()}>
      <span className="sr-only">Langue</span>
      <select aria-label="Langue" value={language} onChange={(event) => setSelectedLanguage(event.target.value)}>
        <option value="fr">FR</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
        <option value="de">DE</option>
        <option value="it">IT</option>
        <option value="pt">PT</option>
      </select>
    </label>
  );
}
