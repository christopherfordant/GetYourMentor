import type { CoachProfile } from './domain';

const fields = ['id', 'name', 'sport', 'specialty', 'city', 'rating', 'reviewCount', 'priceFrom', 'verified', 'description', 'disciplines', 'diplomas', 'sessionTypes', 'availability', 'photoUrl', 'serviceRadiusKm', 'gender', 'practice', 'level', 'format', 'availabilityTags'] as const;
export type PublicCoachProfile = Pick<CoachProfile, typeof fields[number] | 'groupPrices'> & { distanceKm?: number };

/** Explicit public projection: future private fields are never published by default. */
export function toPublicCoach(coach: CoachProfile & { distanceKm?: number }): PublicCoachProfile {
  const result: PublicCoachProfile = { id: coach.id, name: coach.name, sport: coach.sport, specialty: coach.specialty, city: coach.city, rating: coach.rating, reviewCount: coach.reviewCount, priceFrom: coach.priceFrom, verified: coach.verified, description: coach.description };
  for (const key of fields) if (coach[key] !== undefined) Object.assign(result, { [key]: coach[key] });
  if (coach.groupPrices) result.groupPrices = coach.groupPrices.map(({ participantCount, totalCents }) => ({ participantCount, totalCents }));
  if (coach.distanceKm !== undefined) result.distanceKm = coach.distanceKm;
  return result;
}
