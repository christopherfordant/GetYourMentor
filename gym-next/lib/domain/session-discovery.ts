export type SessionFilters = { sport: string; city: string; source: string; participants: number };
export type DiscoverableSession = {
  sport?: string; city?: string; source?: string; capacity?: number; slots: string[];
  availability?: Array<{ slot: string; remaining: number }>;
  individualPrice?: number; groupPrices?: Array<{ participantCount: number; totalCents: number }>;
};
const sports = new Set(["football", "basketball", "metiers-de-la-forme", "sports-de-combat"]);
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

export function parseSessionFilters(params: URLSearchParams): SessionFilters {
  const sport = params.get("sport") ?? "", source = params.get("source") ?? "";
  const size = Number(params.get("participants") ?? 1);
  return { sport: sports.has(sport) ? sport : "", city: (params.get("city") ?? "").trim().slice(0, 120), source: ["coach", "structure"].includes(source) ? source : "", participants: Number.isInteger(size) && size >= 1 && size <= 50 ? size : 1 };
}

export function matchesSession(offer: DiscoverableSession, filters: SessionFilters, now = Date.now()) {
  if (!sports.has(offer.sport ?? "")) return false;
  if (filters.sport && offer.sport !== filters.sport) return false;
  if (filters.city && !normalize(offer.city ?? "").includes(normalize(filters.city))) return false;
  if (filters.source && (offer.source ?? "structure") !== filters.source) return false;
  const price = filters.participants === 1 ? offer.individualPrice : (offer.groupPrices?.find(p => p.participantCount === filters.participants)?.totalCents ?? NaN) / 100;
  if (!Number.isFinite(price) || price! <= 0) return false;
  return offer.slots.some(slot => Date.parse(slot) > now && (offer.availability?.find(a => a.slot === slot)?.remaining ?? offer.capacity ?? 1) >= filters.participants);
}
