import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { isReservationClaimTokenValid } from "@/lib/reservation-claims";
import { cancelReservation, getReservation } from "@/lib/reservations";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("sportif");
  if (!session) return NextResponse.json({ error: "Connexion sportif requise pour annuler" }, { status: 401 });
  try {
    const id = (await params).id;
    const current = await getReservation(id);
    if (current && (current.ownerEmail ? current.ownerEmail !== session.email : !isReservationClaimTokenValid(id, request.headers.get("x-reservation-claim-token")))) return NextResponse.json({ error: "Accès à cette réservation refusé" }, { status: 403 });
    const reservation = await cancelReservation(id, session.email);
    return reservation ? NextResponse.json({ data: reservation }) : NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Annulation impossible" }, { status: 409 });
  }
}
