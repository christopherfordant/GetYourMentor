import { expect, test } from "@playwright/test";
import {
  cronAuthorized, createRecruiterDemoSession, DEMO_SESSION_TTL_SECONDS, eraseRecruiterDemoSession,
  getDemoPurgeConfig, getDemoSessionConfig, hasDemoSessionRow, openDemoSession,
  purgeExpiredRecruiterDemoSessions, refreshRecruiterDemoSession, sameOriginRequest,
  sealDemoSession, type DemoSessionConfig, type RecruiterDemoSession,
} from "../lib/demo-recruiter-session";
import { DELETE as eraseRoute, GET as readRoute, POST as startRoute } from "../app/api/demo/session/route";
import { POST as purgeRoute } from "../app/api/cron/demo-session-purge/route";

const secret = "fixture-only-session-key-with-at-least-32-chars";
const config: DemoSessionConfig = {
  supabaseUrl: "https://rqxoovriacgoriimpbwi.supabase.co", anonKey: "anon-fixture", serviceRoleKey: "service-fixture", cookieSecret: secret,
};
const athlete: RecruiterDemoSession = {
  userId: "8cde8df1-5ec2-47d3-9fa2-714145eb8981", sessionId: "e2e0d625-9d25-4aa1-b005-cb4832ca3063",
  accessToken: "access-fixture", refreshToken: "refresh-fixture", expiresAt: Date.now() + DEMO_SESSION_TTL_SECONDS * 1000,
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

test("runtime config accepte seulement le site et le projet de démonstration désignés", () => {
  const env = {
    NODE_ENV: "production", GYM_DEMO_SESSION_ENABLED: "true", DEPLOY_ENV: "demo", SITE_ID: "86e0379e-4d1a-4cf0-936c-1439397354f4",
    NEXT_PUBLIC_APP_URL: "https://getyourmentor-demo-20261014.netlify.app", GYM_DEMO_SUPABASE_URL: config.supabaseUrl,
    GYM_DEMO_SUPABASE_ANON_KEY: config.anonKey, GYM_DEMO_SUPABASE_SERVICE_ROLE_KEY: config.serviceRoleKey,
    GYM_DEMO_SESSION_SECRET: secret, GYM_DEMO_PURGE_SECRET: secret,
  } as NodeJS.ProcessEnv;
  expect(getDemoSessionConfig(env)).not.toBeNull();
  expect(getDemoPurgeConfig(env)).toMatchObject({ supabaseUrl: config.supabaseUrl });
  expect(getDemoSessionConfig({ ...env, SITE_ID: "other" })).toBeNull();
  expect(getDemoSessionConfig({ ...env, GYM_DEMO_SUPABASE_URL: "https://example.supabase.co" })).toBeNull();
  expect(getDemoSessionConfig({ ...env, NEXT_PUBLIC_APP_URL: "https://gregarious-fox-fff605.netlify.app" })).toBeNull();
  expect(getDemoSessionConfig({ ...env, GYM_DEMO_SESSION_SECRET: "short" })).toBeNull();
});

test("cookie chiffré accepte une session valide et refuse altération, autre secret et expiration", () => {
  const cookie = sealDemoSession(athlete, secret);
  expect(openDemoSession(cookie, secret)?.sessionId).toBe(athlete.sessionId);
  expect(openDemoSession(cookie, secret + "wrong")).toBeNull();
  expect(openDemoSession(`${cookie}x`, secret)).toBeNull();
  expect(openDemoSession(sealDemoSession({ ...athlete, expiresAt: Date.now() - 1 }, secret), secret)).toBeNull();
});

test("création vérifie le caractère anonyme puis persiste une session individuelle via RLS", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input); calls.push({ url, init });
    if (url.endsWith("/auth/v1/signup")) return json({ access_token: "access-fixture", refresh_token: "refresh-fixture", expires_in: 3600, user: { id: athlete.userId } }, 200);
    if (url.endsWith("/auth/v1/user")) return json({ id: athlete.userId, is_anonymous: true });
    if (url.endsWith("/rest/v1/gym_demo_sessions")) return json([{ id: athlete.sessionId }], 201);
    throw new Error(`unexpected URL ${url}`);
  };
  const created = await createRecruiterDemoSession(config, fetcher);
  expect(created).toMatchObject({ userId: athlete.userId, sessionId: athlete.sessionId, refreshToken: "refresh-fixture" });
  expect(calls.map((call) => call.url.split("/").slice(-2).join("/"))).toEqual(["v1/signup", "v1/user", "v1/gym_demo_sessions"]);
  const write = calls[2];
  expect(write.init?.method).toBe("POST");
  expect(JSON.parse(String(write.init?.body))).toMatchObject({ owner_user_id: athlete.userId, role: "sportif" });
  expect(new Headers(write.init?.headers).get("Authorization")).toBe("Bearer access-fixture");
});

