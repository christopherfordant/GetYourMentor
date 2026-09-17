import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { coachIdForName, createCoachProfile, findCoach } from "@/lib/domain";
import { createStoredCoachProfile } from "@/lib/coaches";

export type UserRole = "sportif" | "coach" | "club" | "admin";
type Session = { email: string; role: UserRole; coachId?: string; accessToken?: string };
type SignupProfile = { firstName: string; lastName: string; phone: string; termsAccepted: boolean };

const sessions = new Map<string, Session>();
const localUsers = new Map<string, { password: string; role: UserRole; coachId?: string }>();
const COOKIE_NAME = "gym_session";

function isUserRole(value: unknown): value is UserRole {
  return value === "sportif" || value === "coach" || value === "club" || value === "admin";
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export async function signIn(email: string, password: string, role: Session["role"]) {
  const config = supabaseConfig();
  let accessToken: string | undefined;
  let resolvedRole = role;
  let coachId: string | undefined;

  if (config) {
    const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: config.key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Identifiants invalides");
    accessToken = (await response.json()).access_token;
    const profileResponse = await fetch(`${config.url}/auth/v1/user`, {
      headers: { apikey: config.key, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!profileResponse.ok) throw new Error("Profil utilisateur indisponible");
    const profile = await profileResponse.json();
    resolvedRole = isUserRole(profile?.user_metadata?.role) ? profile.user_metadata.role : "sportif";
    coachId = typeof profile?.user_metadata?.coach_id === "string" ? profile.user_metadata.coach_id : undefined;
  } else if (!email || !password) {
    throw new Error("Identifiant et mot de passe requis");
  } else if (localUsers.has(email)) {
    const localUser = localUsers.get(email);
    if (localUser?.password !== password) throw new Error("Identifiants invalides");
    resolvedRole = localUser.role;
    coachId = localUser.coachId;
  } else if (role === "coach") {
    coachId = "steven-fordant";
  }

  const sessionId = randomUUID();
  sessions.set(sessionId, { email, role: resolvedRole, coachId, accessToken });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return { email, role: resolvedRole, coachId, coachName: coachId ? findCoach(coachId).name : undefined };
}

export async function signUp(email: string, password: string, role: UserRole, profile?: SignupProfile) {
  if (profile && (!profile.firstName || !profile.lastName || !profile.phone || !profile.termsAccepted)) {
    throw new Error("Les informations personnelles et l'acceptation des CGU sont requises");
  }
  if (!email || !password || password.length < 8) throw new Error("Un email et un mot de passe de 8 caractères sont requis");
  const config = supabaseConfig();
  if (config) {
    const coachId = role === "coach" && profile ? coachIdForName(`${profile.firstName} ${profile.lastName}`.trim()) : undefined;
    const response = await fetch(`${config.url}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: config.key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, data: { role, ...profile, ...(coachId ? { coach_id: coachId } : {}) } }),
    });
    if (!response.ok) throw new Error("Inscription impossible");
    if (coachId && profile) await createStoredCoachProfile({ id: coachId, name: `${profile.firstName} ${profile.lastName}`.trim() });
  } else {
    if (localUsers.has(email)) throw new Error("Cette adresse est déjà inscrite");
    const coach = role === "coach" && profile ? createCoachProfile({ name: `${profile.firstName} ${profile.lastName}`.trim() }) : null;
    localUsers.set(email, { password, role, coachId: coach?.id });
  }
  return signIn(email, password, role);
}

export async function currentSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? sessions.get(token) ?? null : null;
}

export async function requireRole(role: Session["role"]) {
  const session = await currentSession();
  if (!session || session.role !== role) return null;
  return session;
}
