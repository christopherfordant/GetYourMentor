import type { SportSlug } from './domain';

export const MENTOR_PREVIEW_LIMIT = 6;
export type MentorPreview = { id: string; name: string; sport: SportSlug; specialty: string; city: string; priceFrom: number | null; photoUrl?: string };

export function readMentorPreview(value: unknown): { data: MentorPreview[]; demo: boolean } {
  const response = value as { data?: unknown; demo?: unknown } | null;
  if (!response || !Array.isArray(response.data) || response.data.length > MENTOR_PREVIEW_LIMIT || typeof response.demo !== 'boolean') throw new Error('Invalid preview');
  const ids = new Set<string>();
  const data = response.data.map((value: unknown) => {
    const row = value as MentorPreview | null;
    if (!row || typeof row.id !== 'string' || !row.id.trim() || ids.has(row.id) || typeof row.name !== 'string' || !row.name.trim()
      || !['football', 'basketball', 'fitness', 'sports-de-combat'].includes(row.sport) || typeof row.city !== 'string' || typeof row.specialty !== 'string'
      || !(row.priceFrom === null || (typeof row.priceFrom === 'number' && Number.isFinite(row.priceFrom) && row.priceFrom >= 0))
      || !(row.photoUrl === undefined || typeof row.photoUrl === 'string')) throw new Error('Invalid mentor');
    ids.add(row.id);
    return { id: row.id, name: row.name, sport: row.sport, specialty: row.specialty, city: row.city, priceFrom: row.priceFrom, ...(row.photoUrl ? { photoUrl: row.photoUrl } : {}) };
  });
  return { data, demo: response.demo };
}
