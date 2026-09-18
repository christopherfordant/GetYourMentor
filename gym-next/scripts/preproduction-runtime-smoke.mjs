const baseUrl = process.env.BASE_URL?.replace(/\/$/, "");

if (!baseUrl) {
  console.error("BASE_URL est requis pour tester une préproduction déployée.");
  process.exit(1);
}

let origin;
try {
  origin = new URL(baseUrl);
} catch {
  console.error("BASE_URL doit être une URL valide.");
  process.exit(1);
}

if (origin.protocol !== "https:" || /localhost|127\.0\.0\.1/i.test(origin.hostname)) {
  console.error("BASE_URL doit être une URL HTTPS distante, sans localhost.");
  process.exit(1);
}

async function getJson(pathname) {
  const response = await fetch(`${origin}${pathname}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

try {
  const { response, body } = await getJson("/api/health");
  if (response.status !== 200) throw new Error(`/api/health répond ${response.status}`);
  if (!body || body.status !== "ok" || body.mode !== "production" || body.ready !== true) {
    throw new Error("/api/health ne confirme pas un runtime production prêt");
  }
  if (!body.checks || Object.values(body.checks).some((value) => value !== true)) {
    throw new Error("Toutes les vérifications de services ne sont pas positives");
  }

  const coaches = await getJson("/api/coaches");
  if (coaches.response.status !== 200) throw new Error(`/api/coaches répond ${coaches.response.status}`);
  const serialized = JSON.stringify(coaches.body ?? "");
  if (/steven fordant|coach@example\.com|sportif@example\.com/i.test(serialized)) {
    throw new Error("Des données de démonstration sont exposées par le catalogue déployé");
  }

  console.log(`Smoke préproduction réussi : ${origin.origin} est en mode production prêt.`);
} catch (error) {
  console.error(`Smoke préproduction échoué : ${error instanceof Error ? error.message : "erreur inconnue"}`);
  process.exit(1);
}
