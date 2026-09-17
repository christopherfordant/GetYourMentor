import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";
import { bodyExceedsLimit, textExceedsLimit } from "@/lib/request-guards";

export async function POST(request: Request) {
  if (bodyExceedsLimit(request, 16 * 1024)) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
  const body = await request.json().catch(() => null);
  if (textExceedsLimit(body?.email, 320) || textExceedsLimit(body?.password, 256)) {
    return NextResponse.json({ error: "Identifiants trop longs" }, { status: 400 });
  }
  const role = ["sportif", "coach", "club", "admin"].includes(body?.role) ? body.role : "sportif";

  try {
    const session = await signIn(body?.email, body?.password, role);
    return NextResponse.json({ data: session });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Connexion impossible" }, { status: 401 });
  }
}
