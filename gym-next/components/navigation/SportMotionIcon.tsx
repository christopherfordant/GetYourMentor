// Decorative local product-style cutouts. The link text is the accessible name.
const equipment: Record<string, readonly [string, string]> = {
  football: ['football-ball', 'ball'], basketball: ['basketball', 'ball'],
  'metiers-de-la-forme': ['dumbbell', 'lift'],
  'sports-de-combat': ['focus-mitt', 'punch'], boxe: ['boxing-glove', 'punch'],
  mma: ['shin-guards', 'punch'], pilates: ['resistance-band', 'flow'],
  'coaching-sportif': ['football-cone', 'lift'], crossfit: ['kettlebell', 'lift'],
  'preparation-physique': ['football-cone', 'lift'], musculation: ['dumbbell', 'lift'],
  hyrox: ['kettlebell', 'lift'], 'perte-de-poids': ['basketball-shoes', 'flow'],
  padel: ['padel-racket', 'racket'],
};
export function SportMotionIcon({ sport }: { sport: string }) {
  const item = equipment[sport];
  if (!item) return null;
  const [asset, kind] = item;
  return <span data-sport-motion={kind} aria-hidden="true">
    <img src={`/design_assets/header-equipment-2026-10-30/${asset}.webp`}
      width="144" height="144" alt="" decoding="async" draggable={false} />
  </span>;
}
