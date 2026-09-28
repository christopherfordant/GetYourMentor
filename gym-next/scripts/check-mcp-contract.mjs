import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const file = path.join(root, "docs", "mcp", "MCP_TOOL_CONTRACT_GYM.md");
const content = fs.readFileSync(file, "utf8");
const required = ["project.read_source", "project.search_memory", "project.read_decision", "project.get_status", "aucun accès arbitraire au disque", "aucune lecture de `.env`", "aucune commande système", "lecture seule"];
const missing = required.filter((marker) => !content.includes(marker));
if (missing.length) {
  console.error(`Contrat MCP incomplet : ${missing.join(", ")}`);
  process.exit(1);
}
console.log("Contrat MCP valide : outils allowlistés, lecture seule et interdictions sensibles présentes.");
