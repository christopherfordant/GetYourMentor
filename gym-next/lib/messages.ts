export type Message = {
  id: string;
  senderEmail: string;
  recipientName: string;
  reservationId?: string;
  body: string;
  createdAt: string;
};

import { assertDemoFallbackAllowed } from "@/lib/runtime";

const memoryMessages: Message[] = [];

function supabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return { url: url.replace(/\/$/, ""), key };
  assertDemoFallbackAllowed("Supabase Messages");
  return null;
}

export async function createMessage(message: Message) {
  const config = supabaseConfig();
  if (!config) {
    memoryMessages.push(message);
    return message;
  }

  const response = await fetch(`${config.url}/rest/v1/gym_messages`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      id: message.id,
      sender_email: message.senderEmail,
      recipient_name: message.recipientName,
      reservation_id: message.reservationId ?? null,
      body: message.body,
      created_at: message.createdAt,
    }),
  });
  if (!response.ok) throw new Error(`Supabase message error (${response.status})`);
  const [saved] = await response.json();
  return { ...message, id: saved.id ?? message.id, createdAt: saved.created_at ?? message.createdAt };
}

export async function listMessages(options: { senderEmail?: string; recipientName?: string } = {}) {
  const config = supabaseConfig();
  if (!config) {
    return memoryMessages.filter((message) =>
      (!options.senderEmail || message.senderEmail === options.senderEmail) &&
      (!options.recipientName || message.recipientName.toLowerCase() === options.recipientName.toLowerCase()),
    );
  }

  const senderFilter = options.senderEmail ? `&sender_email=eq.${encodeURIComponent(options.senderEmail)}` : "";
  const recipientFilter = options.recipientName ? `&recipient_name=eq.${encodeURIComponent(options.recipientName)}` : "";
  const response = await fetch(`${config.url}/rest/v1/gym_messages?select=*&order=created_at.desc${senderFilter}${recipientFilter}`, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase message error (${response.status})`);
  return (await response.json()).map((row: Record<string, unknown>) => ({
    id: row.id,
    senderEmail: row.sender_email,
    recipientName: row.recipient_name,
    reservationId: row.reservation_id,
    body: row.body,
    createdAt: row.created_at,
  })) as Message[];
}
