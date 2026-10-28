export function SportIcon({ sport }: { sport: string }) {
  const key = sport === 'fitness' ? 'metiers-de-la-forme' : sport;
  const filename = ({ football: 'football', basketball: 'basketball', 'metiers-de-la-forme': 'fitness', 'sports-de-combat': 'combat' } as Record<string, string>)[key];
  return filename ? <img src={`/design_assets/ai-2026-10-28/icons/${filename}.svg`} width="32" height="32" alt="" aria-hidden="true" style={{ flexShrink: 0, verticalAlign: 'middle', marginInlineEnd: 8 }} /> : null;
}
