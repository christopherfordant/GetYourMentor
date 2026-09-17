import { NextResponse } from "next/server";
import { currentSession, requireRole } from "@/lib/auth";
import { getReservation, transitionReservation } from "@/lib/reservations";
import { isReservationClaimTokenValid } from "@/lib/reservation-claims";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await currentSession();
    if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
    const reservation = await getReservation((await params).id);
    const claimToken = new URL(request.url).searchParams.get("claimToken");
    if (reservation && session.role === "sportif" && reservation.ownerEmail && reservation.ownerEmail !== session.email) {
      return NextResponse.json({ error: "Cette réservation appartient à un autre compte" }, { status: 403 });
    }
    if (reservation && session.role === "sportif" && !reservation.ownerEmail && !isReservationClaimTokenValid(reservation.id, claimToken)) {
      return NextResponse.json({ error: "Reservation claim token required" }, { status: 403 });
    }
    if (reservation && session.role === "coach" && reservation.coachId !== session.coachId) {
      return NextResponse.json({ error: "Cette réservation appartient à un autre coach" }, { status: 403 });
    }
    if (reservation && !["sportif", "coach", "admin"].includes(session.role)) {
      return NextResponse.json({ error: "Accès à la réservation refusé" }, { status: 403 });
    }
    return reservation ? NextResponse.json({ data: reservation }) : NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur de lecture" }, { status: 502 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireRole("coach");
  if (!session) {
    return NextResponse.json({ error: "Connexion coach requise" }, { status: 401 });
  }
  const current = await getReservation((await params).id);
  if (!current) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  if (!session.coachId || current.coachId !== session.coachId) {
    return NextResponse.json({ error: "Cette réservation appartient à un autre coach" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (!["accepted", "rejected", "cancelled"].includes(body?.status)) {
    return NextResponse.json({ error: "Statut coach invalide" }, { status: 400 });
  }

  try {
    const reservation = await transitionReservation((await params).id, body.status);
    return reservation ? NextResponse.json({ data: reservation }) : NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Transition impossible" }, { status: 409 });
  }
}
