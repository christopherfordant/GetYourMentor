"use client";

import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  ["fr", "Français"], ["en", "English"], ["es", "Español"],
  ["de", "Deutsch"], ["it", "Italiano"], ["pt", "Português"],
] as const;

export function detectInitialLanguage(stored: string | null, browserLanguage?: string) {
  if (stored && LANGUAGES.some(([code]) => code === stored)) return stored;
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
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLanguage(detectInitialLanguage(window.localStorage.getItem("gym-language"), window.navigator.language));
  }, []);
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, []);

  const selectLanguage = (next: string) => {
    setLanguage(next);
    window.localStorage.setItem("gym-language", next);
    setOpen(false);
  };

  return <div ref={rootRef} className={`language-selector language-selector-native ${className}`.trim()}>
    <span className="sr-only">Langue</span>
    <button type="button" className="language-selector-trigger" aria-label="Open language menu" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <svg className="language-selector-globe" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5S14.2 18.2 12 20.5C9.8 18.2 8.8 15.4 8.8 12S9.8 5.8 12 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.25" /></svg>
      <span aria-hidden="true">{language.toUpperCase()}</span>
      <svg className="language-selector-chevron" viewBox="0 0 12 8" aria-hidden="true" focusable="false"><path d="m1 1.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
    <select className="language-selector-native-control" aria-label="Langue" value={language} onChange={event => selectLanguage(event.target.value)}>{LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select>
    {open && <div className="language-selector-menu" role="menu" aria-label="Choisir une langue"><div className="language-selector-menu-title">Langue</div>{LANGUAGES.map(([code, label]) => <button key={code} type="button" role="menuitemradio" aria-checked={language === code} className={language === code ? "is-selected" : ""} onClick={() => selectLanguage(code)}>{label}</button>)}</div>}
  </div>;
}
