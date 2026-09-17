import { NextResponse } from "next/server";
import { currentSession, requireRole } from "@/lib/auth";
import { getCoach, toPublicCoach, updateCoach } from "@/lib/coaches";
import { bodyExceedsLimit, textExceedsLimit } from "@/lib/request-guards";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const coach = await getCoach((await params).id);
  if (!coach) return NextResponse.json({ error: "Coach introuvable" }, { status: 404 });
  const session = await currentSession();
  const isAuthorizedPrivateView = Boolean(
    session && (session.role === "admin" || (session.role === "coach" && session.coachId === coach.id)),
  );
  if (!coach.verified && !isAuthorizedPrivateView) return NextResponse.json({ error: "Coach indisponible" }, { status: 404 });
  return NextResponse.json({ data: isAuthorizedPrivateView ? coach : toPublicCoach(coach) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("coach");
  if (!session) return NextResponse.json({ error: "Connexion coach requise" }, { status: 401 });
  const coachId = (await params).id;
  if (!session.coachId || session.coachId !== coachId) return NextResponse.json({ error: "Vous ne pouvez modifier que votre propre profil" }, { status: 403 });
  if (bodyExceedsLimit(request, 64 * 1024)) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
  const body = await request.json().catch(() => null);
  if ([body?.specialty, body?.city, body?.description, body?.disciplines, body?.diplomas, body?.sessionTypes, body?.availability, body?.photoUrl].some((value) => textExceedsLimit(value, 5000))) {
    return NextResponse.json({ error: "Profil trop long" }, { status: 400 });
  }
  if (body?.priceFrom !== undefined && (!Number.isFinite(Number(body.priceFrom)) || Number(body.priceFrom) < 0 || Number(body.priceFrom) > 10000)) {
    return NextResponse.json({ error: "Tarif invalide" }, { status: 400 });
  }
  const updates = {
    specialty: typeof body?.specialty === "string" ? body.specialty.trim() : undefined,
    city: typeof body?.city === "string" ? body.city.trim() : undefined,
    description: typeof body?.description === "string" ? body.description.trim() : undefined,
    disciplines: typeof body?.disciplines === "string" ? body.disciplines.trim() : undefined,
    diplomas: typeof body?.diplomas === "string" ? body.diplomas.trim() : undefined,
    sessionTypes: typeof body?.sessionTypes === "string" ? body.sessionTypes.trim() : undefined,
    availability: typeof body?.availability === "string" ? body.availability.trim() : undefined,
    photoUrl: typeof body?.photoUrl === "string" ? body.photoUrl.trim() : undefined,
    bankAccountLast4: typeof body?.bankAccountLast4 === "string" ? body.bankAccountLast4.replace(/\D/g, "").slice(-4) : undefined,
    priceFrom: Number.isFinite(Number(body?.priceFrom)) ? Number(body.priceFrom) : undefined,
  };
  const filtered = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined));
  if (!Object.keys(filtered).length) return NextResponse.json({ error: "Aucune modification valide" }, { status: 400 });
  const coach = await updateCoach(coachId, filtered);
  return coach ? NextResponse.json({ data: coach }) : NextResponse.json({ error: "Coach introuvable" }, { status: 404 });
}
