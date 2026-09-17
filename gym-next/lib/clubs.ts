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
  status: "pending";
};

const clubLeads: ClubLead[] = [];

export function createClubLead(input: Omit<ClubLead, "id" | "createdAt" | "status">) {
  assertDemoFallbackAllowed("Persistance des demandes club");
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
