import fs from "node:fs";
import path from "node:path";

const workflowsDir = path.resolve(process.cwd(), "..", "n8n", "workflows");
const expected = [
  "01-trello-to-supabase.json",
  "02-weekly-brief.json",
  "03-decision-journal.json",
  "04-document-ingestion.json",
  "05-commercial-memory.json",
  "06-master-alignment-draft.json",
];
const secretPattern = /(?:sk_(?:live|test)_|re_[A-Za-z0-9]|sb_secret_[A-Za-z0-9]|whsec_[A-Za-z0-9]|xox[baprs]-[A-Za-z0-9])/;

if (!fs.existsSync(workflowsDir)) throw new Error(`Dossier n8n absent : ${workflowsDir}`);

for (const fileName of expected) {
  const filePath = path.join(workflowsDir, fileName);
  if (!fs.existsSync(filePath)) throw new Error(`Workflow n8n manquant : ${fileName}`);
  const raw = fs.readFileSync(filePath, "utf8");
  if (secretPattern.test(raw)) throw new Error(`Secret potentiel détecté dans ${fileName}`);
  let workflow;
  try {
    workflow = JSON.parse(raw);
  } catch (error) {
    throw new Error(`JSON n8n invalide (${fileName}) : ${error.message}`);
  }
  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) throw new Error(`Aucun nœud dans ${fileName}`);
  if (workflow.active !== false) throw new Error(`${fileName} doit rester inactif avant configuration des credentials`);
}

console.log(`Workflows n8n valides : ${expected.length} exports, inactifs et sans secret réel.`);
