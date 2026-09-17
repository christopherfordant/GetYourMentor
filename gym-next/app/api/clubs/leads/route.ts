import { NextResponse } from "next/server";
import { createClubLead } from "@/lib/clubs";
import { bodyExceedsLimit } from "@/lib/request-guards";

export async function POST(request: Request) {
  if (bodyExceedsLimit(request, 6 * 1024 * 1024)) return NextResponse.json({ error: "Fichiers trop volumineux" }, { status: 413 });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });

  const clubName = String(form.get("clubName") ?? "").trim();
  const managerName = String(form.get("managerName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const ibanInput = String(form.get("iban") ?? "").replace(/\s+/g, "").toUpperCase();
  const ibanLast4 = ibanInput.length >= 4 ? ibanInput.slice(-4) : undefined;
  const logo = form.get("logo");
  const identity = form.get("identity");
  if ([logo, identity].some((file) => file instanceof File && file.size > 5 * 1024 * 1024)) {
    return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 413 });
  }

  if (!clubName || !managerName || !email) {
    return NextResponse.json({ error: "Le club, le responsable et l’adresse mail sont requis" }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Adresse mail invalide" }, { status: 400 });
  }

  const lead = await createClubLead({
    clubName,
    managerName,
    email,
    phone: phone || undefined,
    ibanLast4,
    logoFileName: logo instanceof File && logo.size > 0 ? logo.name : undefined,
    identityFileName: identity instanceof File && identity.size > 0 ? identity.name : undefined,
  });

  return NextResponse.json({ data: lead }, { status: 201 });
}
