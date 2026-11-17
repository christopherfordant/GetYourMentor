import { NextResponse } from "next/server";
import { getRuntimeReadiness, isHostedDemo } from "@/lib/runtime";
import { readDemoState } from "@/lib/repositories/demo-state";
import { getDemoSessionAvailability } from "@/lib/demo-recruiter-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = getRuntimeReadiness();
  const recruiterDemoAvailability = getDemoSessionAvailability();
  if (isHostedDemo()) {
    try { await readDemoState(); }
    catch { return NextResponse.json({ status: "degraded", mode: "demo", ready: false, error: "Stockage de démonstration indisponible" }, { status: 503 }); }
  }
  const status = readiness.mode === "demo" ? "demo" : readiness.ready ? "ok" : "degraded";
  return NextResponse.json(
    {
      status, mode: readiness.mode, ready: readiness.ready, checks: readiness.checks,
      recruiterDemo: { available: recruiterDemoAvailability === "ready", storage: "supabase", status: recruiterDemoAvailability },
    },
    { status: readiness.ready ? 200 : 503 },
  );
}
