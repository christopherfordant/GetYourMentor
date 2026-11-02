// Decorative local product-style cutouts. The link text is the accessible name.
import { sportEquipment as equipment } from '@/lib/sports-catalogue';
export function SportMotionIcon({ sport }: { sport: string }) {
  const item = equipment[sport];
  if (!item) return null;
  const [asset, kind] = item;
  return <span data-sport-motion={kind} aria-hidden="true">
    <img src={`/design_assets/header-equipment-2026-10-30/${asset}.webp`}
      width="144" height="144" alt="" decoding="async" draggable={false} />
  </span>;
}
