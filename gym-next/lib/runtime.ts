export function isDemoFallbackAllowed() {
  return process.env.NODE_ENV !== "production" || process.env.GETYOURMENTOR_ALLOW_DEMO === "true";
}

export function assertDemoFallbackAllowed(resource: string) {
  if (!isDemoFallbackAllowed()) {
    throw new Error(`${resource} n'est pas configuré pour cet environnement de production`);
  }
}
