import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs", "architecture", "rag-corpus.json"), "utf8"));
const evaluation = JSON.parse(fs.readFileSync(path.join(root, "docs", "architecture", "rag-evaluation.json"), "utf8"));

function terms(value) {
  return new Set(value.toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]{3,}/g) ?? []);
}

const documents = manifest.documents.map((document) => ({
  ...document,
  text: fs.readFileSync(path.resolve(root, document.path), "utf8"),
}));

let failures = 0;
for (const testCase of evaluation.cases) {
  const queryTerms = terms(testCase.question);
  const ranked = documents.map((document) => {
    const documentTerms = terms(document.text);
    const score = [...queryTerms].reduce((total, term) => total + (documentTerms.has(term) ? 1 : 0), 0);
    return { document, score };
  }).sort((left, right) => right.score - left.score || left.document.priority - right.document.priority);
  const cited = ranked.filter((item) => item.score > 0).slice(0, 3).map((item) => item.document.id);
  const missing = testCase.expectedDocuments.filter((id) => !cited.includes(id));
  if (missing.length) {
    failures += 1;
    console.error(`FAIL ${testCase.id}: sources attendues absentes (${missing.join(", ")})`);
  } else {
    console.log(`PASS ${testCase.id}: ${cited.join(", ")}`);
  }
}

if (failures) {
  console.error(`Évaluation RAG lexicale échouée : ${failures} cas.`);
  process.exit(1);
}
console.log(`Évaluation RAG lexicale réussie : ${evaluation.cases.length} cas avec sources candidates.`);
