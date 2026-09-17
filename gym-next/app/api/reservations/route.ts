import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import type { Reservation } from "@/lib/domain";
import { getCoach } from "@/lib/coaches";
import { createReservation, hasSlotConflict, listReservations, ReservationSlotConflictError } from "@/lib/reservations";
import { bodyExceedsLimit, textExceedsLimit } from "@/lib/request-guards";

export async function POST(request: Request) {
  if (bodyExceedsLimit(request, 32 * 1024)) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
  const body = await request.json().catch(() => null);
  const coach = await getCoach(typeof body?.coachId === "string" ? body.coachId : body?.coach);
  const slots: string[] = Array.isArray(body?.slots)
    ? Array.from(new Set(body.slots.filter((slot: unknown): slot is string => typeof slot === "string")))
    : [];

  if (!coach) return NextResponse.json({ error: "Coach introuvable" }, { status: 404 });
  if (
    textExceedsLimit(body?.coachId, 128) ||
    textExceedsLimit(body?.service, 256) ||
    textExceedsLimit(body?.duration, 128) ||
    slots.some((slot: string) => textExceedsLimit(slot, 256) || !slot.trim()) ||
    textExceedsLimit(body?.appointmentAt, 128) ||
    !body?.coachId ||
    !body?.service ||
    !body?.duration ||
    slots.length < 1 ||
    slots.length > 3
  ) {
    return NextResponse.json({ error: "coachId, service, duration et 1 à 3 créneaux sont requis" }, { status: 400 });
  }

  try {
    if (await hasSlotConflict(coach.id, slots)) {
      return NextResponse.json({ error: "Un des créneaux est déjà demandé ou réservé" }, { status: 409 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Vérification du créneau impossible" }, { status: 502 });
  }

  const reservation: Reservation = {
    id: `res-${Date.now()}`,
    ownerEmail: (await currentSession())?.email,
    coachId: coach.id,
    coachName: coach.name,
    sport: coach.sport,
    city: coach.city,
    service: body.service,
    duration: body.duration,
    // Le tarif est une donnée métier serveur : ne jamais faire confiance au montant envoyé par le navigateur.
    price: coach.priceFrom,
    slots,
    status: "requested",
    createdAt: new Date().toISOString(),
    appointmentAt: typeof body.appointmentAt === "string" ? body.appointmentAt : slots[0],
  };

  try {
    const saved = await createReservation(reservation);
    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    const status = error instanceof ReservationSlotConflictError ? 409 : 502;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur de persistance" }, { status });
  }
}

export async function GET(request: Request) {
  try {
    const session = await currentSession();
    const requestedCoach = new URL(request.url).searchParams.get("coachId") ?? undefined;
    const requestedProfile = requestedCoach ? await getCoach(requestedCoach) : null;
    if (requestedCoach && !requestedProfile) return NextResponse.json({ error: "Coach introuvable" }, { status: 404 });

    // Le planning public ne doit exposer que les créneaux déjà pris, jamais les données de réservation.
    if (!session && requestedProfile) {
      const reservations = await listReservations({ coachId: requestedProfile.id });
      return NextResponse.json({
        data: reservations.map((reservation: Reservation) => ({ status: reservation.status, slots: reservation.slots })),
      });
    }
    if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

    if (session.role === "coach") {
      if (!session.coachId) return NextResponse.json({ data: [] });
      if (requestedProfile && requestedProfile.id !== session.coachId) {
        return NextResponse.json({ error: "Accès aux réservations refusé" }, { status: 403 });
      }
      return NextResponse.json({ data: await listReservations({ coachId: session.coachId }) });
    }
    if (session.role === "sportif") {
      if (requestedProfile) {
        const reservations = await listReservations({ coachId: requestedProfile.id });
        return NextResponse.json({
          data: reservations.map((reservation: Reservation) => ({ status: reservation.status, slots: reservation.slots })),
        });
      }
      return NextResponse.json({ data: await listReservations({ ownerEmail: session.email }) });
    }
    if (session.role !== "admin") return NextResponse.json({ error: "Accès aux réservations refusé" }, { status: 403 });
    return NextResponse.json({ data: await listReservations() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur de lecture" }, { status: 502 });
  }
}