test("un utilisateur non anonyme est refusé et son identité fraîchement créée est compensée", async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input); calls.push(url);
    if (url.endsWith("/auth/v1/signup")) return json({ access_token: "access", refresh_token: "refresh", expires_in: 3600, user: { id: athlete.userId } });
    if (url.endsWith("/auth/v1/user")) return json({ id: athlete.userId, is_anonymous: false });
    if (url.includes("/auth/v1/admin/users/")) return json({ id: athlete.userId }, 200);
    throw new Error(`unexpected URL ${url}`);
  };
  await expect(createRecruiterDemoSession(config, fetcher)).rejects.toThrow("identité anonyme");
  expect(calls.at(-1)).toContain("/auth/v1/admin/users/");
  expect(calls.some((url) => url.includes("/rest/v1/gym_demo_sessions"))).toBe(false);
});

test("la vérification renouvelle uniquement le JWT du même utilisateur anonyme", async () => {
  const fetcher: typeof fetch = async (input) => String(input).includes("/auth/v1/user")
    ? json({ id: athlete.userId, is_anonymous: true }, 401)
    : json({ user: { id: athlete.userId, is_anonymous: true }, access_token: "access-new", refresh_token: "refresh-new" });
  const renewed = await refreshRecruiterDemoSession(config, athlete, fetcher);
  expect(renewed).toMatchObject({ userId: athlete.userId, accessToken: "access-new", refreshToken: "refresh-new" });
  const other: typeof fetch = async () => json({ user: { id: "8cde8df1-5ec2-47d3-9fa2-714145eb8980", is_anonymous: true }, access_token: "x", refresh_token: "y" });
  expect(await refreshRecruiterDemoSession(config, athlete, other)).toBeNull();
});

test("relecture RLS requête uniquement la ligne sportive détenue par l'identité courante", async () => {
  let requested = "";
  const fetcher: typeof fetch = async (input) => { requested = String(input); return json([{ id: athlete.sessionId }]); };
  expect(await hasDemoSessionRow(config, athlete, fetcher)).toBe(true);
  const url = new URL(requested);
  expect(url.searchParams.get("id")).toBe(`eq.${athlete.sessionId}`);
  expect(url.searchParams.get("owner_user_id")).toBe(`eq.${athlete.userId}`);
  expect(url.searchParams.get("role")).toBe("eq.sportif");
});

test("effacement supprime d'abord les données possédées, puis l'identité Auth vérifiée", async () => {
  const calls: Array<{ url: string; method: string; body?: string }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input), method = init?.method ?? "GET"; calls.push({ url, method, body: init?.body?.toString() });
    return url.includes("/rpc/gym_demo_delete_my_athlete_session") ? json(true) : json({ id: athlete.userId });
  };
  await eraseRecruiterDemoSession(config, athlete, fetcher);
  expect(calls[0].url).toContain("gym_demo_delete_my_athlete_session");
  expect(JSON.parse(calls[0].body ?? "{}")).toEqual({ p_session_id: athlete.sessionId });
  expect(calls[1]).toMatchObject({ method: "DELETE" });
  expect(calls[1].url).toContain(encodeURIComponent(athlete.userId));
});

