import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd(), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs", "architecture", "rag-corpus.json"), "utf8"));
const projectRef = process.env.SUPABASE_PROJECT_REF ?? "pqxqqbwesfrefzjoawmx";
const shouldApply = process.env.RAG_SEED_APPLY === "true";
const chunkSize = 1400;

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function chunkDocument(text) {
  const paragraphs = text.replaceAll("\r\n", "\n").split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > chunkSize) {
      chunks.push(current);
      current = "";
    }
    current = current ? `${current}\n\n${paragraph}` : paragraph;
  }
  if (current) chunks.push(current);
  return chunks;
}

const documents = manifest.documents.map((entry) => {
  const absolutePath = path.resolve(root, entry.path);
  const text = fs.readFileSync(absolutePath, "utf8");
  return {
    ...entry,
    text,
    chunks: chunkDocument(text),
    documentType: entry.id === "master" ? "master_doc" : "other",
  };
});

const sql = [
  "begin;",
  "delete from gym_memory.documents where source_system = 'local' and file_path in (",
  documents.map((document) => sqlString(document.path)).join(","),
  ");",
];

for (const document of documents) {
  sql.push(`with inserted_document as (\n  insert into gym_memory.documents (title, document_type, file_path, file_hash, version, summary, status_reference, source_system, tags)\n  values (${sqlString(document.id)}, ${sqlString(document.documentType)}, ${sqlString(document.path)}, ${sqlString(`manifest-v${manifest.version}`)}, ${sqlString(String(manifest.version))}, ${sqlString(`Corpus gouverné GetYourMentor : ${document.path}`)}, 'reference', 'local', array['rag-corpus', 'governed'])\n  returning id\n)\ninsert into gym_memory.document_chunks (document_id, chunk_index, section, chunk_text, tags)\nselect inserted_document.id, chunks.chunk_index, ${sqlString(document.id)}, chunks.chunk_text, array['rag-corpus', 'governed']\nfrom inserted_document\ncross join (values\n${document.chunks.map((chunk, index) => `  (${index}, ${sqlString(chunk)})`).join(",\n")}\n) as chunks(chunk_index, chunk_text);`);
}
sql.push(`update gym_memory.documents set priority = case file_path
${documents.map((document) => `  when ${sqlString(document.path)} then ${document.priority}`).join("\n")}
  else 3
end where source_system = 'local' and file_path in (${documents.map((document) => sqlString(document.path)).join(",")});`);
sql.push("commit;");

const totalChunks = documents.reduce((total, document) => total + document.chunks.length, 0);
console.log(`Corpus préparé : ${documents.length} documents, ${totalChunks} chunks, projet ${projectRef}.`);
if (!shouldApply) {
  console.log("Mode aperçu : aucune écriture distante. Relancer avec RAG_SEED_APPLY=true pour appliquer.");
  process.exit(0);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "getyourmentor-rag-"));
const sqlFile = path.join(tempDir, "seed.sql");
fs.writeFileSync(sqlFile, sql.join("\n\n"), "utf8");
try {
  const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "npx";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", `npx supabase@latest db query --linked --project-ref ${projectRef} --file ${sqlFile}`]
    : ["supabase@latest", "db", "query", "--linked", "--project-ref", projectRef, "--file", sqlFile];
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
    shell: false,
  });
  if (result.error) console.error(`Impossible de lancer Supabase CLI : ${result.error.message}`);
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log("Corpus RAG appliqué avec succès.");
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
