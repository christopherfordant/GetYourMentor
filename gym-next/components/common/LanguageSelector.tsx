"use client";

import { useEffect, useState } from "react";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem("gym-language");
    if (stored === "fr" || stored === "en") setLanguage(stored);
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
