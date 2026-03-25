/**
 * Track slug utilities for SEO-friendly track URLs
 */

export function createTrackSlug(artist: string, title: string): string {
  const combined = `${artist}-${title}`;
  return combined
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/&/g, 'and')
    .replace(/['']/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 120);
}

export function parseTrackSlug(slug: string): { artist: string; title: string } | null {
  // We can't perfectly reverse a slug, so we'll use it for DB lookup
  return { artist: slug, title: slug };
}
