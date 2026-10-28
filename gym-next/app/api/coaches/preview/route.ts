import { NextResponse } from 'next/server';
import { listMentorPreview } from '@/lib/coaches';
import { isDemoFallbackAllowed } from '@/lib/runtime';
import { readMentorPreview } from '@/lib/mentor-preview';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const result = readMentorPreview({ data: await listMentorPreview(), demo: isDemoFallbackAllowed() });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Le catalogue est momentanément indisponible.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
