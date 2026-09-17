import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { rescheduleReservation } from "@/lib/reservations";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession();
  if (!session || session.role !== "sportif") return NextResponse.json({ error: "Connexion sportif requise" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const slots = Array.isArray(body?.slots) ? body.slots.filter((slot: unknown) => typeof slot === "string" && slot.trim()).map((slot: string) => slot.trim()) : [];
  try {
    const reservation = await rescheduleReservation((await params).id, session.email, slots);
    return reservation ? NextResponse.json({ data: reservation }) : NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Déplacement impossible" }, { status: 409 });
  }
}
