import type { DemoSessionConfig, RecruiterDemoSession } from "@/lib/demo-recruiter-session";

type Fetcher = typeof fetch;
type JsonRecord = Record<string, unknown>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const restHeaders = (key: string, token?: string, extra?: Record<string, string>) => ({
  apikey: key,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
});

async function json(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

function safeErrorText(value: unknown) {
  return value && typeof value === "object" && "message" in value && typeof value.message === "string"
    ? value.message.slice(0, 200)
    : "";
}

export type DemoFixture = {
  fixtureKey: string;
  name: string;
  sport: string;
  city: string;
  service: string;
  priceCents: number;
  slots: Array<{ key: string; dayOffset: number; startsAtUtc: string; durationMinutes: number }>;
};

export type DemoReservation = {
  id: string;
  coachName: string;
  sport: string;
  service: string;
  appointmentAt: string;
  status: "accepted";
  approvalMode: "simulated";
  priceCents: number;
  paymentStatus: "not_started" | "simulated_confirmed";
  createdAt: string;
};

function templateStartsAtUtc(dayOffset: number, time: string, now: Date) {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time);
  if (!match) return null;
  const [, hourText, minuteText, secondText = "0"] = match;
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (hour > 23 || minute > 59 || second > 59) return null;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset,
    hour, minute, second)).toISOString();
}

export async function listDemoFixtures(config: DemoSessionConfig, fetcher: Fetcher = fetch): Promise<DemoFixture[]> {
  const catalogUrl = new URL(`${config.supabaseUrl}/rest/v1/gym_demo_fixture_catalog`);
  catalogUrl.searchParams.set("active", "eq.true");
  catalogUrl.searchParams.set("select", "fixture_key,display_name,sport,city_label,service_label,display_price_cents");
  catalogUrl.searchParams.set("order", "display_name.asc");
  const templatesUrl = new URL(`${config.supabaseUrl}/rest/v1/gym_demo_fixture_slot_templates`);
  templatesUrl.searchParams.set("select", "fixture_key,slot_key,day_offset,starts_at_utc,duration_minutes");
  templatesUrl.searchParams.set("order", "day_offset.asc,starts_at_utc.asc");
  const [catalogResponse, slotsResponse] = await Promise.all([
    fetcher(catalogUrl, { headers: restHeaders(config.publishableKey), cache: "no-store" }),
    fetcher(templatesUrl, { headers: restHeaders(config.publishableKey), cache: "no-store" }),
  ]);
  const catalog = await json(catalogResponse);
  const templates = await json(slotsResponse);
  if (!catalogResponse.ok || !slotsResponse.ok || !Array.isArray(catalog) || !Array.isArray(templates)) {
    throw new Error("Catalogue de démonstration indisponible");
  }
  const activeFixtureKeys = (catalog as JsonRecord[])
    .map((row) => row.fixture_key)
    .filter((key): key is string => typeof key === "string" && /^[a-z0-9_-]{2,40}$/.test(key));
  const bookedSlots = new Set<string>();
  const coachIdsByFixture = new Map<string, string>();
  if (activeFixtureKeys.length) {
    const coachesUrl = new URL(`${config.supabaseUrl}/rest/v1/gym_demo_coaches`);
    coachesUrl.searchParams.set("is_fixture", "eq.true");
    coachesUrl.searchParams.set("owner_session_id", "is.null");
    coachesUrl.searchParams.set("fixture_key", `in.(${activeFixtureKeys.join(",")})`);
    coachesUrl.searchParams.set("select", "id,fixture_key");
    const coachesResponse = await fetcher(coachesUrl, { headers: restHeaders(config.publishableKey), cache: "no-store" });
    const coaches = await json(coachesResponse);
    if (!coachesResponse.ok || !Array.isArray(coaches)) throw new Error("Demo availability unavailable");
    for (const row of coaches as JsonRecord[]) {
      if (typeof row.id === "string" && uuidPattern.test(row.id) && typeof row.fixture_key === "string"
        && activeFixtureKeys.includes(row.fixture_key)) coachIdsByFixture.set(row.fixture_key, row.id);
    }
    if (coachIdsByFixture.size) {
      const bookedUrl = new URL(`${config.supabaseUrl}/rest/v1/gym_demo_slots`);
      bookedUrl.searchParams.set("coach_id", `in.(${[...coachIdsByFixture.values()].join(",")})`);
      bookedUrl.searchParams.set("state", "eq.booked");
      bookedUrl.searchParams.set("select", "coach_id,starts_at,state");
      const bookedResponse = await fetcher(bookedUrl, { headers: restHeaders(config.publishableKey), cache: "no-store" });
      const booked = await json(bookedResponse);
      if (!bookedResponse.ok || !Array.isArray(booked)) throw new Error("Demo availability unavailable");
      for (const row of booked as JsonRecord[]) {
        if (typeof row.coach_id !== "string" || typeof row.starts_at !== "string") continue;
        const start = new Date(row.starts_at);
        if (!Number.isNaN(start.getTime())) bookedSlots.add(`${row.coach_id}:${start.toISOString()}`);
      }
    }
  }
  const now = new Date();
  return (catalog as JsonRecord[]).flatMap((row) => {
    const fixtureKey = row.fixture_key;
    if (typeof fixtureKey !== "string" || !/^[a-z0-9_-]{2,40}$/.test(fixtureKey)
      || typeof row.display_name !== "string" || typeof row.sport !== "string"
      || typeof row.city_label !== "string" || typeof row.service_label !== "string"
      || !Number.isSafeInteger(row.display_price_cents)) return [];
    const slots = (templates as JsonRecord[]).filter((slot) => slot.fixture_key === fixtureKey).flatMap((slot) => {
      if (typeof slot.slot_key !== "string" || !/^[a-z0-9_-]{2,40}$/.test(slot.slot_key)
        || !Number.isSafeInteger(slot.day_offset) || !Number.isSafeInteger(slot.duration_minutes)
        || typeof slot.starts_at_utc !== "string") return [];
      const start = templateStartsAtUtc(Number(slot.day_offset), slot.starts_at_utc, now);
      if (!start || Date.parse(start) <= now.getTime()
        || bookedSlots.has(`${coachIdsByFixture.get(fixtureKey)}:${start}`)) return [];
      return [{ key: slot.slot_key, dayOffset: Number(slot.day_offset), startsAtUtc: slot.starts_at_utc,
        durationMinutes: Number(slot.duration_minutes) }];
    });
    return [{ fixtureKey, name: row.display_name, sport: row.sport, city: row.city_label,
      service: row.service_label, priceCents: Number(row.display_price_cents), slots }];
  });
}

