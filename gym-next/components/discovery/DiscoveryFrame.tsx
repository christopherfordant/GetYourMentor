"use client";

import { PlatformHeader } from "@/components/navigation/PlatformHeader";
export { discoverySports } from "@/lib/discovery-sports";
import { SiteFooter } from "@/components/SiteFooter";
import type { ReactNode } from "react";

export function DiscoveryFrame({ children, page, demo = false }: { children: ReactNode; page: "search" | "directory" | "profile" | "slot" | "recap" | "payment" | "progress"; demo?: boolean }) {
  return <div id="gym-discovery" className="discovery-editorial gym-theme-factory" data-gym-discovery={page}>
    <PlatformHeader />
    {demo && <p className="de-demo" role="note">Démonstration · profils, notes et tarifs de test. Aucun paiement réel.</p>}
    {children}
    <SiteFooter />
  </div>;
}

export function DiscoveryIntro({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return <div className="de-intro"><p className="de-eyebrow">{step}</p><h1>{title}</h1><p className="de-intro-copy">{children}</p></div>;
}

export function DiscoverySteps({ active }: { active: number }) {
  return <ol className="de-steps" aria-label="Étapes de recherche">{["Ton sport", "Ton coach", "Ta séance"].map((label, i) => <li key={label} aria-current={active === i ? "step" : undefined}><span>{String(i + 1).padStart(2, "0")}</span>{label}</li>)}</ol>;
}
