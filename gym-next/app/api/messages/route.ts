import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { createMessage, listMessages } from "@/lib/messages";
import { getCoach } from "@/lib/coaches";
import { bodyExceedsLimit, textExceedsLimit } from "@/lib/request-guards";

export async function GET(request: Request) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  if (session.role !== "sportif" && session.role !== "coach" && session.role !== "admin") {
    return NextResponse.json({ error: "Accès messagerie non disponible pour ce rôle" }, { status: 403 });
  }
  const requestedRecipient = new URL(request.url).searchParams.get("recipientName") ?? undefined;
  try {
    const recipientName = session.role === "coach" ? (session.coachId ? (await getCoach(session.coachId))?.name : "__coach_without_profile__") : requestedRecipient;
    const data = await listMessages(session.role === "sportif" ? { senderEmail: session.email } : session.role === "coach" ? { recipientName } : {});
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Messages indisponibles" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const session = await currentSession();
  if (!session || session.role !== "sportif") return NextResponse.json({ error: "Connexion sportif requise pour contacter un coach" }, { status: 401 });
  if (bodyExceedsLimit(request, 32 * 1024)) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });

  const body = await request.json().catch(() => null);
  if (textExceedsLimit(body?.recipientName, 160) || textExceedsLimit(body?.body, 4000) || textExceedsLimit(body?.reservationId, 128)) {
    return NextResponse.json({ error: "Message trop long" }, { status: 400 });
  }
  if (typeof body?.recipientName !== "string" || !body.recipientName.trim() || typeof body?.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "Destinataire et message requis" }, { status: 400 });
  }

  try {
    const coach = await getCoach(body.recipientName.trim());
    if (!coach || !coach.verified) return NextResponse.json({ error: "Coach indisponible" }, { status: 404 });
    const message = await createMessage({
      id: `message-${Date.now()}`,
      senderEmail: session.email,
      recipientName: coach.name,
      reservationId: typeof body.reservationId === "string" ? body.reservationId : undefined,
      body: body.body.trim(),
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Message impossible" }, { status: 502 });
  }
}
