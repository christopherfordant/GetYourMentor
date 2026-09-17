"use client";

import { type FormEvent, useState } from "react";

export function ContactCoachForm({ coach }: { coach: string }) {
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim() || sending) return;
    setError("");
    setSending(true);
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientName: coach, body }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Message impossible");
      setSending(false);
      return;
    }
    setSent(true);
    setSending(false);
  }

  return (
    <article className="booking-contact-card" data-contact-form>
      <div className="booking-contact-heading">
        <span className="booking-contact-eyebrow"><span className="booking-contact-status-dot" />Échange direct</span>
        <span className="booking-contact-secure">Privé et sécurisé</span>
      </div>
      <div className="booking-contact-title-row">
        <div className="booking-contact-avatar" aria-hidden="true">{coach.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
        <div>
          <h3>Une question pour {coach} ?</h3>
          <p>Écrivez avant de réserver pour valider votre objectif ou un créneau.</p>
        </div>
      </div>
      {sent ? <div className="booking-contact-success"><span aria-hidden="true">✓</span><div><strong>Message envoyé</strong><p data-contact-success>Votre message a bien été envoyé.</p><small>Votre demande a bien été transmise à {coach}.</small></div></div> : (
        <form onSubmit={submit}>
          <div className="booking-contact-prompts" aria-label="Suggestions de message">
            {[
              "Quel créneau vous conviendrait ?",
              "La séance est-elle adaptée à mon niveau ?",
              "Quel objectif pouvons-nous travailler ?",
            ].map((prompt) => <button key={prompt} type="button" onClick={() => setBody(prompt)}>{prompt}</button>)}
          </div>
          <label className="booking-contact-field">
            <span>Votre message</span>
            <textarea value={body} maxLength={500} onChange={(event) => setBody(event.target.value)} placeholder="Posez votre question en quelques mots…" />
          </label>
          <div className="booking-contact-form-meta"><span>Réponse généralement sous 24 h</span><span>{body.length}/500</span></div>
          <button className="booking-contact-submit" type="submit" disabled={!body.trim() || sending}>{sending ? "Envoi en cours…" : "Envoyer le message"}<span aria-hidden="true">↗</span></button>
          {error ? <p className="booking-contact-error" role="alert">{error}</p> : null}
        </form>
      )}
    </article>
  );
}
