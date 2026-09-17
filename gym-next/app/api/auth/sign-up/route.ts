import { NextResponse } from "next/server";
import { signUp, type UserRole } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
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
