import { knownDiscoverySport, sportEquipment } from '@/lib/sports-catalogue';
export function SportIcon({ sport }: { sport: string }) {
  const key = knownDiscoverySport(sport)?.[0];
  const item = key ? sportEquipment[key] : undefined;
  return item ? <img src={`/design_assets/header-equipment-2026-10-30/${item[0]}.webp`} width="32" height="32" alt="" aria-hidden="true" style={{ objectFit: 'contain', flexShrink: 0, verticalAlign: 'middle', marginInlineEnd: 8 }} /> : null;
}
