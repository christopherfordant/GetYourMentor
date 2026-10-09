"use client";

import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  ["fr", "Fran\u00e7ais"], ["en", "English"], ["es", "Espa\u00f1ol"],
  ["de", "Deutsch"], ["it", "Italiano"], ["pt", "Portugu\u00eas"],
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

function DumbbellIcon() {
  return <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M7 8v8M4.5 10v4M9.5 6v12M17 8v8m2.5-6v4M14.5 6v12M9.5 12h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
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
    <span className="language-selector-dumbbell"><DumbbellIcon /></span>
    <button type="button" className="language-selector-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <span aria-hidden="true">{language.toUpperCase()}</span><span className="language-selector-chevron" aria-hidden="true">⌄</span>
    </button>
    <select className="language-selector-native-control" aria-label="Langue" value={language} onChange={event => selectLanguage(event.target.value)}>
      {LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
    </select>
    {open && <div className="language-selector-menu" role="menu" aria-label="Choisir une langue">
      <div className="language-selector-menu-title"><span className="language-selector-dumbbell"><DumbbellIcon /></span>Langue</div>
      {LANGUAGES.map(([code, label]) => <button key={code} type="button" role="menuitemradio" aria-checked={language === code} className={language === code ? "is-selected" : ""} onClick={() => selectLanguage(code)}>{label}</button>)}
    </div>}
  </div>;
}
