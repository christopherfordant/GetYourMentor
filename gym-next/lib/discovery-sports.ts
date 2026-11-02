export { discoverySports, knownDiscoverySport } from './sports-catalogue';
export const availableNavigationSections = [
  { label: 'Tous les mentors', href: '/coachs' },
  { label: 'Entraîne-toi à plusieurs', href: '/seances' },
  { label: 'Découvrir la plateforme', href: '/#profils' },
  { label: 'Ton espace', href: '/#espace' },
  { label: 'Fais-toi guider', href: '/#suite' },
  { label: 'Questions fréquentes', href: '/#faq' },
  { label: 'Deviens mentor', href: '/compte' },
] as const;
