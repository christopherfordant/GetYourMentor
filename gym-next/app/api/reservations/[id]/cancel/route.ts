import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { cancelReservation } from "@/lib/reservations";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("sportif");
  if (!session) return NextResponse.json({ error: "Connexion sportif requise pour annuler" }, { status: 401 });
  try {
    const reservation = await cancelReservation((await params).id, session.email);
    return reservation ? NextResponse.json({ data: reservation }) : NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Annulation impossible" }, { status: 409 });
  }
}