test("purge TTL ne supprime que les identités anonymes expirées et suspend tout si le contrôle échoue", async () => {
  const userId = athlete.userId;
  const calls: Array<{ url: string; method: string }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input), method = init?.method ?? "GET"; calls.push({ url, method });
    if (url.includes("/rest/v1/gym_demo_sessions?")) return json([{ owner_user_id: userId }]);
    if (url.includes("/auth/v1/admin/users/") && method === "GET") return json({ user: { id: userId, is_anonymous: true } });
    if (url.includes("/auth/v1/admin/users/") && method === "DELETE") return json({ id: userId });
    if (url.includes("/rpc/gym_demo_purge_expired_athlete_sessions")) return json(0);
    throw new Error(`unexpected URL ${url}`);
  };
  expect(await purgeExpiredRecruiterDemoSessions(config, fetcher)).toEqual({ identitiesDeleted: 1, residualSessionsDeleted: 0 });
  expect(calls.map((call) => call.method)).toEqual(["GET", "GET", "DELETE", "POST"]);
  const unsafe: typeof fetch = async (input, init) => String(input).includes("/rest/v1/gym_demo_sessions?")
    ? json([{ owner_user_id: userId }])
    : json({ user: { id: userId, is_anonymous: false } });
  await expect(purgeExpiredRecruiterDemoSessions(config, unsafe)).rejects.toThrow("purge suspendue");
});

test("garde l'origine sur mutations et compare le secret cron sans timing leak", () => {
  expect(sameOriginRequest(new Request("https://demo.test/api/demo/session", { headers: { Origin: "https://demo.test" } }))).toBe(true);
  expect(sameOriginRequest(new Request("http://internal:3000/api/demo/session", { headers: { Origin: "https://demo.test" } }), "https://demo.test")).toBe(true);
  expect(sameOriginRequest(new Request("https://demo.test/api/demo/session", { headers: { Origin: "https://evil.test" } }))).toBe(false);
  expect(cronAuthorized(new Request("https://demo.test", { headers: { Authorization: `Bearer ${secret}` } }), secret)).toBe(true);
  expect(cronAuthorized(new Request("https://demo.test", { headers: { Authorization: "Bearer wrong" } }), secret)).toBe(false);
  expect(cronAuthorized(new Request("https://demo.test"), secret)).toBe(false);
});

test("la route de session ne s’active pas en local sans la configuration dédiée", async ({ request }) => {
  const get = await request.get("/api/demo/session");
  const origin = new URL(get.url()).origin;
  expect(get.status()).toBe(503);
  expect(await get.json()).toMatchObject({ error: expect.stringContaining("pas configurée") });
  const start = await request.post("/api/demo/session", { headers: { Origin: origin } });
  expect(start.status()).toBe(503);
  const erase = await request.delete("/api/demo/session", { headers: { Origin: origin } });
  expect(erase.status()).toBe(503);
});

