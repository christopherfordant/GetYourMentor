const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.RENDER_EXTERNAL_URL ?? "").replace(/\/$/, "");
const secret = process.env.CRON_SECRET;

if (!baseUrl || !secret) {
  console.error("NEXT_PUBLIC_APP_URL/RENDER_EXTERNAL_URL et CRON_SECRET sont requis.");
  process.exit(1);
}

const response = await fetch(`${baseUrl}/api/cron/reservation-reminders`, {
  headers: { authorization: `Bearer ${secret}` },
});

if (!response.ok) {
  console.error(`Le job de rappels a renvoyé HTTP ${response.status}.`);
  process.exit(1);
}

console.log("Job de rappels exécuté.");
