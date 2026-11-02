// Public routes keep their historic Fitness alias; stored records keep "fitness".
export const discoverySports = [
  ['football', 'Football'], ['basketball', 'Basketball'],
  ['metiers-de-la-forme', 'Fitness'], ['sports-de-combat', 'Sports de combat'],
  ['boxe', 'Boxe'], ['mma', 'MMA'], ['pilates', 'Pilates'],
  ['coaching-sportif', 'Coaching sportif'], ['crossfit', 'CrossFit'],
  ['preparation-physique', 'Préparation physique'], ['musculation', 'Musculation'],
  ['hyrox', 'HYROX'], ['perte-de-poids', 'Perte de poids'], ['padel', 'Padel'],
] as const;
export type DiscoverySportSlug = typeof discoverySports[number][0];
export type SportSlug = Exclude<DiscoverySportSlug, 'metiers-de-la-forme'> | 'fitness';
export const storageSportSlugs = discoverySports.map(([slug]) => slug === 'metiers-de-la-forme' ? 'fitness' : slug) as SportSlug[];
export const canonicalSportSlug = (value?: string) => value === 'metiers-de-la-forme' ? 'fitness' : value || undefined;
export function isSportSlug(value: unknown): value is SportSlug { return typeof value === 'string' && storageSportSlugs.includes(value as SportSlug); }
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
export function knownDiscoverySport(value?: string) {
  const key = value === 'fitness' ? 'metiers-de-la-forme' : value;
  return key ? discoverySports.find(([slug, label]) => slug === key || normalize(label) === normalize(key)) : undefined;
}

export const sportEquipment: Record<string, readonly [string, string]> = {
  football: ['football-ball', 'ball'], basketball: ['basketball', 'ball'],
  'metiers-de-la-forme': ['dumbbell', 'lift'],
  'sports-de-combat': ['focus-mitt', 'punch'], boxe: ['boxing-glove', 'punch'],
  mma: ['shin-guards', 'punch'], pilates: ['resistance-band', 'flow'],
  'coaching-sportif': ['football-cone', 'lift'], crossfit: ['kettlebell', 'lift'],
  'preparation-physique': ['football-cone', 'lift'], musculation: ['dumbbell', 'lift'],
  hyrox: ['kettlebell', 'lift'], 'perte-de-poids': ['basketball-shoes', 'flow'],
  padel: ['padel-racket', 'racket'],
};
