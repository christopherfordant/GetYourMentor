import { canonicalSportSlug, coachIdForName, coachProfiles, createCoachProfile, filterCoaches, setCoachVerification, updateCoachProfile, type CoachProfile } from "@/lib/domain";
import { assertDemoFallbackAllowed } from "@/lib/runtime";
import { supabaseHeaders } from "@/lib/supabase";
import { distanceKm, parseCoordinates, normalizeRadiusKm, type Coordinates } from "@/lib/location";

export type PublicCoachProfile = Omit<CoachProfile, "bankAccountLast4" | "latitude" | "longitude"> & { distanceKm?: number };

export function toPublicCoach(coach: CoachProfile & { distanceKm?: number }): PublicCoachProfile {
  const publicCoach = { ...coach } as PublicCoachProfile & { bankAccountLast4?: string; latitude?: number; longitude?: number };
  delete publicCoach.bankAccountLast4;
  delete publicCoach.latitude;
  delete publicCoach.longitude;
  return publicCoach;
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return { url: url.replace(/\/$/, ""), key };
  assertDemoFallbackAllowed("Supabase Coaches");
  return null;
}

function fromRow(row: Record<string, unknown>): CoachProfile {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    sport: row.sport as CoachProfile["sport"],
    specialty: String(row.specialty ?? ""),
    city: String(row.city ?? ""),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    priceFrom: Number(row.price_from ?? 0),
    verified: Boolean(row.verified),
    description: String(row.description ?? ""),
    disciplines: String(row.disciplines ?? ""),
    diplomas: String(row.diplomas ?? ""),
    sessionTypes: String(row.session_types ?? ""),
    availability: String(row.availability ?? ""),
    photoUrl: String(row.photo_url ?? ""),
    bankAccountLast4: String(row.bank_account_last4 ?? ""),
    latitude: row.latitude == null ? undefined : Number(row.latitude),
    longitude: row.longitude == null ? undefined : Number(row.longitude),
    serviceRadiusKm: row.service_radius_km == null ? undefined : Number(row.service_radius_km),
  };
}

function findLocalCoach(idOrName?: string) {
  if (!idOrName) return coachProfiles[0] ?? null;
  const normalized = decodeURIComponent(idOrName).toLowerCase();
  return coachProfiles.find((coach) => coach.id === normalized || coach.name.toLowerCase() === normalized) ?? null;
}

export async function listCoaches() {
  const config = supabaseConfig();
  if (!config) return coachProfiles;
  const response = await fetch(`${config.url}/rest/v1/gym_coaches?select=*&order=name.asc`, {
    headers: supabaseHeaders(config.key),
    cache: "no-store",
  });
  if (!response.ok) {
    const details = (await response.text()).slice(0, 300);
    console.error("[supabase] gym_coaches list failed", response.status, details);
    throw new Error(`Supabase coach error (${response.status})`);
  }
  const rows = (await response.json()) as Record<string, unknown>[];
  return rows.map(fromRow);
}

export async function getCoach(idOrName?: string) {
  const config = supabaseConfig();
  if (!config) return findLocalCoach(idOrName);
  const normalized = decodeURIComponent(idOrName ?? "");
  const response = await fetch(`${config.url}/rest/v1/gym_coaches?select=*&or=(id.eq.${encodeURIComponent(normalized)},name.ilike.*${encodeURIComponent(normalized)}*)&limit=1`, {
    headers: supabaseHeaders(config.key),
    cache: "no-store",
  });
  if (!response.ok) {
    const details = (await response.text()).slice(0, 300);
    console.error("[supabase] gym_coaches lookup failed", response.status, details);
    throw new Error(`Supabase coach error (${response.status})`);
  }
  const [row] = (await response.json()) as Record<string, unknown>[];
  return row ? fromRow(row) : null;
}

