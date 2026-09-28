import { NextRequest, NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { supabaseHeaders } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MAX_QUERY_LENGTH = 240;
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 12;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  if (process.env.RAG_PUBLIC_SEARCH_ENABLED !== "true") {
    return jsonError("La recherche documentaire n'est pas activée dans cet environnement", 404);
  }

  const session = await requireRole("admin");
  if (!session) return jsonError("Accès administrateur requis", 403);

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > MAX_QUERY_LENGTH) {
    return jsonError(`La requête doit contenir entre 2 et ${MAX_QUERY_LENGTH} caractères`, 400);
  }

  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? DEFAULT_LIMIT);
  const resultLimit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return jsonError("La recherche documentaire n'est pas configurée", 503);
  }

  try {
    const response = await fetch(`${url}/rest/v1/rpc/search_document_chunks`, {
      method: "POST",
      headers: supabaseHeaders(serviceKey, { "Content-Type": "application/json" }),
      body: JSON.stringify({ query_text: query, result_limit: resultLimit }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[rag] search failed", response.status, await response.text());
      return jsonError("La recherche documentaire est momentanément indisponible", 502);
    }

    const rows = (await response.json()) as Array<{
      chunk_id: string;
      document_id: string;
      title: string;
      section: string;
      chunk_text: string;
      document_priority: number;
      rank: number;
    }>;

    return NextResponse.json({
      query,
      results: rows.map((row) => ({
        citation: {
          documentId: row.document_id,
          title: row.title,
          section: row.section,
          priority: row.document_priority,
        },
        excerpt: row.chunk_text,
        score: row.rank,
        chunkId: row.chunk_id,
      })),
    });
  } catch (error) {
    console.error("[rag] unexpected search error", error);
    return jsonError("La recherche documentaire est momentanément indisponible", 502);
  }
}
