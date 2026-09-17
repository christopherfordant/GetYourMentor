import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { type Reservation } from "@/lib/domain";
import { listCoaches } from "@/lib/coaches";
import { listReservations } from "@/lib/reservations";
import { listClubLeads } from "@/lib/clubs";

export async function GET() {
  if (!(await requireRole("admin"))) return NextResponse.json({ error: "Connexion admin requise" }, { status: 401 });
  try {
    const reservations: Reservation[] = await listReservations();
    const coachProfiles = await listCoaches();
    const clubLeads = listClubLeads();
    return NextResponse.json({ data: {
      coaches: coachProfiles.length,
      verifiedCoaches: coachProfiles.filter((coach) => coach.verified).length,
      reservations: reservations.length,
      requested: reservations.filter((reservation) => reservation.status === "requested").length,
      accepted: reservations.filter((reservation) => reservation.status === "accepted").length,
      paid: reservations.filter((reservation) => reservation.status === "paid").length,
      coachList: coachProfiles.map((coach) => ({
        id: coach.id,
        name: coach.name,
        sport: coach.sport,
        city: coach.city,
        verified: coach.verified,
        profileComplete: Boolean(coach.specialty && coach.city && coach.description && coach.disciplines && coach.diplomas && coach.sessionTypes && coach.photoUrl && coach.bankAccountLast4),
      })),
      reservationList: reservations.map((reservation) => ({ id: reservation.id, coachName: reservation.coachName, service: reservation.service, status: reservation.status, price: reservation.price })),
      clubLeads: clubLeads.length,
      pendingClubLeads: clubLeads.filter((lead) => lead.status === "pending").length,
      clubLeadList: clubLeads.map((lead) => ({ id: lead.id, clubName: lead.clubName, managerName: lead.managerName, email: lead.email, createdAt: lead.createdAt, status: lead.status })),
    } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Vue admin indisponible" }, { status: 502 });
  }
}