export async function updateCoach(id: string, updates: Partial<Pick<CoachProfile, "specialty" | "city" | "priceFrom" | "description" | "disciplines" | "diplomas" | "sessionTypes" | "availability" | "photoUrl" | "bankAccountLast4" | "latitude" | "longitude" | "serviceRadiusKm">>) {
  const config = supabaseConfig();
  if (!config) return updateCoachProfile(id, updates);
  const body = Object.fromEntries(Object.entries(updates).map(([key, value]) => [
    key === "priceFrom" ? "price_from" : key === "sessionTypes" ? "session_types" : key === "photoUrl" ? "photo_url" : key === "bankAccountLast4" ? "bank_account_last4" : key === "serviceRadiusKm" ? "service_radius_km" : key,
    value,
  ]));
  const response = await fetch(`${config.url}/rest/v1/gym_coaches?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: supabaseHeaders(config.key, { "Content-Type": "application/json", Prefer: "return=representation" }),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Supabase coach error (${response.status})`);
  const [row] = (await response.json()) as Record<string, unknown>[];
  return row ? fromRow(row) : null;
}

export async function createStoredCoachProfile(input: { name: string; id?: string; city?: string }) {
  const localProfile = createCoachProfile({ ...input, id: input.id ?? coachIdForName(input.name) });
  const config = supabaseConfig();
  if (!config) return localProfile;
  const response = await fetch(`${config.url}/rest/v1/gym_coaches`, {
    method: "POST",
    headers: supabaseHeaders(config.key, { "Content-Type": "application/json", Prefer: "return=representation,resolution=merge-duplicates" }),
    body: JSON.stringify({
      id: localProfile.id,
      name: localProfile.name,
      sport: localProfile.sport,
      specialty: localProfile.specialty,
      city: localProfile.city,
      rating: localProfile.rating,
      review_count: localProfile.reviewCount,
      price_from: localProfile.priceFrom,
      verified: localProfile.verified,
      description: localProfile.description,
      disciplines: localProfile.disciplines,
      diplomas: localProfile.diplomas,
      session_types: localProfile.sessionTypes,
      availability: localProfile.availability,
      photo_url: localProfile.photoUrl,
      bank_account_last4: localProfile.bankAccountLast4,
    }),
  });
  if (!response.ok) throw new Error(`Supabase coach error (${response.status})`);
  const [row] = (await response.json()) as Record<string, unknown>[];
  return row ? fromRow(row) : localProfile;
}

export async function setStoredCoachVerification(id: string, verified: boolean) {
  const config = supabaseConfig();
  if (!config) return setCoachVerification(id, verified);
  const response = await fetch(`${config.url}/rest/v1/gym_coaches?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: supabaseHeaders(config.key, { "Content-Type": "application/json", Prefer: "return=representation" }),
    body: JSON.stringify({ verified }),
  });
  if (!response.ok) throw new Error(`Supabase coach error (${response.status})`);
  const [row] = (await response.json()) as Record<string, unknown>[];
  return row ? fromRow(row) : null;
}

export async function filterStoredCoaches(filters: { sport?: string; city?: string; latitude?: string; longitude?: string; radiusKm?: string }) {
  const coaches = await listCoaches();
  const origin = parseCoordinates(filters.latitude, filters.longitude);
  const radiusKm = normalizeRadiusKm(filters.radiusKm);
  if (coaches === coachProfiles) return filterCoaches(filters).map((coach) => ({ ...coach, ...(origin && coach.latitude != null && coach.longitude != null ? { distanceKm: distanceKm(origin, { latitude: coach.latitude, longitude: coach.longitude }) } : {}) }));
  const canonicalSport = canonicalSportSlug(filters.sport);
  return coaches
    .map((coach) => ({ ...coach, ...(origin && coach.latitude != null && coach.longitude != null ? { distanceKm: distanceKm(origin, { latitude: coach.latitude, longitude: coach.longitude }) } : {}) }))
    .filter((coach) => coach.verified
      && (!canonicalSport || coach.sport === canonicalSport)
      && (!filters.city || coach.city.toLowerCase() === filters.city.toLowerCase())
      && (!origin || (coach.distanceKm != null && coach.distanceKm <= radiusKm)))
    .sort((first, second) => (first.distanceKm ?? Number.POSITIVE_INFINITY) - (second.distanceKm ?? Number.POSITIVE_INFINITY));
}
