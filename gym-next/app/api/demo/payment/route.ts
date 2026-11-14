import {
  getDemoSessionConfig, resolveRecruiterDemoSession, sameOriginRequest,
} from "@/lib/demo-recruiter-session";
import { confirmDemoPayment, isUuid, listMyDemoReservations, readLimitedJson } from "@/lib/demo-recruiter-booking";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (!sameOriginRequest(request, process.env.NEXT_PUBLIC_APP_URL)) return Response.json({ error: "Origine refusée" }, { status: 403, headers: noStore });
  const config = getDemoSessionConfig();
  if (!config) return Response.json({ error: "La démonstration n’est pas configurée sur cette cible" }, { status: 503, headers: noStore });
  try {
    const body = await readLimitedJson(request, 1_024);
    if (!body || !isUuid(body.reservationId)) return Response.json({ error: "Réservation invalide" }, { status: 400, headers: noStore });
    const active = await resolveRecruiterDemoSession(request, config);
    if (!active) return Response.json({ error: "Votre session de démonstration a expiré" }, { status: 401, headers: noStore });
    const ownReservations = await listMyDemoReservations(config, active.session);
    if (!ownReservations.some((reservation) => reservation.id === body.reservationId && reservation.status === "accepted")) {
      return Response.json({ error: "Seule une réservation acceptée de votre session peut être confirmée" }, { status: 403, headers: noStore });
    }
    await confirmDemoPayment(config, active.session, body.reservationId);
    const response = Response.json({ confirmed: true, realPayment: false }, { headers: noStore });
    if (active.cookie) response.headers.append("Set-Cookie", active.cookie);
    return response;
  } catch {
    return Response.json({ error: "Le paiement de démonstration n’a pas pu être confirmé" }, { status: 503, headers: noStore });
  }
}
