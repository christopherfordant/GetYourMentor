// Preserve fixture spacing while keeping historical scenarios in the future.
export function futureSlot(reference: string) {
  const relative = Date.parse(reference.replace(" ", "T") + "Z") - Date.parse("2026-01-01T00:00:00Z");
  return new Date(Date.now() + 400 * 86400000 + relative).toISOString();
}
