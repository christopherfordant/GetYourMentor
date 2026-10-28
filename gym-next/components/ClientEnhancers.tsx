"use client";

import { SectionDrawer } from "@/components/navigation/SectionDrawer";
import dynamic from "next/dynamic";

// Loaded separately so the global reveal observer does not block the first
// render of the server-rendered shell and homepage hero.
const ScrollParticleReveal = dynamic(
  () => import("@/components/ScrollParticleReveal").then((module) => module.ScrollParticleReveal),
  { ssr: false },
);

export function ClientEnhancers() {
  return <><ScrollParticleReveal /><SectionDrawer /></>;
}
