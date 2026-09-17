import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const role = ["sportif", "coach", "club", "admin"].includes(body?.role) ? body.role : "sportif";

  try {
    const session = await signIn(body?.email, body?.password, role);
    return NextResponse.json({ data: session });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Connexion impossible" }, { status: 401 });
  }
}
