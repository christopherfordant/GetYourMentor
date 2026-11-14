/** Hourly cleanup for expired, anonymous athlete sessions on the isolated demo site. */
export default async function handler() {
  const siteId = process.env.SITE_ID;
  const baseUrl = (process.env.URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const secret = process.env.GYM_DEMO_PURGE_SECRET;
  let hostname = "";
  try { hostname = new URL(baseUrl).hostname; } catch { /* reject below */ }
  if (siteId !== "86e0379e-4d1a-4cf0-936c-1439397354f4"
    || process.env.DEPLOY_ENV !== "demo"
    || hostname !== "getyourmentor-demo-20261014.netlify.app"
    || !secret || secret.length < 32) {
    throw new Error("Le planificateur de purge exige la cible GetYourMentor de démonstration dédiée");
  }
  const response = await fetch(`${baseUrl}/api/cron/demo-session-purge`, {
    method: "POST", headers: { Authorization: `Bearer ${secret}` }, cache: "no-store",
  });
  if (!response.ok) throw new Error(`Purge des sessions de démonstration refusée (${response.status})`);
  return response.json();
}

export const config = { schedule: "0 * * * *" };
