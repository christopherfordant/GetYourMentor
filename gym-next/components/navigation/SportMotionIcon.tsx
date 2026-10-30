// Decorative, local SVGs: the visible link label remains the accessible name.
export function SportMotionIcon({ sport }: { sport: string }) {
  const ball = sport === 'football' || sport === 'basketball';
  const combat = ['boxe', 'mma', 'sports-de-combat'].includes(sport);
  const calm = ['pilates', 'perte-de-poids'].includes(sport);
  const kind = ball ? 'ball' : combat ? 'punch' : calm ? 'flow' : sport === 'padel' ? 'racket' : 'lift';
  return <span data-sport-motion={kind} aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {ball ? <><circle cx="12" cy="12" r="9" />{sport === 'football' ? <><path d="m12 7 5 4-2 6H9l-2-6Z M12 3v4 M3 10l4 1 M5 19l4-2 M19 19l-4-2 M21 10l-4 1" /></> : <><path d="M3 12h18 M12 3v18 M6 5c7 3 7 11 0 14 M18 5c-7 3-7 11 0 14" /></>}</>
      : combat ? <path d="M7 20v-6C4 12 4 8 6 6c1-2 4-3 7-2 4 0 6 3 6 6v5l-3 2v3Z M7 15h9 M7 10l3 2 1-5" />
      : calm ? <><path d="M3 10c3-6 6 6 9 0s6 6 9 0 M3 16c3-6 6 6 9 0s6 6 9 0" /></>
      : sport === 'padel' ? <><ellipse cx="14" cy="8" rx="6" ry="7" transform="rotate(35 14 8)" /><path d="m10 14-6 7 M11 6h6 M10 9h6" /></>
      : <><path d="M7 12h10 M3 8h4v8H3z M17 8h4v8h-4z M1 10v4 M23 10v4" /></>}
  </svg></span>;
}
