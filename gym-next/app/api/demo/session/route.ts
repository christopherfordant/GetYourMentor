import {
  createRecruiterDemoSession, DEMO_SESSION_COOKIE, DEMO_SESSION_TTL_SECONDS,
  eraseRecruiterDemoSession, getDemoSessionConfig, hasDemoSessionRow,
  openDemoSession, refreshRecruiterDemoSession, sealDemoSession, sameOriginRequest,
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

function cookieValue(request: Request) {
  const prefix = `${DEMO_SESSION_COOKIE}=`;
  const item = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  const value = item?.slice(prefix.length);
  return value && value.length <= 16_384 ? value : null;
}

function sessionCookie(value: string, expiresAt: number) {
  const maxAge = Math.max(0, Math.min(DEMO_SESSION_TTL_SECONDS, Math.floor((expiresAt - Date.now()) / 1000)));
  return `${DEMO_SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

const expiredCookie = `${DEMO_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

async function currentSession(request: Request, config: NonNullable<ReturnType<typeof getDemoSessionConfig>>, requireStoredRow = true) {
  const token = cookieValue(request);
  if (!token) return null;
  const session = openDemoSession(token, config.cookieSecret);
  if (!session) return null;
  const refreshed = await refreshRecruiterDemoSession(config, session);
  if (!refreshed || (requireStoredRow && !await hasDemoSessionRow(config, refreshed))) return null;
  return { session: refreshed, renewed: refreshed.accessToken !== session.accessToken || refreshed.refreshToken !== session.refreshToken };
}

function unavailable() {
  return json({ error: "La session de démonstration n’est pas configurée sur cette cible" }, 503);
}

export async function GET(request: Request) {
  const config = getDemoSessionConfig();
  if (!config) return unavailable();
  try {
    const result = await currentSession(request, config);
    if (!result) return json({ active: false }, 200, expiredCookie);
    const cookie = result.renewed ? sessionCookie(sealDemoSession(result.session, config.cookieSecret), result.session.expiresAt) : undefined;
    return json({ active: true, expiresAt: new Date(result.session.expiresAt).toISOString() }, 200, cookie);
  } catch {
    return json({ error: "La session de démonstration est temporairement indisponible" }, 503);
  }
}

export async function POST(request: Request) {
  if (!sameOriginRequest(request, process.env.NEXT_PUBLIC_APP_URL)) return json({ error: "Origine refusée" }, 403);
  const config = getDemoSessionConfig();
  if (!config) return unavailable();
  try {
    const existing = await currentSession(request, config);
    const session = existing?.session ?? await createRecruiterDemoSession(config);
    const cookie = !existing || existing.renewed ? sessionCookie(sealDemoSession(session, config.cookieSecret), session.expiresAt) : undefined;
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
    const result = await currentSession(request, config, false);
    if (result) await eraseRecruiterDemoSession(config, result.session);
    return json({ erased: true }, 200, expiredCookie);
  } catch {
    return json({ error: "L’effacement n’a pas pu être confirmé ; réessayez" }, 503);
  }
}
