import { test, expect } from "@playwright/test";
import { createMessage, MessageConflictError, type Message, type MessageDemoDependencies } from "../lib/messages";
import { putMessageFile, getMessageFile, deleteUnusedMessageFile, fileDigest, type MessageFileStorage } from "../lib/message-attachment-server";
import { readDemoState, mutateDemoState, type DemoState, type DemoBlobStore } from "../lib/repositories/demo-state";
import type { MessageAttachment } from "../lib/message-attachment-contract";
const conflictText = "Cette demande a déjà été utilisée pour un autre message";
const clone = <T>(value: T): T => structuredClone(value);
type Fault = "before" | "after";
// No real SDK, fetch, credentials or environment switch. Reads clone state;
// conditional writes evaluate ETags and return the installed SDK's WriteResult.
class StorageDouble {
 state: DemoState | null = null; version = 0;
 objects = new Map<string, ArrayBuffer>(); deleted: string[] = [];
 fileWrite?: Fault; fileRead?: "absent" | "corrupt"; remove?: Fault;
 commit?: Fault | "spoofed-conflict"; stage?: Fault;
 rejectCommits = 0; commitWrites = 0; store: DemoBlobStore;
 constructor() {
  this.store = {
   get: async (key: string, options: {type: string}) => {
    if(key === "state") { expect(options.type).toBe("json"); return this.state ? clone(this.state) : null; }
    expect(options.type).toBe("arrayBuffer"); const fault = this.fileRead; this.fileRead = undefined;
    if(fault === "absent") return null; const bytes = this.objects.get(key); if(!bytes) return null;
    const copy = bytes.slice(0); if(fault === "corrupt") new Uint8Array(copy)[0] ^= 1; return copy;
   },
   getWithMetadata: async (key: string, options: {type: string}) => {
    expect(key).toBe("state"); expect(options.type).toBe("json");
    return this.state ? {data: clone(this.state), etag: String(this.version), metadata: {}} : null;
   },
   setJSON: async (key: string, value: DemoState, options: {onlyIfNew?: boolean; onlyIfMatch?: string}) => {
    expect(key).toBe("state"); const commit = value.messages.length > (this.state?.messages.length ?? 0);
    if(commit) this.commitWrites++;
    if(commit && this.rejectCommits > 0) {this.rejectCommits--; return {modified: false};}
    if((options.onlyIfNew && this.state) || (options.onlyIfMatch !== undefined && options.onlyIfMatch !== String(this.version))) return {modified: false};
    const fault = commit ? this.commit : this.stage; if(commit) this.commit = undefined; else this.stage = undefined;
    if(fault === "before") throw new Error("Synthetic state write failure");
    this.state = clone(value); this.version++;
    if(fault === "after" || fault === "spoofed-conflict") throw new Error(fault === "spoofed-conflict" ? conflictText : "Synthetic lost state response");
    return {modified: true, etag: String(this.version)};
   },
   set: async (key: string, value: ArrayBuffer, options: {onlyIfNew?: boolean; onlyIfMatch?: string}) => {
    expect(key.startsWith("message-files/attachment-")).toBe(true); expect(options.onlyIfNew).toBe(true); expect(options.onlyIfMatch).toBeUndefined();
    if(this.objects.has(key)) return {modified: false}; const fault = this.fileWrite; this.fileWrite = undefined;
    if(fault === "before") throw new Error("Synthetic byte write failure");
    this.objects.set(key, value.slice(0)); if(fault === "after") throw new Error("Synthetic lost byte response");
    return {modified: true, etag: "file-etag"};
   },
   delete: async (key: string) => {
    const fault = this.remove; this.remove = undefined; if(fault === "before") throw new Error("Synthetic deletion failure");
    this.objects.delete(key); this.deleted.push(key); if(fault === "after") throw new Error("Synthetic lost deletion response");
   },
  } as unknown as DemoBlobStore;
 }
 dependencies(): MessageDemoDependencies {
  return {read: () => readDemoState(this.store), mutate: change => mutateDemoState(change, this.store), files: {blobs: this.store, mutate: change => mutateDemoState(change, this.store)}};
 }
 pending(id: string) {return this.state?.pendingMessageFiles?.some(item => item.id === id) ?? false;}
}
let sequence = 0;
function input() {
 const n = ++sequence, bytes = Buffer.from("Octets synthétiques privés.\n");
 const meta: MessageAttachment = {id: `attachment-${n.toString(16).padStart(8,"0")}-0000-4000-8000-000000000000`, name: "demo.txt", type: "text/plain", size: bytes.length, sha256: fileDigest(bytes)};
 const message: Message = {id: `message-${n}`, requestId: `request-${n}`, senderEmail: "sportif@example.com", coachId: "coach-demo", recipientName: "Coach Démo", authorRole: "coach", ownerRole: "sportif", replyToId: "parent-demo", body: "Texte synthétique", createdAt: "2026-10-19T10:00:00.000Z"};
 return {message, file: {meta, bytes}};
}
const key = (meta: MessageAttachment) => `message-files/${meta.id}`;
for(const fault of ["before", "after"] as const) test(`byte write ${fault}: no message, preparation retained`, async () => {
 const db = new StorageDouble(), item = input(); db.fileWrite = fault;
 await expect(createMessage(item.message,item.file,db.dependencies())).rejects.toThrow();
 expect(db.state?.messages).toHaveLength(0); expect(db.pending(item.file.meta.id)).toBe(true);
 expect(db.objects.has(key(item.file.meta))).toBe(fault === "after"); expect(db.deleted).toHaveLength(0);
});
for(const fault of ["before", "after"] as const) test(`preparation state ${fault}: no byte write after uncertain preparation`, async () => {
 const db = new StorageDouble(), item = input(); db.stage = fault;
 await expect(createMessage(item.message,item.file,db.dependencies())).rejects.toThrow();
 expect(db.objects.size).toBe(0); expect(db.state?.messages ?? []).toHaveLength(0); expect(db.pending(item.file.meta.id)).toBe(fault === "after");
});
for(const fault of ["absent", "corrupt"] as const) test(`readback ${fault}: no message published`, async () => {
 const db = new StorageDouble(), item = input(); db.fileRead = fault;
 await expect(createMessage(item.message,item.file,db.dependencies())).rejects.toThrow();
 expect(db.state?.messages).toHaveLength(0); expect(db.pending(item.file.meta.id)).toBe(true); expect(db.deleted).toHaveLength(0);
});
test("binary conditional modified:false never confirms or deletes existing object", async () => {
 const db = new StorageDouble(), item = input(); db.objects.set(key(item.file.meta),Uint8Array.from(item.file.bytes).buffer);
 await expect(createMessage(item.message,item.file,db.dependencies())).rejects.toThrow();
 expect(db.state?.messages).toHaveLength(0); expect(db.pending(item.file.meta.id)).toBe(true); expect(db.deleted).toHaveLength(0);
});
test("eight conditional conflicts exhaust retries without publication or deletion", async () => {
 const db = new StorageDouble(), item = input(); db.rejectCommits = 8;
 await expect(createMessage(item.message,item.file,db.dependencies())).rejects.toThrow("Démonstration occupée");
 expect(db.commitWrites).toBe(8); expect(db.state?.messages).toHaveLength(0); expect(db.pending(item.file.meta.id)).toBe(true); expect(db.objects.has(key(item.file.meta))).toBe(true);
});
test("conditional conflicts recover from fresh state and clear marker only with link", async () => {
 const db = new StorageDouble(), item = input(); db.rejectCommits = 2;
 const saved = await createMessage(item.message,item.file,db.dependencies());
 expect(saved.id).toBe(item.message.id); expect(db.commitWrites).toBe(3); expect(db.pending(item.file.meta.id)).toBe(false);
 expect(Buffer.from(await getMessageFile(saved.attachment!,db.dependencies().files))).toEqual(item.file.bytes);
 expect(JSON.stringify(db.state)).not.toContain(item.file.bytes.toString("base64"));
});
for(const fault of ["before", "after", "spoofed-conflict"] as const) test(`commit ${fault}: uncertain results never delete potentially linked bytes`, async () => {
 const db = new StorageDouble(), item = input(); db.commit = fault;
 await expect(createMessage(item.message,item.file,db.dependencies())).rejects.toThrow();
 const committed = fault !== "before";
 expect(db.state?.messages).toHaveLength(committed ? 1 : 0); expect(db.pending(item.file.meta.id)).toBe(!committed);
 expect(db.objects.has(key(item.file.meta))).toBe(true); expect(db.deleted).toHaveLength(0);
 if(committed) {const retry = input(); const saved = await createMessage(item.message,retry.file,db.dependencies()); expect(saved.id).toBe(item.message.id); expect(saved.attachment!.id).toBe(item.file.meta.id); expect(db.state?.messages).toHaveLength(1); expect(db.objects.has(key(retry.file.meta))).toBe(false);}
});
test("concurrent equal sends keep one message and compensate unused object", async () => {
 const db = new StorageDouble(), a = input(), b = input(), deps = db.dependencies();
 const result = await Promise.all([createMessage(a.message,a.file,deps),createMessage({...a.message,id:b.message.id},b.file,deps)]);
 expect(result[0].id).toBe(result[1].id); expect(db.state?.messages).toHaveLength(1); expect(db.objects.size).toBe(1); expect(db.state?.pendingMessageFiles ?? []).toHaveLength(0); expect(db.deleted).toHaveLength(1);
});
for(const change of ["text", "target", "file"] as const) test(`same key changed ${change}: conflict preserves original`, async () => {
 const db = new StorageDouble(), a = input(), b = input(), deps = db.dependencies(); await createMessage(a.message,a.file,deps);
 const message = {...a.message,...(change === "text" ? {body:"Autre texte"} : change === "target" ? {replyToId:"other-parent"} : {})};
 if(change === "file") b.file.meta = {...b.file.meta,name:"autre.txt"};
 await expect(createMessage(message,b.file,deps)).rejects.toThrow(conflictText);
 expect(db.state?.messages).toHaveLength(1); expect(db.objects.size).toBe(1); expect(db.deleted).toHaveLength(0);
});
for(const fault of ["before", "after"] as const) test(`compensation delete ${fault}: unresolved marker retained`, async () => {
 const db = new StorageDouble(), item = input(), deps = db.dependencies(); await putMessageFile(item.file.meta,item.file.bytes,deps.files); db.remove = fault;
 await expect(deleteUnusedMessageFile(item.file.meta.id,deps.files)).rejects.toThrow();
 expect(db.pending(item.file.meta.id)).toBe(true); expect(db.objects.has(key(item.file.meta))).toBe(fault === "before");
});
test("failed marker removal remains traceable and explicit compensation can finish", async () => {
 const db = new StorageDouble(), item = input(), deps = db.dependencies(); await putMessageFile(item.file.meta,item.file.bytes,deps.files); db.stage = "before";
 await expect(deleteUnusedMessageFile(item.file.meta.id,deps.files)).rejects.toThrow();
 expect(db.objects.has(key(item.file.meta))).toBe(false); expect(db.pending(item.file.meta.id)).toBe(true);
 await deleteUnusedMessageFile(item.file.meta.id,deps.files); expect(db.pending(item.file.meta.id)).toBe(false);
});


