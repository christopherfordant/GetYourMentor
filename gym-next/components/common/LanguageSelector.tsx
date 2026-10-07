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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("gym-language");
    // French remains the safe default, but honour an available English browser
    // preference until the user makes an explicit choice.
    setLanguage(detectInitialLanguage(stored, window.navigator.language));
  }, []);

  const setSelectedLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("gym-language", nextLanguage);
    setIsOpen(false);
  };

  return (
    <details
      className={`language-selector language-selector-accordion ${className}`.trim()}
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary><span>{language.toUpperCase()}</span><span aria-hidden="true">⌄</span></summary>
      <div className="language-selector-panel">
        <button type="button" aria-pressed={language === "fr"} onClick={() => setSelectedLanguage("fr")}>Français</button>
        <button type="button" aria-pressed={language === "en"} onClick={() => setSelectedLanguage("en")}>English</button>
        <button type="button" onClick={() => setSelectedLanguage("es")}>Español</button>
        <button type="button" onClick={() => setSelectedLanguage("de")}>Deutsch</button>
        <button type="button" onClick={() => setSelectedLanguage("it")}>Italiano</button>
        <button type="button" onClick={() => setSelectedLanguage("pt")}>Português</button>
      </div>
    </details>
  );
}
