import {
  getDemoSessionConfig, resolveRecruiterDemoSession, sameOriginRequest,
} from "@/lib/demo-recruiter-session";
import {
  bookDemoFixture, isUuid, listMyDemoReservations, readLimitedJson,
} from "@/lib/demo-recruiter-booking";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store" };

function failure(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: noStore });
}

export async function GET(request: Request) {
  const config = getDemoSessionConfig();
  if (!config) return failure("La démonstration n’est pas configurée sur cette cible", 503);
  try {
    const active = await resolveRecruiterDemoSession(request, config);
    if (!active) return failure("Démarrez une session de démonstration pour consulter vos réservations", 401);
    const reservations = await listMyDemoReservations(config, active.session);
    const response = Response.json({ reservations }, { headers: noStore });
    if (active.cookie) response.headers.append("Set-Cookie", active.cookie);
    return response;
  } catch {
    return failure("Les réservations ne sont pas disponibles pour le moment", 503);
  }
}

export async function POST(request: Request) {
  if (!sameOriginRequest(request, process.env.NEXT_PUBLIC_APP_URL)) return failure("Origine refusée", 403);
  const config = getDemoSessionConfig();
  if (!config) return failure("La démonstration n’est pas configurée sur cette cible", 503);
  try {
    const body = await readLimitedJson(request, 2_048);
    if (!body || typeof body.fixtureKey !== "string"
      || typeof body.slotKey !== "string" || !isUuid(body.idempotencyKey)) return failure("Choisissez un coach, un créneau et réessayez", 400);
    const active = await resolveRecruiterDemoSession(request, config);
    if (!active) return failure("Votre session de démonstration a expiré ; redémarrez le parcours", 401);
    const reservationId = await bookDemoFixture(config, active.session, body.fixtureKey, body.slotKey, body.idempotencyKey);
    const response = Response.json({ reservationId }, { status: 201, headers: noStore });
    if (active.cookie) response.headers.append("Set-Cookie", active.cookie);
    return response;
  } catch (error) {
    const conflict = error instanceof Error && error.message === "slot_unavailable";
    return failure(conflict ? "Ce créneau vient d’être réservé. Choisissez-en un autre." : "La réservation de démonstration n’a pas abouti", conflict ? 409 : 503);
  }
}
