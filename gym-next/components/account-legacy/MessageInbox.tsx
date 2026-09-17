"use client";

import { useEffect, useState } from "react";

type Message = { id: string; senderEmail: string; recipientName: string; body: string; createdAt: string };

export function MessageInbox({ recipientName }: { recipientName?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const query = recipientName ? `?recipientName=${encodeURIComponent(recipientName)}` : "";
    fetch(`/api/messages${query}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Messages indisponibles"))))
      .then((payload) => setMessages(payload.data as Message[]))
      .catch(() => setMessages([]));
  }, [recipientName]);

  return (
    <section className="account-dashboard-card" data-message-inbox>
      <div className="coach-home-card-head">
        <h3>Messagerie</h3>
        <span>{messages.length} message{messages.length > 1 ? "s" : ""}</span>
      </div>
      {messages.length === 0 ? <p data-message-empty>Aucun message pour le moment.</p> : messages.map((message) => (
        <article key={message.id} data-message={message.id}>
          <strong>{recipientName ? message.senderEmail : `À ${message.recipientName}`}</strong>
          <p>{message.body}</p>
        </article>
      ))}
    </section>
  );
}
