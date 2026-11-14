import { NextResponse } from "next/server";
import { cronAuthorized, getDemoPurgeConfig, purgeExpiredRecruiterDemoSessions } from "@/lib/demo-recruiter-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const secret = process.env.GYM_DEMO_PURGE_SECRET;
  if (!cronAuthorized(request, secret)) return NextResponse.json({ error: "Accès refusé" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const config = getDemoPurgeConfig();
  if (!config) return NextResponse.json({ error: "La purge n’est pas configurée sur la cible de démonstration" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const result = await purgeExpiredRecruiterDemoSessions(config);
    return NextResponse.json({ data: result }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "La purge des sessions de démonstration a échoué" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
