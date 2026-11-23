/**
 * Display brand name for email copy. Mirrors the web's NEXT_PUBLIC_BRAND_NAME
 * (baked at build there; read at runtime here, since the worker and web server
 * both get it from the environment). Empty/whitespace falls back to DayOtter.
 */
export function brandName(): string {
  return process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || "DayOtter";
}
