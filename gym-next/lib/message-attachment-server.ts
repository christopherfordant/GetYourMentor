import { createHash, randomUUID } from "node:crypto";
import { MAX_MESSAGE_FILE_BYTES, MAX_MESSAGE_REQUEST_BYTES, type AttachmentInput, type MessageAttachment, isMessageAttachment } from "./message-attachment-contract";
import { isHostedDemo, isIsolatedDemoFeatureEnabled } from "./runtime";
import { demoBlobStore, mutateDemoState } from "./repositories/demo-state";

export class MessageFileError extends Error {
  constructor(message: string, public status = 415, public code = "MESSAGE_ATTACHMENTS_UNAVAILABLE") { super(message); }
}
export async function boundedMessageJson(request: Request): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new MessageFileError("Requête vide", 400, "INVALID_MESSAGE");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const next = await reader.read(); if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_MESSAGE_REQUEST_BYTES) { await reader.cancel(); throw new MessageFileError("Requête trop volumineuse", 413, "MESSAGE_TOO_LARGE"); }
      chunks.push(next.value);
    }
    const data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
    return data;
  } catch (error) {
    if (error instanceof MessageFileError) throw error;
    throw new MessageFileError("Requête JSON invalide", 400, "INVALID_MESSAGE");
  } finally { reader.releaseLock(); }
}
export function parseMessageFile(value: unknown): { bytes: Uint8Array; meta: MessageAttachment } {
  const fail = () => new MessageFileError("Seul un fichier .txt UTF-8 non vide de 64 Kio maximum est accepté.");
  if (!isIsolatedDemoFeatureEnabled() || !value || typeof value !== "object") throw fail();
  const input = value as AttachmentInput;
  if (Object.keys(input).some(k => !["name", "type", "base64"].includes(k)) || input.type !== "text/plain" || typeof input.base64 !== "string" || input.base64.length > Math.ceil(MAX_MESSAGE_FILE_BYTES / 3) * 4) throw fail();
  const bytes = Buffer.from(input.base64, "base64");
  if (bytes.toString("base64") !== input.base64 || !bytes.length || bytes.length > MAX_MESSAGE_FILE_BYTES) throw fail();
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { throw fail(); }
  // Validate encoding and reject binary control characters; no semantic extraction.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) throw fail();
  if (/^\s*(?:%PDF-|PK\x03\x04|MZ|GIF8)/i.test(text) || /<\/?[a-z][^>]*>/i.test(text)) throw fail();
  const meta: MessageAttachment = { id: `attachment-${randomUUID()}`, name: input.name, size: bytes.length, type: "text/plain", sha256: fileDigest(bytes) };
  if (!isMessageAttachment(meta)) throw fail();
  return { bytes, meta };
}
export const fileDigest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const processState = globalThis as typeof globalThis & { gymDemoMessageFiles?: Map<string, Uint8Array> };
const memory = processState.gymDemoMessageFiles ??= new Map<string, Uint8Array>();
const key = (id: string) => `message-files/${id}`;
export async function putMessageFile(meta: MessageAttachment, bytes: Uint8Array) {
  if (!isIsolatedDemoFeatureEnabled()) throw new MessageFileError("Fichier indisponible", 503);
  if (isHostedDemo()) await mutateDemoState(state => { (state.pendingMessageFiles ??= []).push({ id: meta.id, createdAt: new Date().toISOString() }); });
  if (isHostedDemo()) await demoBlobStore().set(key(meta.id), Uint8Array.from(bytes).buffer, { onlyIfNew: true, metadata: { purpose: "private-message", sha256: meta.sha256 } });
  else memory.set(meta.id, Uint8Array.from(bytes));
  await getMessageFile(meta);
}
export async function getMessageFile(meta: MessageAttachment) {
  if (!isIsolatedDemoFeatureEnabled() || !isMessageAttachment(meta)) throw new MessageFileError("Fichier indisponible", 404, "MESSAGE_FILE_UNAVAILABLE");
  const data = isHostedDemo() ? await demoBlobStore().get(key(meta.id), { type: "arrayBuffer" }) : memory.get(meta.id);
  if (!data) throw new MessageFileError("Fichier indisponible", 404, "MESSAGE_FILE_UNAVAILABLE");
  const bytes = new Uint8Array(data);
  if (bytes.length !== meta.size || fileDigest(bytes) !== meta.sha256) throw new MessageFileError("Fichier indisponible", 503, "MESSAGE_FILE_UNAVAILABLE");
  return bytes;
}
export async function deleteUnusedMessageFile(id: string) {
  if (isHostedDemo()) {
    await demoBlobStore().delete(key(id));
    await mutateDemoState(state => { state.pendingMessageFiles = state.pendingMessageFiles?.filter(item => item.id !== id); });
  } else memory.delete(id);
}
