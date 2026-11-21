import { NextResponse } from "next/server";
import { getRuntimeReadiness, isHostedDemo } from "@/lib/runtime";
import { readDemoState } from "@/lib/repositories/demo-state";
import { checkDemoSupabaseConnection, getDemoSessionAvailability, getDemoSessionConfig } from "@/lib/demo-recruiter-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = getRuntimeReadiness();
  let recruiterDemoAvailability: ReturnType<typeof getDemoSessionAvailability> | "storage-unavailable" = getDemoSessionAvailability();
  let checks: Record<string, boolean> = { ...readiness.checks };
  if (isHostedDemo()) {
    const demoConfig = getDemoSessionConfig();
    const demoSupabaseReady = await checkDemoSupabaseConnection(demoConfig);
    checks = { ...checks, supabase: demoSupabaseReady };
    if (recruiterDemoAvailability === "ready" && !demoSupabaseReady) recruiterDemoAvailability = "storage-unavailable";
    try {
      await readDemoState();
      checks.demoStateStorage = true;
    } catch {
      checks.demoStateStorage = false;
      return NextResponse.json({
        status: "degraded", mode: "demo", ready: false, checks,
        recruiterDemo: { available: false, storage: "supabase", status: recruiterDemoAvailability },
        error: "Stockage de démonstration indisponible",
      }, { status: 503 });
    }
  }
  const status = readiness.mode === "demo" ? "demo" : readiness.ready ? "ok" : "degraded";
  return NextResponse.json(
    {
      status, mode: readiness.mode, ready: readiness.ready, checks,
      recruiterDemo: { available: recruiterDemoAvailability === "ready", storage: "supabase", status: recruiterDemoAvailability },
    },
    { status: readiness.ready ? 200 : 503 },
  );
}
