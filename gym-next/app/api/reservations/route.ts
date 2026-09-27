import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import type { Reservation } from "@/lib/domain";
import { getCoach } from "@/lib/coaches";
import { createReservation, hasSlotConflict, listReservations, ReservationSlotConflictError } from "@/lib/reservations";
import { parseReservationInput } from "@/lib/domain/validation/reservation-input";
import { bodyExceedsLimit, rateLimit } from "@/lib/request-guards";
import { reservationClaimToken } from "@/lib/reservation-claims";

export async function POST(request: Request) {
  const limit = rateLimit(request, "reservation-create", 60, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Trop de demandes, réessayez plus tard" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  if (bodyExceedsLimit(request, 32 * 1024)) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
  const body = await request.json().catch(() => null);
  const input = parseReservationInput(body);
  if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
  const coach = await getCoach(input.data.coachId);
  const { coachId, service, duration, slots, appointmentAt } = input.data;

  if (!coach || !coach.verified) return NextResponse.json({ error: "Coach indisponible" }, { status: 404 });

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
    coachId: coach.id || coachId,
    coachName: coach.name,
    sport: coach.sport,
    city: coach.city,
    service,
    duration,
    // Le tarif est une donnée métier serveur : ne jamais faire confiance au montant envoyé par le navigateur.
    price: coach.priceFrom,
    slots,
    status: "requested",
    createdAt: new Date().toISOString(),
    appointmentAt: appointmentAt ?? slots[0],
  };

  try {
    const saved = await createReservation(reservation);
    const claimToken = saved.ownerEmail ? undefined : reservationClaimToken(saved.id);
    return NextResponse.json({ data: { ...saved, ...(claimToken ? { claimToken } : {}) } }, { status: 201 });
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
    if (requestedProfile && !requestedProfile.verified && (!session || (session.role !== "admin" && !(session.role === "coach" && session.coachId === requestedProfile.id)))) {
      return NextResponse.json({ error: "Coach indisponible" }, { status: 404 });
    }

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
