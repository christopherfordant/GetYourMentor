import { randomUUID } from "node:crypto";

export type ClubLead = {
  id: string;
  clubName: string;
  managerName: string;
  email: string;
  phone?: string;
  iban?: string;
  logoFileName?: string;
  identityFileName?: string;
  createdAt: string;
  status: "pending";
};

const clubLeads: ClubLead[] = [];

export function createClubLead(input: Omit<ClubLead, "id" | "createdAt" | "status">) {
  const lead: ClubLead = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  clubLeads.push(lead);
  return lead;
}

export function listClubLeads() {
  return [...clubLeads];
}