test("lost binary response can retry same logical send while earlier unlinked object stays tracked", async () => {
 const db = new StorageDouble(), a = input(), b = input(), deps = db.dependencies(); db.fileWrite = "after";
 await expect(createMessage(a.message,a.file,deps)).rejects.toThrow();
 const saved = await createMessage({...a.message,id:b.message.id},b.file,deps);
 expect(db.state?.messages).toHaveLength(1); expect(saved.attachment!.id).toBe(b.file.meta.id);
 expect(db.pending(a.file.meta.id)).toBe(true); expect(db.pending(b.file.meta.id)).toBe(false); expect(db.objects.size).toBe(2);
});
for(const fault of ["before", "after"] as const) test(`concurrent duplicate compensation ${fault} preserves linked bytes and unresolved marker`, async () => {
 const db = new StorageDouble(), a = input(), b = input(), deps = db.dependencies(); db.remove = fault;
 const results = await Promise.allSettled([createMessage(a.message,a.file,deps),createMessage({...a.message,id:b.message.id},b.file,deps)]);
 expect(results.filter(r => r.status === "fulfilled")).toHaveLength(1); expect(results.filter(r => r.status === "rejected")).toHaveLength(1);
 expect(db.state?.messages).toHaveLength(1); const linked = db.state!.messages[0].attachment!;
 expect(db.objects.has(key(linked))).toBe(true); expect(db.pending(linked.id)).toBe(false);
 expect(db.state?.pendingMessageFiles).toHaveLength(1); expect(db.objects.size).toBe(fault === "before" ? 2 : 1);
});
test("known concurrent domain conflict compensates only new unused object", async () => {
 const db = new StorageDouble(), a = input(), b = input(), deps = db.dependencies();
 const results = await Promise.allSettled([createMessage(a.message,a.file,deps),createMessage({...a.message,id:b.message.id,body:"Texte différent"},b.file,deps)]);
 expect(results.filter(r => r.status === "fulfilled")).toHaveLength(1);
 const rejected = results.find(r => r.status === "rejected"); expect(rejected?.status).toBe("rejected");
 if(rejected?.status === "rejected") expect(rejected.reason).toBeInstanceOf(MessageConflictError);
 expect(db.state?.messages).toHaveLength(1); expect(db.objects.size).toBe(1); expect(db.state?.pendingMessageFiles ?? []).toHaveLength(0);
 expect(db.objects.has(key(db.state!.messages[0].attachment!))).toBe(true);
});
