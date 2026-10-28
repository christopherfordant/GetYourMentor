// Lovable discovery labels approved 28 October; legacy routes remain available.
export const discoverySports = [
  ['football', 'Football'], ['basketball', 'Basketball'],
  ['metiers-de-la-forme', 'Fitness'], ['sports-de-combat', 'Sports de combat'],
  ['boxe', 'Boxe'], ['mma', 'MMA'], ['pilates', 'Pilates'],
  ['coaching-sportif', 'Coaching sportif'], ['crossfit', 'CrossFit'],
  ['preparation-physique', 'Préparation physique'], ['musculation', 'Musculation'],
  ['hyrox', 'HYROX'], ['perte-de-poids', 'Perte de poids'], ['padel', 'Padel'],
] as const;
export function knownDiscoverySport(value?: string) {
  const normalized = value === 'fitness' ? 'metiers-de-la-forme' : value;
  return discoverySports.find(([slug]) => slug === normalized);
}
export const availableNavigationSections = [
  { label: 'Tous les mentors', href: '/coachs' },
  { label: 'Entraîne-toi à plusieurs', href: '/seances' },
  { label: 'Découvrir la plateforme', href: '/#profils' },
  { label: 'Ton espace', href: '/#espace' },
  { label: 'Fais-toi guider', href: '/#suite' },
  { label: 'Questions fréquentes', href: '/#faq' },
  { label: 'Deviens mentor', href: '/compte' },
] as const;
