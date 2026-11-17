import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const DEMO_SESSION_COOKIE = "gym_recruiter_demo";
export const DEMO_SESSION_TTL_SECONDS = 60 * 60 * 24;
export const DEMO_SITE_ID = "86e0379e-4d1a-4cf0-936c-1439397354f4";
export const DEMO_SUPABASE_HOST = "rqxoovriacgoriimpbwi.supabase.co";
const DEMO_HOST = "getyourmentor-demo-20261014.netlify.app";
const DEMO_PREVIEW_HOST = "gym-demo-preview-20261117--getyourmentor-demo-20261014.netlify.app";

function isAllowedDemoAppUrl(app: URL, env: NodeJS.ProcessEnv) {
  if (app.protocol !== "https:" || app.username || app.password || app.port || app.pathname !== "/" || app.search || app.hash) return false;
  if (app.hostname === DEMO_HOST) return !env.CONTEXT || env.CONTEXT === "production";
  // A fixed, site-owned draft alias is stable even when Netlify's per-deploy
  // DEPLOY_PRIME_URL points at its unique deployment URL.
  // Netlify assigns an alias deploy to the named branch-deploy context, not
  // the Deploy Preview context. Keep this exact host/context pair isolated.
  return app.hostname === DEMO_PREVIEW_HOST && env.CONTEXT === "branch-deploy";
}

