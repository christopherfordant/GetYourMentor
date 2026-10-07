import { NextRequest, NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { supabaseHeaders } from "@/lib/supabase";
import { assembleContext, buildKnowledgeQuery, isKnowledgeRole } from "@/lib/knowledge/context-assembler";

export const dynamic = "force-dynamic";

const MAX_SUBJECT_LENGTH = 180;
const MAX_RESULTS = 8;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (process.env.RAG_CONTEXT_ASSEMBLER_ENABLED !== "true") {
    return errorResponse("L'assembleur de contexte n'est pas active dans cet environnement", 404);
  }

  const session = await requireRole("admin");
  if (!session) return errorResponse("Acces administrateur requis", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Corps JSON invalide", 400);
  }

  const input = body as { role?: unknown; subject?: unknown };
  const role = typeof input.role === "string" ? input.role.trim().toLowerCase() : "";
  const subject = typeof input.subject === "string" ? input.subject.trim() : "";
  if (!isKnowledgeRole(role)) return errorResponse("Role de connaissance non autorise", 400);
  if (subject.length < 2 || subject.length > MAX_SUBJECT_LENGTH) {
    return errorResponse(`Le sujet doit contenir entre 2 et ${MAX_SUBJECT_LENGTH} caracteres`, 400);
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return errorResponse("La recherche documentaire n'est pas configuree", 503);

  try {
    const response = await fetch(`${url}/rest/v1/rpc/search_document_chunks`, {
      method: "POST",
      headers: supabaseHeaders(serviceKey, { "Content-Type": "application/json" }),
      body: JSON.stringify({ query_text: buildKnowledgeQuery(role, subject), result_limit: MAX_RESULTS }),
      cache: "no-store",
    });
    if (!response.ok) return errorResponse("La recherche documentaire est momentanement indisponible", 502);

    const rows = (await response.json()) as Array<{
      chunk_id: string;
      document_id: string;
      title: string;
      section: string | null;
      chunk_text: string;
      document_priority: number;
      rank: number;
    }>;
    const sources = rows.map((row) => ({
      citation: { documentId: row.document_id, title: row.title, section: row.section, priority: row.document_priority },
      excerpt: row.chunk_text,
      score: row.rank,
      chunkId: row.chunk_id,
    }));
    return NextResponse.json({ context: assembleContext(role, subject, sources) });
  } catch (error) {
    console.error("[rag] context assembly failed", error);
    return errorResponse("La recherche documentaire est momentanement indisponible", 502);
  }
}
