import { MENTOR_PREVIEW_LIMIT } from './mentor-preview';

// Server catalogue read, separate from the client DTO and unrelated histories.
export async function readPublicMentorRows(url: string, headers: Record<string, string>): Promise<Array<Record<string, unknown>>> {
  const query = new URLSearchParams({ select: 'id,name,sport,specialty,city,price_from,photo_url,description,session_types,session_format,practice,level', verified: 'eq.true', order: 'name.asc,id.asc', limit: String(MENTOR_PREVIEW_LIMIT) });
  const response = await fetch(`${url}/rest/v1/gym_coaches?${query}`, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Catalogue indisponible');
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || rows.length > MENTOR_PREVIEW_LIMIT) throw new Error('Invalid catalogue response');
  return rows;
}