export type RecruiterDemoSession = {
  userId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type DemoSessionConfig = {
  supabaseUrl: string;
  publishableKey: string;
  secretKey: string;
  cookieSecret: string;
};

export type DemoPurgeConfig = { supabaseUrl: string; secretKey: string };

type Fetcher = typeof fetch;

export function isDemoRecruiterEntryEnabled(env: NodeJS.ProcessEnv = process.env) {
  try {
    const app = new URL(env.NEXT_PUBLIC_APP_URL ?? "");
    return env.GYM_DEMO_SESSION_ENABLED === "true" && env.DEPLOY_ENV === "demo"
      && env.SITE_ID === DEMO_SITE_ID && isAllowedDemoAppUrl(app, env);
  } catch {
    return false;
  }
}

export function getDemoSessionAvailability(env: NodeJS.ProcessEnv = process.env) {
  if (env.GYM_DEMO_SESSION_ENABLED !== "true") return "disabled" as const;
  if (env.DEPLOY_ENV !== "demo") return "wrong-environment" as const;
  if (env.SITE_ID !== DEMO_SITE_ID) return "wrong-site" as const;
  try {
    const app = new URL(env.NEXT_PUBLIC_APP_URL ?? "");
    if (!isAllowedDemoAppUrl(app, env)) return "origin-not-allowed" as const;
    const supabase = new URL(env.GYM_DEMO_SUPABASE_URL ?? "");
    if (supabase.protocol !== "https:" || supabase.hostname !== DEMO_SUPABASE_HOST) return "storage-unconfigured" as const;
  } catch {
    return "configuration-invalid" as const;
  }
  if (!(env.GYM_DEMO_SUPABASE_PUBLISHABLE_KEY ?? "").startsWith("sb_publishable_")
    || !(env.GYM_DEMO_SUPABASE_SECRET_KEY ?? "").startsWith("sb_secret_")) return "service-keys-missing" as const;
  if ((env.GYM_DEMO_SESSION_SECRET ?? "").length < 32) return "session-secret-missing" as const;
  return "ready" as const;
}

function requestCookieValue(request: Request) {
  const prefix = `${DEMO_SESSION_COOKIE}=`;
  const item = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  const value = item?.slice(prefix.length);
  return value && value.length <= 16_384 ? value : null;
}

export function serializeDemoSessionCookie(value: string, expiresAt: number) {
  const maxAge = Math.max(0, Math.min(DEMO_SESSION_TTL_SECONDS, Math.floor((expiresAt - Date.now()) / 1000)));
  return `${DEMO_SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export const clearDemoSessionCookie = `${DEMO_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export async function resolveRecruiterDemoSession(
  request: Request,
  config: DemoSessionConfig,
  requireStoredRow = true,
  fetcher: Fetcher = fetch,
) {
  const token = requestCookieValue(request);
  if (!token) return null;
  const session = openDemoSession(token, config.cookieSecret);
  if (!session) return null;
  const refreshed = await refreshRecruiterDemoSession(config, session, fetcher);
  if (!refreshed || (requireStoredRow && !await hasDemoSessionRow(config, refreshed, fetcher))) return null;
  return {
    session: refreshed,
    renewed: refreshed.accessToken !== session.accessToken || refreshed.refreshToken !== session.refreshToken,
    cookie: refreshed.accessToken !== session.accessToken || refreshed.refreshToken !== session.refreshToken
      ? serializeDemoSessionCookie(sealDemoSession(refreshed, config.cookieSecret), refreshed.expiresAt)
      : undefined,
  };
}

export function getDemoSessionConfig(env: NodeJS.ProcessEnv = process.env): DemoSessionConfig | null {
  if (getDemoSessionAvailability(env) !== "ready") return null;
  try {
    const app = new URL(env.NEXT_PUBLIC_APP_URL ?? "");
    const supabase = new URL(env.GYM_DEMO_SUPABASE_URL ?? "");
    const config = {
      supabaseUrl: supabase.origin,
      publishableKey: env.GYM_DEMO_SUPABASE_PUBLISHABLE_KEY ?? "",
      secretKey: env.GYM_DEMO_SUPABASE_SECRET_KEY ?? "",
      cookieSecret: env.GYM_DEMO_SESSION_SECRET ?? "",
    };
    return config;
  } catch {
    return null;
  }
}

export function getDemoPurgeConfig(env: NodeJS.ProcessEnv = process.env): DemoPurgeConfig | null {
  try {
    const app = new URL(env.NEXT_PUBLIC_APP_URL ?? env.URL ?? "");
    const supabase = new URL(env.GYM_DEMO_SUPABASE_URL ?? "");
    if (env.GYM_DEMO_SESSION_ENABLED !== "true" || env.DEPLOY_ENV !== "demo"
      || env.SITE_ID !== DEMO_SITE_ID || !isAllowedDemoAppUrl(app, env)
      || supabase.protocol !== "https:" || supabase.hostname !== DEMO_SUPABASE_HOST
      || !(env.GYM_DEMO_SUPABASE_SECRET_KEY ?? "").startsWith("sb_secret_")
      || (env.GYM_DEMO_PURGE_SECRET ?? "").length < 32) return null;
    return { supabaseUrl: supabase.origin, secretKey: env.GYM_DEMO_SUPABASE_SECRET_KEY! };
  } catch {
    return null;
  }
}

function encryptionKey(secret: string) {
  if (secret.length < 32) throw new Error("Demo session secret unavailable");
  return createHash("sha256").update(secret).digest();
}

export function sealDemoSession(session: RecruiterDemoSession, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify({ v: 1, session }), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString("base64url")).join(".");
}

export function openDemoSession(value: string, secret: string, now = Date.now()): RecruiterDemoSession | null {
  try {
    if (value.length > 16_384) return null;
    const parts = value.split(".");
    if (parts.length !== 3 || parts.some((part) => !part)) return null;
    const [iv, tag, encrypted] = parts.map((part) => Buffer.from(part, "base64url"));
    if (iv.length !== 12 || tag.length !== 16) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(secret), iv);
    decipher.setAuthTag(tag);
    const payload = JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8"));
    const session = payload?.session;
    if (payload?.v !== 1 || !session || !isUuid(session.userId) || !isUuid(session.sessionId)
      || typeof session.accessToken !== "string" || !session.accessToken
      || typeof session.refreshToken !== "string" || !session.refreshToken
      || !Number.isSafeInteger(session.expiresAt) || session.expiresAt <= now
      || session.expiresAt - now > DEMO_SESSION_TTL_SECONDS * 1000) return null;
    return session as RecruiterDemoSession;
  } catch {
    return null;
  }
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function headers(key: string, accessToken?: string, extra?: Record<string, string>) {
  return { apikey: key, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...extra };
}

async function parseJson(response: Response) {
  return response.json().catch(() => null) as Promise<any>;
}

async function adminDelete(config: DemoSessionConfig, userId: string, fetcher: Fetcher) {
  return fetcher(`${config.supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: headers(config.secretKey),
    cache: "no-store",
  });
}

export async function createRecruiterDemoSession(config: DemoSessionConfig, fetcher: Fetcher = fetch): Promise<RecruiterDemoSession> {
  const created = await fetcher(`${config.supabaseUrl}/auth/v1/signup`, {
    method: "POST", headers: headers(config.publishableKey, undefined, { "Content-Type": "application/json" }),
    body: JSON.stringify({ data: { demo_role: "sportif" } }), cache: "no-store",
  });
  const auth = await parseJson(created);
  const authSession = auth?.session ?? auth;
  const userId = auth?.user?.id ?? authSession?.user?.id;
  if (!created.ok || !isUuid(userId) || typeof authSession?.access_token !== "string"
    || typeof authSession?.refresh_token !== "string" || !Number.isFinite(authSession?.expires_in)) {
    throw new Error("La session sportive de démonstration n’a pas pu être créée");
  }

  try {
    const verified = await fetcher(`${config.supabaseUrl}/auth/v1/user`, {
      headers: headers(config.publishableKey, authSession.access_token), cache: "no-store",
    });
    const profile = await parseJson(verified);
    if (!verified.ok || profile?.id !== userId || profile?.is_anonymous !== true) throw new Error("L’identité anonyme n’a pas été vérifiée");

    const expiresAt = Date.now() + DEMO_SESSION_TTL_SECONDS * 1000;
    const stored = await fetcher(`${config.supabaseUrl}/rest/v1/gym_demo_sessions`, {
      method: "POST",
      headers: headers(config.publishableKey, authSession.access_token, { "Content-Type": "application/json", Prefer: "return=representation" }),
      body: JSON.stringify({ owner_user_id: userId, role: "sportif", expires_at: new Date(expiresAt).toISOString() }),
      cache: "no-store",
    });
    const rows = await parseJson(stored);
    const sessionId = Array.isArray(rows) ? rows[0]?.id : null;
    if (!stored.ok || !isUuid(sessionId)) throw new Error("La session de démonstration n’a pas pu être persistée");
    return { userId, sessionId, accessToken: authSession.access_token, refreshToken: authSession.refresh_token, expiresAt };
  } catch (error) {
    await adminDelete(config, userId, fetcher).catch(() => undefined);
    throw error;
  }
}

export async function refreshRecruiterDemoSession(config: DemoSessionConfig, session: RecruiterDemoSession, fetcher: Fetcher = fetch): Promise<RecruiterDemoSession | null> {
  const current = await fetcher(`${config.supabaseUrl}/auth/v1/user`, {
    headers: headers(config.publishableKey, session.accessToken), cache: "no-store",
  });
  if (current.ok) {
    const user = await parseJson(current);
    return user?.id === session.userId && user?.is_anonymous === true ? session : null;
  }
  if (current.status !== 401 || session.expiresAt <= Date.now()) return null;
  const renewed = await fetcher(`${config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST", headers: headers(config.publishableKey, undefined, { "Content-Type": "application/json" }),
    body: JSON.stringify({ refresh_token: session.refreshToken }), cache: "no-store",
  });
  const data = await parseJson(renewed);
  if (!renewed.ok || data?.user?.id !== session.userId || data?.user?.is_anonymous !== true
    || typeof data.access_token !== "string" || typeof data.refresh_token !== "string") return null;
  return { ...session, accessToken: data.access_token, refreshToken: data.refresh_token };
}

export async function hasDemoSessionRow(config: DemoSessionConfig, session: RecruiterDemoSession, fetcher: Fetcher = fetch) {
  const url = new URL(`${config.supabaseUrl}/rest/v1/gym_demo_sessions`);
  url.searchParams.set("id", `eq.${session.sessionId}`);
  url.searchParams.set("owner_user_id", `eq.${session.userId}`);
  url.searchParams.set("role", "eq.sportif");
  url.searchParams.set("select", "id");
  const response = await fetcher(url, { headers: headers(config.publishableKey, session.accessToken), cache: "no-store" });
  const rows = await parseJson(response);
  return response.ok && Array.isArray(rows) && rows.some((row) => row?.id === session.sessionId);
}

export async function eraseRecruiterDemoSession(config: DemoSessionConfig, session: RecruiterDemoSession, fetcher: Fetcher = fetch) {
  const rpc = await fetcher(`${config.supabaseUrl}/rest/v1/rpc/gym_demo_delete_my_athlete_session`, {
    method: "POST", headers: headers(config.publishableKey, session.accessToken, { "Content-Type": "application/json" }),
    body: JSON.stringify({ p_session_id: session.sessionId }), cache: "no-store",
  });
  if (!rpc.ok) throw new Error("L’effacement des données de démonstration a échoué");
  const deleted = await parseJson(rpc);
  if (deleted !== true && deleted !== false) throw new Error("Résultat d’effacement non vérifiable");
  const identity = await adminDelete(config, session.userId, fetcher);
  if (!identity.ok && identity.status !== 404) throw new Error("Les données sont effacées, mais l’identité anonyme reste à supprimer");
}

export async function purgeExpiredRecruiterDemoSessions(config: DemoPurgeConfig, fetcher: Fetcher = fetch) {
  const url = new URL(`${config.supabaseUrl}/rest/v1/gym_demo_sessions`);
  url.searchParams.set("role", "eq.sportif");
  url.searchParams.set("expires_at", `lte.${new Date().toISOString()}`);
  url.searchParams.set("select", "owner_user_id");
  const expired = await fetcher(url, { headers: headers(config.secretKey), cache: "no-store" });
  const rows = await parseJson(expired);
  if (!expired.ok || !Array.isArray(rows) || rows.some((row) => !isUuid(row?.owner_user_id))) throw new Error("Les sessions expirées n’ont pas pu être vérifiées");
  const uniqueUsers = [...new Set(rows.map((row) => row.owner_user_id as string))];
  for (const userId of uniqueUsers) {
    const userUrl = `${config.supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`;
    const userResponse = await fetcher(userUrl, { headers: headers(config.secretKey), cache: "no-store" });
    if (userResponse.status === 404) continue;
    const userPayload = await parseJson(userResponse);
    const user = userPayload?.user ?? userPayload;
    if (!userResponse.ok || user?.id !== userId || user?.is_anonymous !== true) throw new Error("Une identité expirée n’a pas été vérifiée comme anonyme ; purge suspendue");
    const deleted = await fetcher(userUrl, { method: "DELETE", headers: headers(config.secretKey), cache: "no-store" });
    if (!deleted.ok && deleted.status !== 404) throw new Error("La suppression d’une identité expirée a échoué ; purge suspendue");
  }
  const response = await fetcher(`${config.supabaseUrl}/rest/v1/rpc/gym_demo_purge_expired_athlete_sessions`, {
    method: "POST", headers: headers(config.secretKey, undefined, { "Content-Type": "application/json" }),
    body: "{}", cache: "no-store",
  });
  if (!response.ok) throw new Error("La purge des données expirées a échoué");
  const remaining = await parseJson(response);
  if (!Number.isSafeInteger(remaining) || remaining < 0) throw new Error("Résultat de purge non vérifiable");
  return { identitiesDeleted: uniqueUsers.length, residualSessionsDeleted: remaining as number };
}

export function sameOriginRequest(request: Request, publicUrl?: string) {
  const origin = request.headers.get("origin");
  try { return !!origin && new URL(origin).origin === new URL(publicUrl ?? request.url).origin; } catch { return false; }
}

export function cronAuthorized(request: Request, expected: string | undefined) {
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!expected || expected.length < 32 || !provided) return false;
  const a = Buffer.from(expected), b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}
