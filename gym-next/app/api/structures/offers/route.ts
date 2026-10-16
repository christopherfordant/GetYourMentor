import { normalizeSlots, durationMinutes } from "@/lib/domain/booking-time";
import { getCoach } from "@/lib/coaches";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { isDemoFallbackAllowed } from "@/lib/runtime";
import { bodyExceedsLimit, rateLimit } from "@/lib/request-guards";
import { createStructureOffer, listStructureOffers, publicStructureOffer } from "@/lib/structure-offers";

export async function GET(request: Request) {
  if (!isDemoFallbackAllowed()) return NextResponse.json({ error: "Parcours structure disponible en démonstration uniquement" }, { status: 503 });
  const own = new URL(request.url).searchParams.get("mine") === "1";
  const session = own ? await requireRole("club") : null;
  if (own && !session) return NextResponse.json({ error: "Connexion structure requise" }, { status: 401 });
  try { return NextResponse.json({ data: await Promise.all((await listStructureOffers(session?.email)).map(async offer => { const coach = await getCoach(offer.coachId); return { ...publicStructureOffer(offer), individualPrice: coach?.priceFrom, groupPrices: coach?.groupPrices ?? [] }; })) }); }
  catch { return NextResponse.json({ error: "Séances indisponibles" }, { status: 503 }); }
}

export async function POST(request: Request) {
  const session = await requireRole("club");
  if (!session) return NextResponse.json({ error: "Connexion structure requise" }, { status: 401 });
  if (!isDemoFallbackAllowed()) return NextResponse.json({ error: "Publication de séances en démonstration uniquement" }, { status: 503 });
  if (!rateLimit(request, "structure-offer", 20, 60_000).allowed) return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
  if (bodyExceedsLimit(request, 4096)) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
  const body = await request.json().catch(() => null);
  if (typeof body?.title !== "string" || !body.title.trim() || body.title.length > 120 || typeof body?.duration !== "string" || !body.duration.trim() || body.duration.length > 80
    || !Array.isArray(body?.slots) || body.slots.length < 1 || body.slots.length > 3 || body.slots.some((s: unknown) => typeof s !== "string" || s.length > 80 || !Number.isFinite(Date.parse(s)) || Date.parse(s) <= Date.now())) return NextResponse.json({ error: "Indiquez un titre, une durée et un à trois créneaux futurs valides" }, { status: 400 });
  const slots = normalizeSlots(body.slots);
  const capacity = body.capacity ?? 1;
  if (!slots || !durationMinutes(body.duration) || !Number.isInteger(capacity) || capacity < 1 || capacity > 50) return NextResponse.json({ error: "Dates, durée ou capacité invalides (1 à 50 places en démo)" }, { status: 400 });
  try { return NextResponse.json({ data: publicStructureOffer(await createStructureOffer(session.email, body.title.trim(), body.duration.trim(), slots, capacity)) }, { status: 201 }); }
  catch { return NextResponse.json({ error: "Publication impossible : vérifiez l'affiliation de votre coach" }, { status: 409 }); }
}
