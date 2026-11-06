import type { Server } from 'node:http';
export function createPreview(options?: { root?: string }): Promise<Server>;
