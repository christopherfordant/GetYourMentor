/**
 * Déclencheur horaire Netlify pour les rappels H-72.
 * Le traitement métier reste dans l'endpoint Next protégé par CRON_SECRET.
 */
export default async function handler() {
  const baseUrl = (process.env.URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const secret = process.env.CRON_SECRET;
  if (!baseUrl || !secret) throw new Error("URL et CRON_SECRET sont requis pour le planificateur de rappels");
  const response = await fetch(`${baseUrl}/api/cron/reservation-reminders`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!response.ok) throw new Error(`Rappel H-72 refusé (${response.status})`);
  return response.json();
}

export const config = { schedule: "0 * * * *" };
