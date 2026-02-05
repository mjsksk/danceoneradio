export type ShareUrls = {
  /** Crawler-friendly static share bridge page (e.g. /share-episode-402.html) */
  socialShareUrl: string;
  /** Human-friendly canonical URL (e.g. /episode/402) */
  canonicalUrl: string;
};

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, '');
}

// /episode/402 → share-episode-402.html
// /about → share-about.html
// / → share-home.html
export function routeToShareFilename(pathname: string): string {
  if (pathname === '/') return 'share-home.html';
  return `share${pathname.replace(/\//g, '-')}.html`;
}

/**
 * Builds both a canonical URL and the static share-bridge URL.
 *
 * IMPORTANT: prefer `publicSiteOrigin` so preview domains don't leak into shares.
 */
export function getShareUrls(inputUrl: string, publicSiteOrigin?: string): ShareUrls {
  try {
    const u = new URL(inputUrl);
    const pathname = u.pathname !== '/' ? u.pathname.replace(/\/+$/, '') : '/';

    const origin = normalizeOrigin(publicSiteOrigin?.trim() || u.origin);
    const shareFilename = routeToShareFilename(pathname);

    return {
      socialShareUrl: `${origin}/${shareFilename}`,
      canonicalUrl: `${origin}${pathname}`,
    };
  } catch {
    return { socialShareUrl: inputUrl, canonicalUrl: inputUrl };
  }
}