export async function listMyDemoReservations(
  config: DemoSessionConfig, session: RecruiterDemoSession, fetcher: Fetcher = fetch,
): Promise<DemoReservation[]> {
  const url = new URL(`${config.supabaseUrl}/rest/v1/gym_demo_reservations`);
  url.searchParams.set("athlete_session_id", `eq.${session.sessionId}`);
  url.searchParams.set("select", "id,coach_name_snapshot,sport_snapshot,service_snapshot,appointment_at,status,approval_mode,display_price_cents,payment_status,created_at");
  url.searchParams.set("order", "created_at.desc");
  const response = await fetcher(url, { headers: restHeaders(config.publishableKey, session.accessToken), cache: "no-store" });
  const rows = await json(response);
  if (!response.ok || !Array.isArray(rows)) throw new Error("Réservations de démonstration indisponibles");
  return (rows as JsonRecord[]).flatMap((row) => {
    if (typeof row.id !== "string" || !uuidPattern.test(row.id) || row.status !== "accepted"
      || row.approval_mode !== "simulated" || !["not_started", "simulated_confirmed"].includes(String(row.payment_status))
      || typeof row.coach_name_snapshot !== "string" || typeof row.sport_snapshot !== "string"
      || typeof row.service_snapshot !== "string" || typeof row.appointment_at !== "string"
      || typeof row.created_at !== "string" || !Number.isSafeInteger(row.display_price_cents)) return [];
    return [{ id: row.id, coachName: row.coach_name_snapshot, sport: row.sport_snapshot,
      service: row.service_snapshot, appointmentAt: row.appointment_at, status: "accepted" as const,
      approvalMode: "simulated" as const, priceCents: Number(row.display_price_cents),
      paymentStatus: row.payment_status as DemoReservation["paymentStatus"], createdAt: row.created_at }];
  });
}

export async function bookDemoFixture(
  config: DemoSessionConfig, session: RecruiterDemoSession, fixtureKey: string, slotKey: string,
  idempotencyKey: string, fetcher: Fetcher = fetch,
) {
  if (!/^[a-z0-9_-]{2,40}$/.test(fixtureKey) || !/^[a-z0-9_-]{2,40}$/.test(slotKey)
    || !uuidPattern.test(idempotencyKey)) throw new Error("invalid_request");
  const response = await fetcher(`${config.supabaseUrl}/rest/v1/rpc/gym_demo_book_and_accept_fixture`, {
    method: "POST", headers: restHeaders(config.secretKey, undefined, { "Content-Type": "application/json" }),
    body: JSON.stringify({ p_athlete_session_id: session.sessionId, p_fixture_key: fixtureKey,
      p_slot_key: slotKey, p_idempotency_key: idempotencyKey }), cache: "no-store",
  });
  const body = await json(response);
  if (!response.ok || typeof body !== "string" || !uuidPattern.test(body)) {
    throw new Error(safeErrorText(body).toLowerCase().includes("unavailable") ? "slot_unavailable" : "booking_failed");
  }
  return body;
}

export async function confirmDemoPayment(
  config: DemoSessionConfig, session: RecruiterDemoSession, reservationId: string, fetcher: Fetcher = fetch,
) {
  if (!uuidPattern.test(reservationId)) throw new Error("invalid_request");
  const response = await fetcher(`${config.supabaseUrl}/rest/v1/rpc/gym_demo_confirm_simulated_payment`, {
    method: "POST", headers: restHeaders(config.secretKey, undefined, { "Content-Type": "application/json" }),
    body: JSON.stringify({ p_athlete_session_id: session.sessionId, p_reservation_id: reservationId }), cache: "no-store",
  });
  const body = await json(response);
  if (!response.ok || typeof body !== "boolean") throw new Error("payment_failed");
  return body;
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

export async function readLimitedJson(request: Request, maxBytes: number): Promise<Record<string, unknown> | null> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let byteLength = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}
