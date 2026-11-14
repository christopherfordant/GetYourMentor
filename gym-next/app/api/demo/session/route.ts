import {
  clearDemoSessionCookie, createRecruiterDemoSession,
  eraseRecruiterDemoSession, getDemoSessionConfig,
  resolveRecruiterDemoSession, sealDemoSession, serializeDemoSessionCookie, sameOriginRequest,
} from "@/lib/demo-recruiter-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };

function json(body: unknown, status = 200, cookie?: string) {
  const headers = new Headers(noStore);
  if (cookie) headers.append("Set-Cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers });
}

function unavailable() {
  return json({ error: "La session de démonstration n’est pas configurée sur cette cible" }, 503);
}

export async function GET(request: Request) {
  const config = getDemoSessionConfig();
  if (!config) return unavailable();
  try {
    const result = await resolveRecruiterDemoSession(request, config);
    if (!result) return json({ active: false }, 200, clearDemoSessionCookie);
    return json({ active: true, expiresAt: new Date(result.session.expiresAt).toISOString() }, 200, result.cookie);
  } catch {
    return json({ error: "La session de démonstration est temporairement indisponible" }, 503);
  }
}

export async function POST(request: Request) {
  if (!sameOriginRequest(request, process.env.NEXT_PUBLIC_APP_URL)) return json({ error: "Origine refusée" }, 403);
  const config = getDemoSessionConfig();
  if (!config) return unavailable();
  try {
    const existing = await resolveRecruiterDemoSession(request, config);
    const session = existing?.session ?? await createRecruiterDemoSession(config);
    const cookie = !existing ? serializeDemoSessionCookie(sealDemoSession(session, config.cookieSecret), session.expiresAt) : existing.cookie;
    return json({ active: true, expiresAt: new Date(session.expiresAt).toISOString() }, existing ? 200 : 201, cookie);
  } catch {
    return json({ error: "Impossible de démarrer la session de démonstration" }, 503);
  }
}

export async function DELETE(request: Request) {
  if (!sameOriginRequest(request, process.env.NEXT_PUBLIC_APP_URL)) return json({ error: "Origine refusée" }, 403);
  const config = getDemoSessionConfig();
  if (!config) return unavailable();
  try {
    const result = await resolveRecruiterDemoSession(request, config, false);
    if (result) await eraseRecruiterDemoSession(config, result.session);
    return json({ erased: true }, 200, clearDemoSessionCookie);
  } catch {
    return json({ error: "L’effacement n’a pas pu être confirmé ; réessayez" }, 503);
  }
}
