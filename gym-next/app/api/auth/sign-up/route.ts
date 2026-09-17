import { NextResponse } from "next/server";
import { signUp, type UserRole } from "@/lib/auth";
import { bodyExceedsLimit, textExceedsLimit } from "@/lib/request-guards";

export async function POST(request: Request) {
  if (bodyExceedsLimit(request, 16 * 1024)) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
  const body = await request.json().catch(() => null);
  if ([body?.email, body?.password, body?.firstName, body?.lastName, body?.phone].some((value) => textExceedsLimit(value, 512))) {
    return NextResponse.json({ error: "Données d’inscription trop longues" }, { status: 400 });
  }
  const role = ["sportif", "coach", "club"].includes(body?.role) ? body.role as UserRole : "sportif";
  try {
    const session = await signUp(body?.email, body?.password, role, {
      firstName: body?.firstName,
      lastName: body?.lastName,
      phone: body?.phone,
      termsAccepted: body?.termsAccepted === true,
    });
    return NextResponse.json({ data: session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Inscription impossible" }, { status: 400 });
  }
}
