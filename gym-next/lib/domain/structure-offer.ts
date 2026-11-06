/** Shared offer contract. No service or persistence dependency. */
export type StructureOffer = { id: string; ownerEmail: string; coachId: string; title: string; duration: string; slots: string[]; capacity?: number; createdAt: string; source?: "coach" | "structure"; location?: string; sport?: string };
