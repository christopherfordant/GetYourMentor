import fs from "node:fs";
import path from "node:path";

const routePath = path.join(process.cwd(), "app", "api", "knowledge", "context", "route.ts");
const source = fs.readFileSync(routePath, "utf8");
const required = ["RAG_CONTEXT_ASSEMBLER_ENABLED", "requireRole(\"admin\")", "isKnowledgeRole", "search_document_chunks", "assembleContext", 'method: "POST"', 'cache: "no-store"'];
const forbidden = ["child_process", "exec(", "spawn(", "STRIPE_SECRET_KEY", "RESEND_API_KEY", "/api/reservations", "/api/webhooks/stripe"];
const missing = required.filter((marker) => !source.includes(marker));
const unsafe = forbidden.filter((marker) => source.includes(marker));
if (missing.length || unsafe.length) {
  console.error("Contrat de l'assembleur RAG invalide.");
  for (const marker of missing) console.error(`- Element requis absent : ${marker}`);
  for (const marker of unsafe) console.error(`- Element interdit present : ${marker}`);
  process.exit(1);
}
console.log("Assembleur RAG valide : role allowliste, lecture seule, citations et garde-fous presents.");
