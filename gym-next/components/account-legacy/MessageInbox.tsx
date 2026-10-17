"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/messages";

export function MessageInbox({ recipientName, contacts, contactKind = "coach" }: { recipientName?: string; contacts?: Array<{ value: string; label: string }>; contactKind?: "coach" | "structure" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [canReply, setCanReply] = useState(false);
  const [selected, setSelected] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [query, setQuery] = useState("");
  const sending = useRef(false);
  const requestId = useRef("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    const query = recipientName ? `?recipientName=${encodeURIComponent(recipientName)}` : "";
    fetch(`/api/messages${query}`, { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Messages indisponibles"))))
      .then(payload => { if (!Array.isArray(payload.data)) throw new Error("Messages indisponibles"); setMessages(payload.data); setCanReply(payload.canReply === true); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [recipientName, attempt]);

  async function reply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || !selected || !body.trim()) return;
    sending.current = true; setBusy(true); setFeedback("");
    try {
      const target = selected.startsWith("contact:") ? contactKind === "structure" ? { structureEmail: selected.slice(8) } : { recipientName: selected.slice(8) } : { replyToId: selected };
      const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...target, requestId: requestId.current, body }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Réponse impossible.");
      setMessages(previous => previous.some(message => message.id === payload.data.id) ? previous : [...previous, payload.data]);
      setBody(""); setSelected(""); setFeedback(selected.startsWith("contact:") ? "Votre message a bien été envoyé." : "Votre réponse a bien été envoyée.");
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Réponse impossible."); }
    finally { sending.current = false; setBusy(false); }
  }
  const normalized = query.trim().toLocaleLowerCase("fr");
  const visible = messages.filter(message => `${message.body} ${message.recipientName} ${message.senderEmail}`.toLocaleLowerCase("fr").includes(normalized));

  return (
    <section className="account-dashboard-card" id="coach-messages-live" data-message-inbox aria-busy={loading}>
      <div className="coach-home-card-head">
        <h3>Messagerie</h3>
        <span>{messages.length} message{messages.length > 1 ? "s" : ""}</span>
      </div>
      <button className="auth-secondary" type="button" disabled={loading || busy} onClick={() => setAttempt(value => value + 1)}>Actualiser les messages</button>
      {canReply && contacts ? contacts.length ? <label className="auth-field">{contactKind === "structure" ? "Contacter une structure affiliée" : "Contacter un coach affilié"}<select disabled={busy} value={selected.startsWith("contact:") ? selected.slice(8) : ""} onChange={event => { setSelected(event.target.value ? `contact:${event.target.value}` : ""); setBody(""); setFeedback(""); requestId.current = crypto.randomUUID(); }}><option value="">Choisir un contact</option>{contacts.map(contact => <option key={contact.value} value={contact.value}>{contact.label}</option>)}</select></label> : <p>Aucun contact affilié actif pour le moment. Les deux parties doivent accepter l’affiliation avant de démarrer cet échange.</p> : null}
      {loading ? <p role="status">Chargement des messages…</p> : error ? <p role="alert">{error} Utilisez « Actualiser les messages » pour réessayer.</p> : <>
      {messages.length ? <label className="auth-field">Rechercher dans mes échanges<input type="search" value={query} onChange={event => setQuery(event.target.value)} maxLength={120} /></label> : null}
      {messages.length === 0 ? <p data-message-empty>Aucun message pour le moment.</p> : !visible.length ? <p>Aucun échange ne correspond à cette recherche.</p> : visible.map((message) => (
        <article key={message.id} data-message={message.id}>
          <strong>{recipientName ? message.authorRole === "coach" ? "Votre réponse" : message.senderEmail : message.authorRole === "coach" ? `Réponse de ${message.recipientName}` : `À ${message.recipientName}`}</strong>
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{message.body}</p>
          <p><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</time></p>
          {canReply ? <button className="auth-secondary" type="button" disabled={busy} onClick={() => { setSelected(message.id); setBody(""); setFeedback(""); requestId.current = crypto.randomUUID(); }}>Répondre à ce message</button> : null}
        </article>
      ))}</>}
      {selected && canReply ? <form onSubmit={reply} aria-label={selected.startsWith("contact:") ? "Démarrer un échange" : "Répondre au message"}>
        <p>{selected.startsWith("contact:") ? "Message au contact affilié sélectionné." : "Réponse dans la conversation sélectionnée."} Aucun email ou SMS externe n’est envoyé.</p>
        {recipientName ? <button className="auth-secondary" type="button" disabled={busy} onClick={() => { setBody("Bonjour, merci pour votre message. Précisez votre objectif et vos disponibilités pour préparer notre échange."); requestId.current = crypto.randomUUID(); }}>Utiliser le modèle d’accueil</button> : null}
        <label className="auth-field">Votre réponse<textarea required maxLength={4000} rows={4} value={body} onChange={event => { setBody(event.target.value); requestId.current = crypto.randomUUID(); }} disabled={busy} /></label>
        <button type="submit" className="auth-primary" disabled={busy || !body.trim()}>{busy ? "Envoi…" : selected.startsWith("contact:") ? "Envoyer le message" : "Envoyer la réponse"}</button>
        <button type="button" className="auth-secondary" disabled={busy} onClick={() => { setSelected(""); setBody(""); }}>Fermer la réponse</button>
      </form> : null}
      {feedback ? <p role="status">{feedback}</p> : null}
    </section>
  );
}
