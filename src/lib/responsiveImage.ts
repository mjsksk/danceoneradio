import manifest from "./responsiveManifest.json";

type Entry = { srcset: string; w: number; h: number };
const MAP = manifest as Record<string, Entry>;

/**
 * Given a public image URL (e.g. "/lovable-uploads/foo.JPG"), returns
 * the responsive srcSet + intrinsic dimensions, or null if no variants exist.
 */
export function getResponsive(src?: string | null) {
  if (!src) return null;
  // Strip query strings / origin if present
  let key = src;
  try {
    if (/^https?:/i.test(src)) {
      const u = new URL(src);
      key = u.pathname;
    } else if (src.includes("?")) {
      key = src.split("?")[0];
    }
  } catch {
    // ignore
  }
  return MAP[key] || null;
}

/**
 * Default `sizes` attribute appropriate for most layouts. Components can
 * override by passing their own `sizes` prop.
 */
export const DEFAULT_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
