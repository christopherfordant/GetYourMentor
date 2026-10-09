"use client";

import { useEffect, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLabelElement>(null);
  const languages = [
    ["fr", "Français"],
    ["en", "English"],
    ["es", "Español"],
    ["de", "Deutsch"],
    ["it", "Italiano"],
    ["pt", "Português"],
  ] as const;

  useEffect(() => {
    const stored = window.localStorage.getItem("gym-language");
    // French remains the safe default, but honour an available English browser
    // preference until the user makes an explicit choice.
    setLanguage(detectInitialLanguage(stored, window.navigator.language));
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const setSelectedLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("gym-language", nextLanguage);
    setOpen(false);
  };

  return (
    <label ref={rootRef} className={`language-selector language-selector-native ${className}`.trim()}>
      <span className="sr-only">Langue</span>
      <span className="language-selector-dumbbell" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false"><path d="M7 8v8M4.5 10v4M9.5 6v12M17 8v8m2.5-6v4M14.5 6v12M9.5 12h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </span>
      <button
        type="button"
        className="language-selector-trigger"
        aria-label="Langue"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{language.toUpperCase()}</span>
        <span className="language-selector-chevron" aria-hidden="true">⌄</span>
      </button>
      <select className="language-selector-native-control" aria-label="Langue" value={language} onChange={(event) => setSelectedLanguage(event.target.value)}>
        {languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
      </select>
      {open && <div className="language-selector-menu" role="menu" aria-label="Choisir une langue">
        <div className="language-selector-menu-title"><span className="language-selector-dumbbell" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7 8v8M4.5 10v4M9.5 6v12M17 8v8m2.5-6v4M14.5 6v12M9.5 12h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></span>Langue</div>
        {languages.map(([code, label]) => <button key={code} type="button" role="menuitemradio" aria-checked={language === code} className={language === code ? "is-selected" : ""} onClick={() => setSelectedLanguage(code)}>{label}</button>)}
      </div>}
    </label>
  );
}
