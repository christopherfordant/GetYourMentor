import { spawn } from "node:child_process";
import { resolve } from "node:path";

const port = "3012";
const baseUrl = `http://127.0.0.1:${port}`;
const nextBin = resolve(process.cwd(), "node_modules/next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "start", "--port", port], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: port,
    GETYOURMENTOR_ALLOW_DEMO: "",
    SUPABASE_URL: "",
    NEXT_PUBLIC_SUPABASE_URL: "",
    SUPABASE_ANON_KEY: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
    SESSION_SECRET: "",
    PAYMENT_PROVIDER: "",
    STRIPE_SECRET_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
    RESEND_API_KEY: "",
    RESEND_FROM_EMAIL: "",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
child.stdout.on("data", (chunk) => { output += chunk.toString(); });
child.stderr.on("data", (chunk) => { output += chunk.toString(); });

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.status > 0) return;
    } catch {
      // Le serveur n’est pas encore prêt.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error(`Serveur de smoke test non disponible.\n${output}`);
}

async function assertResponse(path, predicate, description) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.text();
  if (!predicate(response, body)) {
    throw new Error(`${description} (HTTP ${response.status})`);
  }
}

try {
  await waitForServer();
  await assertResponse(
    "/api/health",
    (response, body) => response.status === 503 && /degraded/i.test(body),
    "La santé production doit être dégradée sans services réels",
  );
  for (const route of ["/creneau", "/recapitulatif", "/paiement", "/coach?coach=Steven%20Fordant"]) {
    await assertResponse(route, (response, body) => response.status === 200 && /indisponible/i.test(body), `La route ${route} doit refuser les données de démonstration`);
  }
  await assertResponse(
    "/coachs",
    (response, body) => response.status === 200 && !body.includes("Steven Fordant"),
    "Le catalogue production ne doit pas exposer un coach de démonstration",
  );
  console.log("Production safety smoke: PASS");
} finally {
  child.kill();
}
