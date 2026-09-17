export function bodyExceedsLimit(request: Request, maxBytes: number) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return false;
  const parsed = Number(contentLength);
  return Number.isFinite(parsed) && parsed > maxBytes;
}

export function textExceedsLimit(value: unknown, maxCharacters: number) {
  return typeof value === "string" && value.length > maxCharacters;
}
