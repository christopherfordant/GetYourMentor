import { isSportSlug } from '@/lib/sports-catalogue';
import type { SportSlug } from './domain';

export const MENTOR_PREVIEW_LIMIT = 6;
export type MentorPreview = { id: string; name: string; sport: SportSlug; specialty: string; city: string; priceFrom: number | null; photoUrl?: string; description?: string; sessionTypes?: string; format?: 'presentiel' | 'visio'; practice?: 'interieur' | 'exterieur'; level?: 'debutant' | 'intermediaire' | 'confirme' };

export function readMentorPreview(value: unknown): { data: MentorPreview[]; demo: boolean; showDemoPortraits: boolean } {
  const response = value as { data?: unknown; demo?: unknown; showDemoPortraits?: unknown } | null;
  if (!response || !Array.isArray(response.data) || response.data.length > MENTOR_PREVIEW_LIMIT || typeof response.demo !== 'boolean') throw new Error('Invalid preview');
  const ids = new Set<string>();
  const data = response.data.map((value: unknown) => {
    const row = value as MentorPreview | null;
    if (!row || typeof row.id !== 'string' || !row.id.trim() || ids.has(row.id) || typeof row.name !== 'string' || !row.name.trim()
      || !isSportSlug(row.sport) || typeof row.city !== 'string' || typeof row.specialty !== 'string'
      || !(row.priceFrom === null || (typeof row.priceFrom === 'number' && Number.isFinite(row.priceFrom) && row.priceFrom >= 0))
      || !(row.photoUrl === undefined || typeof row.photoUrl === 'string')) throw new Error('Invalid mentor');
    for (const key of ['description', 'sessionTypes'] as const) {
      if (row[key] !== undefined && (typeof row[key] !== 'string' || row[key]!.length > 5000)) throw new Error('Invalid public description');
    }
    if (row.format !== undefined && !['presentiel', 'visio'].includes(row.format)) throw new Error('Invalid format');
    if (row.practice !== undefined && !['interieur', 'exterieur'].includes(row.practice)) throw new Error('Invalid practice');
    if (row.level !== undefined && !['debutant', 'intermediaire', 'confirme'].includes(row.level)) throw new Error('Invalid level');
    ids.add(row.id);
    return { id: row.id, name: row.name, sport: row.sport, specialty: row.specialty, city: row.city, priceFrom: row.priceFrom,
      ...(row.photoUrl ? { photoUrl: row.photoUrl } : {}), ...(row.description?.trim() ? { description: row.description.trim() } : {}),
      ...(row.sessionTypes?.trim() ? { sessionTypes: row.sessionTypes.trim() } : {}), ...(row.format ? { format: row.format } : {}),
      ...(row.practice ? { practice: row.practice } : {}), ...(row.level ? { level: row.level } : {}) };
  });
  if (response.showDemoPortraits !== undefined && typeof response.showDemoPortraits !== 'boolean') throw new Error('Invalid demo option');
  return { data, demo: response.demo, showDemoPortraits: response.demo && response.showDemoPortraits === true };
}