test("routes réelles : démarrage, relecture, effacement Auth et cookie exclusivement simulés", async () => {
  const envKeys = ["GYM_DEMO_SESSION_ENABLED", "DEPLOY_ENV", "SITE_ID", "NEXT_PUBLIC_APP_URL", "GYM_DEMO_SUPABASE_URL", "GYM_DEMO_SUPABASE_ANON_KEY", "GYM_DEMO_SUPABASE_SERVICE_ROLE_KEY", "GYM_DEMO_SESSION_SECRET"];
  const previous = new Map(envKeys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  let identityDeletes = 0, sessionDeletes = 0;
  Object.assign(process.env, {
    GYM_DEMO_SESSION_ENABLED: "true", DEPLOY_ENV: "demo", SITE_ID: "86e0379e-4d1a-4cf0-936c-1439397354f4",
    NEXT_PUBLIC_APP_URL: "https://getyourmentor-demo-20261014.netlify.app", GYM_DEMO_SUPABASE_URL: config.supabaseUrl,
    GYM_DEMO_SUPABASE_ANON_KEY: config.anonKey, GYM_DEMO_SUPABASE_SERVICE_ROLE_KEY: config.serviceRoleKey,
    GYM_DEMO_SESSION_SECRET: secret,
  });
  globalThis.fetch = (async (input, init) => {
    const url = String(input), method = init?.method ?? "GET";
    if (url.endsWith("/auth/v1/signup")) return json({ access_token: "access-fixture", refresh_token: "refresh-fixture", expires_in: 3600, user: { id: athlete.userId } });
    if (url.endsWith("/auth/v1/user")) return json({ id: athlete.userId, is_anonymous: true });
    if (url.endsWith("/rest/v1/gym_demo_sessions") && method === "POST") return json([{ id: athlete.sessionId }], 201);
    if (url.startsWith("https://rqxoovriacgoriimpbwi.supabase.co/rest/v1/gym_demo_sessions?")) return json([{ id: athlete.sessionId }]);
    if (url.endsWith("/rpc/gym_demo_delete_my_athlete_session")) { sessionDeletes++; return json(true); }
    if (url.includes("/auth/v1/admin/users/") && method === "DELETE") { identityDeletes++; return json({ id: athlete.userId }); }
    throw new Error(`unexpected mocked request: ${method} ${url}`);
  }) as typeof fetch;
  try {
    const start = await startRoute(new Request("https://getyourmentor-demo-20261014.netlify.app/api/demo/session", { method: "POST", headers: { Origin: "https://getyourmentor-demo-20261014.netlify.app" } }));
    expect(start.status).toBe(201);
    const body = await start.json();
    expect(body).toMatchObject({ active: true });
    expect(JSON.stringify(body)).not.toContain("access-fixture");
    const setCookie = start.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
    expect(setCookie).toContain("SameSite=Strict");
    const cookie = setCookie.split(";")[0];

    const read = await readRoute(new Request("https://getyourmentor-demo-20261014.netlify.app/api/demo/session", { headers: { Cookie: cookie } }));
    expect(read.status).toBe(200);
    expect(await read.json()).toMatchObject({ active: true });

    const erase = await eraseRoute(new Request("https://getyourmentor-demo-20261014.netlify.app/api/demo/session", { method: "DELETE", headers: { Origin: "https://getyourmentor-demo-20261014.netlify.app", Cookie: cookie } }));
    expect(erase.status).toBe(200);
    expect(await erase.json()).toEqual({ erased: true });
    expect(erase.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(sessionDeletes).toBe(1);
    expect(identityDeletes).toBe(1);

    const crossOrigin = await startRoute(new Request("https://getyourmentor-demo-20261014.netlify.app/api/demo/session", { method: "POST", headers: { Origin: "https://attacker.example" } }));
    expect(crossOrigin.status).toBe(403);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test("route cron vérifie son secret avant la purge et ne renvoie aucune configuration", async () => {
  const envKeys = ["GYM_DEMO_SESSION_ENABLED", "DEPLOY_ENV", "SITE_ID", "NEXT_PUBLIC_APP_URL", "GYM_DEMO_SUPABASE_URL", "GYM_DEMO_SUPABASE_SERVICE_ROLE_KEY", "GYM_DEMO_PURGE_SECRET"];
  const previous = new Map(envKeys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  Object.assign(process.env, {
    GYM_DEMO_SESSION_ENABLED: "true", DEPLOY_ENV: "demo", SITE_ID: "86e0379e-4d1a-4cf0-936c-1439397354f4",
    NEXT_PUBLIC_APP_URL: "https://getyourmentor-demo-20261014.netlify.app", GYM_DEMO_SUPABASE_URL: config.supabaseUrl,
    GYM_DEMO_SUPABASE_SERVICE_ROLE_KEY: config.serviceRoleKey, GYM_DEMO_PURGE_SECRET: secret,
  });
  globalThis.fetch = (async (input) => {
    providerCalls++;
    return String(input).includes("/rpc/gym_demo_purge_expired_athlete_sessions") ? json(0) : json([]);
  }) as typeof fetch;
  try {
    const denied = await purgeRoute(new Request("https://getyourmentor-demo-20261014.netlify.app/api/cron/demo-session-purge", { method: "POST", headers: { Authorization: "Bearer wrong" } }));
    expect(denied.status).toBe(401);
    expect(providerCalls).toBe(0);
    const accepted = await purgeRoute(new Request("https://getyourmentor-demo-20261014.netlify.app/api/cron/demo-session-purge", { method: "POST", headers: { Authorization: `Bearer ${secret}` } }));
    expect(accepted.status).toBe(200);
    expect(await accepted.json()).toEqual({ data: { identitiesDeleted: 0, residualSessionsDeleted: 0 } });
    expect(providerCalls).toBe(2);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
