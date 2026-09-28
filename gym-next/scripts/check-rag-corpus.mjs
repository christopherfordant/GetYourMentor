import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const manifestPath = path.join(root, "docs", "architecture", "rag-corpus.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const errors = [];
const allowedExtensions = new Set([".md"]);

if (manifest.version !== 1) errors.push("La version du manifeste RAG doit être 1.");
if (!Array.isArray(manifest.documents) || manifest.documents.length < 3) errors.push("Le corpus RAG doit contenir au moins trois documents prioritaires.");

for (const document of manifest.documents ?? []) {
  if (!document.id || !document.path || !document.priority) {
    errors.push("Chaque document du corpus doit avoir id, path et priority.");
    continue;
  }
  const relative = document.path.replaceAll("\\", "/");
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(`${root}${path.sep}`)) errors.push(`${document.id}: chemin hors dépôt.`);
  if (!allowedExtensions.has(path.extname(resolved))) errors.push(`${document.id}: extension non autorisée.`);
  if (!fs.existsSync(resolved)) errors.push(`${document.id}: fichier introuvable (${relative}).`);
  if (/(\.env|secret|token|password|mempalace|playwright-artifacts)/i.test(relative)) errors.push(`${document.id}: chemin sensible interdit dans le corpus.`);
}

if (errors.length) {
  console.error("Manifeste du corpus RAG invalide :");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Corpus RAG valide : ${manifest.documents.length} documents gouvernés, aucun secret détecté.`);
