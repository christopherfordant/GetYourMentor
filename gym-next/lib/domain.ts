import { canonicalSportSlug } from './sports-catalogue';
import type { CoachProfile } from './domain/model';
import { coachProfiles } from './fixtures/coaches';

export { canonicalSportSlug, type SportSlug } from './sports-catalogue';
export type { CoachProfile, ReservationStatus, Reservation } from './domain/model';
export { coachProfiles } from './fixtures/coaches';

export function findCoach(idOrName?: string) {
  if (!idOrName) return coachProfiles[0];
  const normalized = decodeURIComponent(idOrName).toLowerCase();
  return coachProfiles.find((coach) => coach.id === normalized || coach.name.toLowerCase() === normalized) ?? coachProfiles[0];
}

export function coachIdForName(name: string) {
  return `coach-${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function filterCoaches({ sport, city }: { sport?: string; city?: string }) {
  const canonicalSport = canonicalSportSlug(sport);
  return coachProfiles.filter((coach) => {
    if (!coach.verified) return false;
    const sportMatches = !canonicalSport || coach.sport === canonicalSport;
    const cityMatches = !city || coach.city.toLowerCase() === city.toLowerCase();
    return sportMatches && cityMatches;
  });
}

export function setCoachVerification(id: string, verified: boolean) {
  const coach = coachProfiles.find((entry) => entry.id === id);
  if (!coach) return null;
  coach.verified = verified;
  return coach;
}

export function updateCoachProfile(id: string, updates: Partial<Pick<CoachProfile, "sport" | "specialty" | "city" | "priceFrom" | "description" | "disciplines" | "diplomas" | "sessionTypes" | "availability" | "photoUrl" | "bankAccountLast4">>) {
  const coach = coachProfiles.find((entry) => entry.id === id);
  if (!coach) return null;
  Object.assign(coach, updates);
  return coach;
}

export function createCoachProfile(input: { name: string; id?: string; city?: string }) {
  const id = input.id ?? coachIdForName(input.name);
  const existing = coachProfiles.find((coach) => coach.id === id);
  if (existing) return existing;
  const coach: CoachProfile = {
    id,
    name: input.name,
    sport: "fitness",
    specialty: "Coach sportif à compléter",
    city: input.city ?? "",
    rating: 0,
    reviewCount: 0,
    priceFrom: 0,
    verified: false,
    description: "",
    disciplines: "",
    diplomas: "",
    sessionTypes: "",
    availability: "À définir",
    photoUrl: "",
    bankAccountLast4: "",
  };
  coachProfiles.push(coach);
  return coach;
}
