"use client";

import { useState } from "react";

type CoachProfileEditorProps = {
  coachId: string;
  specialty: string;
  city: string;
  priceFrom: number;
  description: string;
  disciplines?: string;
  diplomas?: string;
  sessionTypes?: string;
  availability?: string;
  photoUrl?: string;
  bankAccountLast4?: string;
};

export function CoachProfileEditor({ coachId, specialty, city, priceFrom, description, disciplines = "", diplomas = "", sessionTypes = "", availability = "", photoUrl = "", bankAccountLast4 = "" }: CoachProfileEditorProps) {
  const [values, setValues] = useState({ specialty, city, priceFrom: String(priceFrom), description, disciplines, diplomas, sessionTypes, availability, photoUrl, bankAccountLast4 });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <section className="account-dashboard-card" data-coach-profile-editor>
      <div className="coach-home-card-head">
        <h3>Modifier mon profil</h3>
        <span>Informations visibles par les sportifs</span>
      </div>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          setStatus("");
          const response = await fetch(`/api/coaches/${coachId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...values, priceFrom: Number(values.priceFrom) }),
          });
          const payload = await response.json();
          setSaving(false);
          setStatus(response.ok ? "Profil mis à jour." : payload.error ?? "Mise à jour impossible");
        }}
      >
        <label className="auth-field"><span>Spécialité</span><input value={values.specialty} onChange={(event) => setValues({ ...values, specialty: event.target.value })} /></label>
        <label className="auth-field"><span>Ville / zone</span><input value={values.city} onChange={(event) => setValues({ ...values, city: event.target.value })} /></label>
        <label className="auth-field"><span>Tarif à partir de</span><input type="number" min="0" value={values.priceFrom} onChange={(event) => setValues({ ...values, priceFrom: event.target.value })} /></label>
        <label className="auth-field"><span>Présentation</span><textarea value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} /></label>
        <label className="auth-field"><span>Disciplines</span><input value={values.disciplines} onChange={(event) => setValues({ ...values, disciplines: event.target.value })} placeholder="Ex. basketball, préparation physique" /></label>
        <label className="auth-field"><span>Diplômes / certifications</span><input value={values.diplomas} onChange={(event) => setValues({ ...values, diplomas: event.target.value })} /></label>
        <label className="auth-field"><span>Types de séances</span><input value={values.sessionTypes} onChange={(event) => setValues({ ...values, sessionTypes: event.target.value })} placeholder="Individuel, duo, visio" /></label>
        <label className="auth-field"><span>Disponibilités basiques</span><input value={values.availability} onChange={(event) => setValues({ ...values, availability: event.target.value })} placeholder="Ex. mardi et jeudi, 18h–21h" /></label>
        <label className="auth-field"><span>Photo de profil (URL)</span><input type="url" value={values.photoUrl} onChange={(event) => setValues({ ...values, photoUrl: event.target.value })} /></label>
        <label className="auth-field"><span>IBAN (prototype, seuls les 4 derniers chiffres sont conservés)</span><input inputMode="numeric" value={values.bankAccountLast4} onChange={(event) => setValues({ ...values, bankAccountLast4: event.target.value })} placeholder="•••• 1234" /></label>
        <button className="auth-primary" type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer le profil"}</button>
        <p role="status" data-coach-profile-status hidden={!status}>{status}</p>
      </form>
    </section>
  );
}
