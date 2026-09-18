import fs from "node:fs";
import path from "node:path";

const configPath = path.resolve(process.cwd(), "..", "netlify.toml");
const errors = [];

if (!fs.existsSync(configPath)) {
  errors.push(`netlify.toml absent : ${configPath}`);
} else {
  const content = fs.readFileSync(configPath, "utf8");
  const required = [
    ['base = "gym-next"', "le répertoire de base doit être gym-next"],
    ['command = "npm run build"', "la commande de build doit être npm run build"],
    ['publish = ".next"', "le répertoire publié doit être .next"],
    ['NODE_VERSION = "22"', "la version Node.js doit être fixée à 22"],
  ];

  for (const [marker, message] of required) {
    if (!content.includes(marker)) errors.push(message);
  }

  if (/SUPABASE_SERVICE_ROLE_KEY|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|RESEND_API_KEY|SESSION_SECRET/i.test(content)) {
    errors.push("aucun secret serveur ne doit être déclaré dans netlify.toml");
  }
}

if (errors.length) {
  console.error("Configuration Netlify invalide :");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Configuration Netlify valide : base gym-next, build Next.js et publication .next.");
