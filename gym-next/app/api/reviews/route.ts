import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getReservation } from "@/lib/reservations";
import { createReview } from "@/lib/reviews";
import { bodyExceedsLimit, textExceedsLimit } from "@/lib/request-guards";

export async function POST(request: Request) {
  const session = await requireRole("sportif");
  if (!session) return NextResponse.json({ error: "Connexion sportif requise" }, { status: 401 });
  if (bodyExceedsLimit(request, 16 * 1024)) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });

  const body = await request.json().catch(() => null);
  const rating = Number(body?.rating);
  if (textExceedsLimit(body?.reservationId, 128) || textExceedsLimit(body?.comment, 2000) || !body?.reservationId || !Number.isInteger(rating) || rating < 1 || rating > 5 || typeof body.comment !== "string" || !body.comment.trim()) {
    return NextResponse.json({ error: "reservationId, note de 1 à 5 et commentaire requis" }, { status: 400 });
  }

  const reservation = await getReservation(body.reservationId);
  if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  if (reservation.ownerEmail && reservation.ownerEmail !== session.email) return NextResponse.json({ error: "Cette réservation appartient à un autre compte" }, { status: 403 });
  if (reservation.status !== "paid") return NextResponse.json({ error: "Avis disponible après une séance payée" }, { status: 409 });

  try {
    const review = await createReview({
      id: `review-${Date.now()}`,
      reservationId: reservation.id,
      authorEmail: session.email,
      rating,
      comment: body.comment.trim(),
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Avis impossible" }, { status: 409 });
  }
}
