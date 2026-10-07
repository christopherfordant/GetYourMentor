export const KNOWLEDGE_ROLES = [
  "product",
  "design",
  "qa",
  "seo",
  "cto",
  "devops",
  "supervisor",
] as const;

export type KnowledgeRole = (typeof KNOWLEDGE_ROLES)[number];

export type ContextCitation = {
  documentId: string;
  title: string;
  section: string | null;
  priority: number;
};

export type AssembledContext = {
  role: KnowledgeRole;
  subject: string;
  instructions: string[];
  sources: Array<{ citation: ContextCitation; excerpt: string; score: number; chunkId: string }>;
};

const ROLE_INSTRUCTIONS: Record<KnowledgeRole, string[]> = {
  product: ["Proteger le perimetre MVP", "Verifier le tunnel decouverte vers reservation et paiement"],
  design: ["Respecter le design system et le responsive", "Ne pas modifier les regles metier"],
  qa: ["Verifier les user stories et les regressions", "Retourner des preuves reproductibles"],
  seo: ["Preserver l'indexabilite et les metadata", "Ne pas casser le tunnel de reservation"],
  cto: ["Respecter les frontieres d'architecture", "Signaler les risques et dependances"],
  devops: ["Proportionner l'infrastructure au MVP", "Ne jamais exposer de secret"],
  supervisor: ["Detecter les contradictions et les blocages", "Proposer une prochaine etape bornée"],
};

export function isKnowledgeRole(value: string): value is KnowledgeRole {
  return (KNOWLEDGE_ROLES as readonly string[]).includes(value);
}

export function buildKnowledgeQuery(role: KnowledgeRole, subject: string) {
  return `${role} ${subject}`.trim().slice(0, 240);
}

export function assembleContext(role: KnowledgeRole, subject: string, sources: AssembledContext["sources"]): AssembledContext {
  return { role, subject, instructions: ROLE_INSTRUCTIONS[role], sources };
}
