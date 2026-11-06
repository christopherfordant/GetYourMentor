import type { StructureOffer } from "@/lib/domain/structure-offer";

// Existing process-local demo array, shared with the service via a compatibility
// export. Hosted demo still uses DemoState; configured persistence never reads it.
export const memoryStructureOffers: StructureOffer[] = [];
