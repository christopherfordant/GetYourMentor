import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { KnowledgeSearch } from "@/components/admin/KnowledgeSearch";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const session = await requireRole("admin");
  if (!session || process.env.RAG_PUBLIC_SEARCH_ENABLED !== "true") notFound();

  return <KnowledgeSearch />;
}
