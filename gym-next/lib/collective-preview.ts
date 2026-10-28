import { matchesSession, type DiscoverableSession } from './domain/session-discovery';
import { slotInstant } from './domain/booking-time';

export const COLLECTIVE_PREVIEW_LIMIT = 3;
export const COLLECTIVE_CANDIDATE_LIMIT = 24;
export const COLLECTIVE_PARTICIPANTS = 2;
export type CollectivePreview = {
  id: string; title: string; coachName: string; sport: string; city: string;
  source: 'coach' | 'structure'; duration: string; location: string;
  slot: string; capacity: number; remaining: number; totalCents: number;
};
type PublicSession = DiscoverableSession & {
  id: string; title: string; coachName?: string; duration: string; location?: string;
};
// Require an explicit availability projection: capacity alone is never a free-seat count.
export function collectivePreviewRow(offer: PublicSession, now = Date.now()): CollectivePreview | null {
  if (!Number.isInteger(offer.capacity) || offer.capacity! < 2 || offer.capacity! > 50 ||
      !matchesSession(offer, { sport: '', city: '', source: '', participants: COLLECTIVE_PARTICIPANTS }, now)) return null;
  const price = offer.groupPrices?.find(p => p.participantCount === COLLECTIVE_PARTICIPANTS);
  if (!price || !Number.isSafeInteger(price.totalCents) || price.totalCents <= 0) return null;
  const available = offer.availability?.filter(a => offer.slots.includes(a.slot) &&
    (slotInstant(a.slot) ?? 0) > now && Number.isInteger(a.remaining) && a.remaining >= 2 && a.remaining <= offer.capacity!)
    .sort((a, b) => Date.parse(a.slot) - Date.parse(b.slot))[0];
  if (!available) return null;
  return { id: offer.id, title: offer.title, coachName: offer.coachName ?? '', sport: offer.sport!, city: offer.city ?? '',
    source: offer.source === 'coach' ? 'coach' : 'structure', duration: offer.duration, location: offer.location ?? '',
    slot: available.slot, capacity: offer.capacity!, remaining: available.remaining, totalCents: price.totalCents };
}
export function readCollectivePreview(value: unknown): CollectivePreview[] {
  const payload = value as { demo?: unknown; data?: unknown };
  if (!payload || payload.demo !== true || !Array.isArray(payload.data) || payload.data.length > COLLECTIVE_PREVIEW_LIMIT) throw new Error('Aperçu indisponible');
  const ids = new Set<string>();
  return payload.data.map((item: CollectivePreview) => {
    if (!item || ['id', 'title', 'coachName', 'sport', 'city', 'duration', 'location', 'slot'].some(key => typeof item[key as keyof CollectivePreview] !== 'string') ||
        !/^[a-zA-Z0-9-]{1,128}$/.test(item.id) || ids.has(item.id) || !['coach', 'structure'].includes(item.source)) throw new Error('Séance invalide');
    ids.add(item.id);
    const row = collectivePreviewRow({ ...item, slots: [item.slot], availability: [{ slot: item.slot, remaining: item.remaining }], groupPrices: [{ participantCount: 2, totalCents: item.totalCents }] });
    if (!row) throw new Error('Séance indisponible');
    return row;
  });
}
export function collectiveDetailsHref(id: string) {
  return `/seances?participants=${COLLECTIVE_PARTICIPANTS}&offer=${encodeURIComponent(id)}`;
}
