import { NextResponse } from "next/server";
import { getRuntimeReadiness } from "@/lib/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = getRuntimeReadiness();
  const status = readiness.mode === "demo" ? "demo" : readiness.ready ? "ok" : "degraded";
  return NextResponse.json(
    { status, mode: readiness.mode, ready: readiness.ready, checks: readiness.checks },
    { status: readiness.ready ? 200 : 503 },
  );
}
