"use client";

import { useEffect, useState } from "react";

export function detectInitialLanguage(stored: string | null, browserLanguage?: string) {
  if (stored === "fr" || stored === "en") return stored;
  return browserLanguage?.toLowerCase().startsWith("en") ? "en" : "fr";
}

export function LanguageSelector({ className = "" }: { className?: string }) {
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem("gym-language");
    // French remains the safe default, but honour an available English browser
    // preference until the user makes an explicit choice.
    setLanguage(detectInitialLanguage(stored, window.navigator.language));
  }, []);

  return (
    <label className={`language-selector ${className}`.trim()}>
      <span className="sr-only">Langue</span>
      <select
        aria-label="Langue"
        value={language}
        onChange={(event) => {
          const nextLanguage = event.target.value;
          setLanguage(nextLanguage);
          window.localStorage.setItem("gym-language", nextLanguage);
        }}
      >
        <option value="fr">FR</option>
        <option value="en">EN</option>
      </select>
    </label>
  );
}
