"use client";

import type { ReactNode } from "react";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";

export const discoverySports = [
  ["football", "Football"], ["basketball", "Basketball"],
  ["metiers-de-la-forme", "Fitness"], ["sports-de-combat", "Sports de combat"],
] as const;

export function DiscoveryFrame({ children, page, demo = false }: { children: ReactNode; page: "search" | "directory" | "profile"; demo?: boolean }) {
  return <div id="gym-discovery" className="discovery-editorial" data-gym-discovery={page}>
    <header className="de-header" id="top">
      <a className="de-brand" href={nextRoutes.home} aria-label="GetYourMentor"><b aria-hidden="true">GYM<span>↗</span></b><span>GetYourMentor</span></a>
      <nav className="de-sports" aria-label="Sports">{discoverySports.map(([slug, label]) => <a key={slug} href={buildNextPath(nextRoutes.search, { sport: slug })}>{label}</a>)}</nav>
      <div className="de-actions"><LanguageSelector /><a href={`${nextRoutes.account}?mode=coach`}>Je suis coach</a><a className="de-account" href={nextRoutes.account}>Mon compte <span aria-hidden="true">↗</span></a></div>
    </header>
    {demo && <p className="de-demo" role="note">Démonstration · profils, notes et tarifs de test. Aucun paiement réel.</p>}
    {children}
    <footer className="de-footer">
      <a className="de-brand" href="/" aria-label="GetYourMentor"><b aria-hidden="true">GYM<span>↗</span></b><span>GetYourMentor</span></a>
      <p>Le coaching, à ton rythme.</p>
      <nav aria-label="Informations"><a href="/#espace">Comment ça marche</a><a href="/#forfaits">Les offres</a><a href="/#faq">FAQ</a><a href="/legal/cgu">CGU</a><a href="/legal/cgv">CGV</a><a href="/legal/confidentialite">Confidentialité</a></nav>
    </footer>
  </div>;
}

export function DiscoveryIntro({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return <div className="de-intro"><p className="de-eyebrow">{step}</p><h1>{title}</h1><p className="de-intro-copy">{children}</p></div>;
}

export function DiscoverySteps({ active }: { active: number }) {
  return <ol className="de-steps" aria-label="Étapes de recherche">{["Ton sport", "Ton coach", "Ta séance"].map((label, i) => <li key={label} aria-current={active === i ? "step" : undefined}><span>{String(i + 1).padStart(2, "0")}</span>{label}</li>)}</ol>;
}
