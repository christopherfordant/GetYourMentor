import { NextResponse } from 'next/server';
import { isolatedCollectiveDemo, listCollectivePreview } from '@/lib/collective-preview-server';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
export async function GET() {
  if (!isolatedCollectiveDemo()) return NextResponse.json({ error: 'Séances collectives disponibles en démonstration isolée uniquement' }, { status: 503, headers });
  try { return NextResponse.json({ demo: true, data: await listCollectivePreview() }, { headers }); }
  catch { return NextResponse.json({ error: 'Séances indisponibles' }, { status: 503, headers }); }
}
