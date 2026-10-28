import { listCoaches } from '@/lib/coaches';
import { activeCoachIds, listAffiliations } from '@/lib/affiliations';
import { listReservations } from '@/lib/reservations';
import { listStructureOffers, publicSessionOffer } from '@/lib/structure-offers';
import { COLLECTIVE_CANDIDATE_LIMIT, COLLECTIVE_PREVIEW_LIMIT, collectivePreviewRow, type CollectivePreview } from './collective-preview';
import { isDemoFallbackAllowed } from './runtime';

export function isolatedCollectiveDemo() {
  return isDemoFallbackAllowed() && !process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_SERVICE_ROLE_KEY;
}
export async function listCollectivePreview(): Promise<CollectivePreview[]> {
  const now = Date.now();
  // Existing demo repository reads one state blob. Bound subsequent projections/lookups,
  // not a claim of SQL pagination or completeness of the entire catalogue.
  const [offers, reservations, profiles] = await Promise.all([listStructureOffers(), listReservations(), listCoaches()]);
  const candidates = offers.filter(o => (o.capacity ?? 1) >= 2 && o.slots.some(s => Date.parse(s) > now))
    .sort((a, b) => Math.min(...a.slots.filter(s => Date.parse(s) > now).map(Date.parse)) - Math.min(...b.slots.filter(s => Date.parse(s) > now).map(Date.parse)) || a.id.localeCompare(b.id))
    .slice(0, COLLECTIVE_CANDIDATE_LIMIT);
  const coaches = new Map(profiles.map(coach => [coach.id, coach]));
  const affiliations = new Map<string, string[]>();
  const rows: CollectivePreview[] = [];
  for (const offer of candidates) {
    const coach = coaches.get(offer.coachId);
    if (!coach?.verified) continue;
    if (offer.source !== 'coach') {
      if (!affiliations.has(offer.ownerEmail)) affiliations.set(offer.ownerEmail, activeCoachIds(await listAffiliations({ role: 'club', email: offer.ownerEmail }), offer.ownerEmail));
      if (!affiliations.get(offer.ownerEmail)!.includes(offer.coachId)) continue;
    }
    const row = collectivePreviewRow({ ...await publicSessionOffer(offer, { coach, reservations }), sport: coach.sport, city: coach.city }, now);
    if (row && !rows.some(r => r.id === row.id)) rows.push(row);
    if (rows.length === COLLECTIVE_PREVIEW_LIMIT) break;
  }
  return rows;
}
