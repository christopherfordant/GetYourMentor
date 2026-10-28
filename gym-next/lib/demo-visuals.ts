// Illustrations only: never write generated portraits into stored user profiles.
const root = '/design_assets/ai-2026-10-28';
export const demoCoachVisuals: Readonly<Record<string, string>> = {
  'steven-fordant': 'coach-basketball',
  'madison-seck': 'coach-football',
  'studio-form-marseille': 'coach-fitness',
};
export function coachVisual(coachId: string | undefined, demo: boolean, photoUrl?: string) {
  if (photoUrl?.trim()) return { src: photoUrl.trim(), ai: false };
  const asset = demo && coachId && Object.hasOwn(demoCoachVisuals, coachId) ? demoCoachVisuals[coachId] : undefined;
  return asset ? { src: `${root}/${asset}-1280.webp`, small: `${root}/${asset}-640.webp`, ai: true } : null;
}
export const sportVisuals = {
  football: { asset: 'scene-football', alt: 'Illustration IA : une sportive adulte s’entraîne au football.' },
  basketball: { asset: 'scene-basketball', alt: 'Illustration IA : une sportive adulte prépare un lancer au basketball.' },
  'metiers-de-la-forme': { asset: 'scene-fitness', alt: 'Illustration IA : un sportif adulte s’entraîne avec un élastique.' },
  'sports-de-combat': { asset: 'scene-combat', alt: 'Illustration IA : une sportive adulte en garde dans une salle de boxe.' },
} as const;
export function sportVisual(sport: string) {
  const key = sport === 'fitness' ? 'metiers-de-la-forme' : sport;
  return Object.hasOwn(sportVisuals, key) ? sportVisuals[key as keyof typeof sportVisuals] : sportVisuals.football;
}
export function visualPath(asset: string, width: 640 | 1280) { return `${root}/${asset}-${width}.webp`; }
