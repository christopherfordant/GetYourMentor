import { getDemoSessionConfig } from "@/lib/demo-recruiter-session";
import { listDemoFixtures } from "@/lib/demo-recruiter-booking";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  const config = getDemoSessionConfig();
  if (!config) return Response.json({ error: "La démonstration n’est pas configurée sur cette cible" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const coaches = await listDemoFixtures(config);
    return Response.json({ coaches }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Le catalogue de démonstration est indisponible" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
