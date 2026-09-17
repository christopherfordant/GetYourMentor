import { randomUUID } from "node:crypto";
import { assertDemoFallbackAllowed } from "@/lib/runtime";

export type ClubLead = {
  id: string;
  clubName: string;
  managerName: string;
  email: string;
  phone?: string;
  ibanLast4?: string;
  logoFileName?: string;
  identityFileName?: string;
  createdAt: string;
  status: "pending" | "contacted" | "closed";
};

const clubLeads: ClubLead[] = [];

function supabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return { url: url.replace(/\/$/, ""), key };
  assertDemoFallbackAllowed("Persistance des demandes club");
  return null;
}

function fromRow(row: Record<string, unknown>): ClubLead {
  const status = row.status === "contacted" || row.status === "closed" ? row.status : "pending";
  return {
    id: String(row.id),
    clubName: String(row.club_name ?? ""),
    managerName: String(row.manager_name ?? ""),
    email: String(row.email ?? ""),
    phone: typeof row.phone === "string" ? row.phone : undefined,
    ibanLast4: typeof row.iban_last4 === "string" ? row.iban_last4 : undefined,
    logoFileName: typeof row.logo_file_name === "string" ? row.logo_file_name : undefined,
    identityFileName: typeof row.identity_file_name === "string" ? row.identity_file_name : undefined,
    createdAt: String(row.created_at ?? ""),
    status,
  };
}

export async function createClubLead(input: Omit<ClubLead, "id" | "createdAt" | "status">) {
  const config = supabaseConfig();
  const lead: ClubLead = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  if (config) {
    const response = await fetch(`${config.url}/rest/v1/gym_club_leads`, {
      method: "POST",
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        id: lead.id,
        club_name: lead.clubName,
        manager_name: lead.managerName,
        email: lead.email,
        phone: lead.phone ?? null,
        iban_last4: lead.ibanLast4 ?? null,
        logo_file_name: lead.logoFileName ?? null,
        identity_file_name: lead.identityFileName ?? null,
        created_at: lead.createdAt,
        status: lead.status,
      }),
    });
    if (!response.ok) throw new Error(`Supabase club lead error (${response.status})`);
    const [row] = (await response.json()) as Record<string, unknown>[];
    return row ? fromRow(row) : lead;
  }
  clubLeads.push(lead);
  return lead;
}

export async function listClubLeads() {
  const config = supabaseConfig();
  if (config) {
    const response = await fetch(`${config.url}/rest/v1/gym_club_leads?select=*&order=created_at.desc`, {
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Supabase club lead error (${response.status})`);
    return ((await response.json()) as Record<string, unknown>[]).map(fromRow);
  }
  return [...clubLeads];
}
