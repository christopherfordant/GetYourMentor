"use client";

import { useEffect, useState } from "react";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem("gym-language");
    // L'anglais sera active quand les traductions seront disponibles. On
    // refuse une ancienne preference EN pour ne jamais afficher du francais
    // avec une langue de document anglaise.
    if (stored === "fr") setLanguage(stored);
    else if (stored === "en") window.localStorage.setItem("gym-language", "fr");
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
        <option value="en" disabled>EN (bientot)</option>
      </select>
    </label>
  );
}
