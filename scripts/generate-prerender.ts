import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'node:url';

// Auto-detect episode pages from src/pages directory
function detectEpisodeNumbers(): number[] {
  const pagesDir = path.resolve(process.cwd(), 'src/pages');
  if (!fs.existsSync(pagesDir)) return [];
  
  const files = fs.readdirSync(pagesDir);
  const episodes: number[] = [];
  
  for (const file of files) {
    const match = file.match(/^Episode(\d+)\.tsx$/);
    if (match) {
      episodes.push(parseInt(match[1], 10));
    }
  }
  
  return episodes.sort((a, b) => a - b);
}

// Generate episode route metadata dynamically
function generateEpisodeRoutes(): Array<{ path: string; title: string; description: string; image: string }> {
  const episodeNumbers = detectEpisodeNumbers();
  
  return episodeNumbers.map(num => ({
    path: `/episode/${num}`,
    title: `Anthems of the week ${num} - Future Dance Anthems with Mario | Dance One Radio`,
    description: `Episode ${num} featuring the latest electronic dance music tracks and unreleased anthems.`,
    image: '/lovable-uploads/mario-show.jpg'
  }));
}

// Static routes (non-episode pages)
const staticRoutes = [
  {
    path: '/',
    title: 'Dance One Radio - The Castle of Dance | Live Electronic & Dance Music Stream',
    description: 'Listen to Dance One Radio - Live streaming the newest dance, electronic, trance, house, and EDM music 24/7. Your ultimate castle of dance music with DJ mixes, podcasts, and exclusive shows.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/about',
    title: 'About Dance One Radio - Electronic Dance Music Station',
    description: 'Learn about Dance One Radio\'s history, mission, and the passionate team behind your favorite electronic dance music station. Discover our story and join our global community.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/shows',
    title: 'DJ Shows & Podcasts - Dance One Radio',
    description: 'Listen to exclusive DJ mixes, podcasts, and radio shows from Dance One Radio. New episodes weekly featuring the best electronic and dance music.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/downloads',
    title: 'Download Dance One Radio Apps - Desktop & Mobile',
    description: 'Download Dance One Radio desktop apps for Windows, Mac, and Linux. Listen to live electronic dance music streams on your favorite device.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/love',
    title: 'About Love Parade - Dance One Radio',
    description: 'Learn about the history of Love Parade, the iconic electronic music festival that celebrated peace, love, and electronic dance music.',
    image: '/assets/love-parade-2006.png'
  },
  {
    path: '/contact',
    title: 'Contact Dance One Radio - Get in Touch',
    description: 'Contact Dance One Radio for inquiries, partnerships, DJ bookings, or to submit your music. We would love to hear from you.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/player',
    title: 'Live Radio Player - Dance One Radio',
    description: 'Listen live to Dance One Radio streaming the newest electronic and dance music 24/7. Your ultimate castle of dance music.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/gallery',
    title: 'Photo Galleries - Love Parade Events | Dance One Radio',
    description: 'Browse photo galleries from historic Love Parade events in San Francisco and Berlin. Relive the magic of electronic music culture.',
    image: '/assets/love-parade-2006.png'
  },
  {
    path: '/gallery/love-parade-2005',
    title: 'Love Parade 2005 Photo Gallery - Dance One Radio',
    description: 'View photos from Love Parade 2005, celebrating electronic dance music culture and the spirit of peace, love, and unity.',
    image: '/assets/love-parade-2005.jpg'
  },
  {
    path: '/gallery/love-parade-2006',
    title: 'Love Parade 2006 Photo Gallery - Dance One Radio',
    description: 'View photos from Love Parade 2006 in San Francisco, one of the last major Love Parade events celebrating electronic music.',
    image: '/assets/love-parade-2006.png'
  },
  {
    path: '/merch',
    title: 'Merch Store - Dance One Radio',
    description: 'Shop official Dance One Radio merchandise. T-shirts, hoodies, and accessories for electronic music lovers.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/desktop',
    title: 'Desktop Player - Dance One Radio',
    description: 'Listen to Dance One Radio with our dedicated desktop player experience.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  // News pages
  {
    path: '/news',
    title: 'EDM News & Updates - Dance One Radio',
    description: 'Stay updated with the latest electronic dance music news, artist announcements, festival updates, and industry insights from Dance One Radio.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/news/top-stories',
    title: 'Top Stories - EDM News | Dance One Radio',
    description: 'Breaking news and top stories from the electronic dance music world. Stay informed with the latest headlines from Dance One Radio.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/news/artists-releases',
    title: 'Artist News & New Releases - Dance One Radio',
    description: 'Discover new music releases, artist announcements, and exclusive tracks from top electronic dance music producers and DJs.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/news/festivals-events',
    title: 'Festivals & Events - EDM News | Dance One Radio',
    description: 'Get the latest updates on electronic music festivals, concerts, and events happening around the world.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/news/industry-culture',
    title: 'Industry & Culture - EDM News | Dance One Radio',
    description: 'Explore the business and culture of electronic dance music. Industry insights, trends, and cultural commentary.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  // Auth and Account pages
  {
    path: '/auth',
    title: 'Sign In - Dance One Radio',
    description: 'Sign in or create an account to access your Dance One Radio profile, save your listening progress, and get personalized recommendations.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/account',
    title: 'My Account - Dance One Radio',
    description: 'Manage your Dance One Radio account settings, listening history, and preferences.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/reset-password',
    title: 'Reset Password - Dance One Radio',
    description: 'Reset your Dance One Radio account password.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/privacy',
    title: 'Privacy Policy - Dance One Radio',
    description: 'Read the privacy policy for Dance One Radio. Learn how we collect, use, and protect your personal information.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/dmca',
    title: 'DMCA Policy - Dance One Radio',
    description: 'Read the DMCA (Digital Millennium Copyright Act) policy for Dance One Radio.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  }
];

// Combined routes: static + auto-detected episodes
function getAllRoutes() {
  return [...staticRoutes, ...generateEpisodeRoutes()];
}
// Route type definition
type RouteMetadata = { path: string; title: string; description: string; image: string };

function escapeAttr(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildMetaBlock(route: RouteMetadata) {
  const baseUrl = 'https://danceoneradio.com';
  const fullUrl = `${baseUrl}${route.path}`;
  const imageUrl = route.image.startsWith('http') ? route.image : `${baseUrl}${route.image}`;

  const title = escapeAttr(route.title);
  const description = escapeAttr(route.description);
  const image = escapeAttr(imageUrl);
  const canonical = escapeAttr(fullUrl);

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="author" content="Dance One Radio" />
    <meta name="keywords" content="dance music radio, electronic music stream, EDM radio, trance radio, house music, live DJ mixes, dance music podcast, online radio station, electronic dance music" />
    <link rel="canonical" href="${canonical}" />

    <!-- Enhanced SEO Meta Tags -->
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow" />
    <meta name="bingbot" content="index, follow" />

    <!-- Facebook App ID - MUST be before other OG tags -->
    <meta property="fb:app_id" content="111030096697" />

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Dance One Radio" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@DanceOneRadio" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:creator" content="@DanceOneRadio" />

    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: route.title,
      description: route.description,
      url: fullUrl,
      image: imageUrl,
      publisher: {
        "@type": "RadioStation",
        name: "Dance One Radio",
        url: baseUrl,
        logo: `${baseUrl}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png`,
      }
    }, null, 2)}
    </script>
  `;
}

function stripDynamicHeadTags(html: string) {
  // Remove existing tags we override to avoid duplicates.
  return html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+(?:name|property)="(?:description|keywords|robots|googlebot|bingbot|twitter:[^"]+|og:[^"]+|fb:app_id)"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '');
}

function generateHTMLFromTemplate(templateHtml: string, route: RouteMetadata) {
  const cleaned = stripDynamicHeadTags(templateHtml);

  // IMPORTANT: inject at the START of <head> so crawlers pick up these tags first.
  // Some scrapers (including Facebook) will use the first occurrence when duplicates exist.
  const headInjected = cleaned.replace(
    /<head(\s[^>]*)?>/i,
    (match) => `${match}${buildMetaBlock(route)}`
  );

  return headInjected;
}

// Convert route path to safe filename for root-level share file
function routeToShareFilename(routePath: string): string {
  if (routePath === '/') return 'share-home.html';
  // /episode/402 → share-episode-402.html
  // /about → share-about.html
  return `share${routePath.replace(/\//g, '-')}.html`;
}

// Build a minimal share page that auto-redirects to the real page.
function generateSharePageHTML(route: RouteMetadata) {
  const baseUrl = 'https://danceoneradio.com';
  const fullUrl = `${baseUrl}${route.path}`;
  const imageUrl = route.image.startsWith('http') ? route.image : `${baseUrl}${route.image}`;
  const shareFilename = routeToShareFilename(route.path);
  const shareUrl = `${baseUrl}/${shareFilename}`;

  // IMPORTANT:
  // - Social scrapers don't execute JS, so they stay on this static page and read the OG tags.
  // - Facebook may treat `og:url` / canonical as the "object" identifier and re-scrape it.
  //   If that points to an SPA route, it can fall back to homepage tags.
  // - Therefore, `og:url` + canonical MUST point to this static share HTML file.
  // - We redirect real browsers with JS; scrapers ignore it.

  const title = escapeAttr(route.title);
  const description = escapeAttr(route.description);
  const image = escapeAttr(imageUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href="${shareUrl}" />

  <!-- Facebook App ID -->
  <meta property="fb:app_id" content="111030096697" />

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${shareUrl}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Dance One Radio" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@DanceOneRadio" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:creator" content="@DanceOneRadio" />

  <!-- Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: route.title,
    description: route.description,
    url: shareUrl,
    image: imageUrl,
    publisher: {
      "@type": "RadioStation",
      name: "Dance One Radio",
      url: baseUrl
    }
  }, null, 2)}
  </script>
</head>
<body>
  <!--
    IMPORTANT UX NOTE:
    Some in-app browsers / link shims can block or delay JS redirects, which can look like a blank page.
    Keep a visible link so humans can always click through, while scrapers still read the OG tags.
  -->
  <main style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 24px; max-width: 760px; margin: 0 auto;">
    <h1 style="font-size: 20px; margin: 0 0 8px;">Opening Dance One Radio…</h1>
    <p style="margin: 0 0 16px; line-height: 1.5;">If you’re not redirected automatically, use this link:</p>
    <p style="margin: 0 0 16px;"><a href="${fullUrl}" rel="noopener noreferrer" style="font-size: 16px;">Continue →</a></p>
    <p style="margin: 0; font-size: 12px; opacity: 0.75;">(This page exists only to generate a correct social preview.)</p>
  </main>
  <noscript>
    <p style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 0 24px;">JavaScript is disabled. Continue here: <a href="${fullUrl}">${title}</a></p>
  </noscript>
  <script>
    (function () {
      var target = ${JSON.stringify(fullUrl)};
      function go() {
        try {
          if (window.top && window.top !== window) {
            window.top.location.replace(target);
            return;
          }
        } catch (e) {
          // fall through
        }
        try {
          window.location.replace(target);
        } catch (e) {
          try { window.location.href = target; } catch (_) {}
        }
      }

      // Attempt immediately.
      go();

      // And once more shortly after (some environments delay navigation during initial parse).
      setTimeout(go, 800);
    })();
  </script>
</body>
</html>`;
}

// Generate prerendered HTML files (runs after Vite build)
export function generatePrerenderFiles() {
  const distDir = path.resolve(process.cwd(), 'dist');
  
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory does not exist. Run build first.');
  }

  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found. Vite build may have failed.');
  }
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');

  const routes = getAllRoutes();
  console.log(`Processing ${routes.length} routes (including ${routes.filter(r => r.path.startsWith('/episode/')).length} episodes)...`);
  
  routes.forEach(route => {
    const html = generateHTMLFromTemplate(templateHtml, route);

    if (route.path === '/') {
      // Update the homepage HTML in-place.
      fs.writeFileSync(templatePath, html);
      console.log(`Updated: ${templatePath}`);
    } else {
      const subDir = path.join(distDir, route.path.slice(1));
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
      const indexPath = path.join(subDir, 'index.html');
      fs.writeFileSync(indexPath, html);
      console.log(`Generated: ${indexPath}`);
    }

    // Generate ROOT-LEVEL share HTML file for social scrapers
    // e.g., dist/share-episode-402.html
    // This is the most reliable way to serve static HTML on Lovable hosting
    const shareFilenameHtml = routeToShareFilename(route.path);
    const shareRootHtmlPath = path.join(distDir, shareFilenameHtml);
    const shareHtml = generateSharePageHTML(route);
    fs.writeFileSync(shareRootHtmlPath, shareHtml);
    console.log(`Generated root share page: ${shareRootHtmlPath}`);

    // Also generate a directory-index variant (some environments prefer /share-episode-402/)
    const shareDirName = shareFilenameHtml.replace(/\.html$/, '');
    const shareRootDir = path.join(distDir, shareDirName);
    if (!fs.existsSync(shareRootDir)) {
      fs.mkdirSync(shareRootDir, { recursive: true });
    }
    const shareRootDirPath = path.join(shareRootDir, 'index.html');
    fs.writeFileSync(shareRootDirPath, shareHtml);
    console.log(`Generated root share page (dir): ${shareRootDirPath}`);

    // Also generate the /share/<route> directory structure (legacy/fallback)
    const shareDir = path.join(distDir, 'share', route.path === '/' ? '' : route.path.slice(1));
    if (!fs.existsSync(shareDir)) {
      fs.mkdirSync(shareDir, { recursive: true });
    }
    const shareDirPath = path.join(shareDir, 'index.html');
    fs.writeFileSync(shareDirPath, shareHtml);
    console.log(`Generated share page (dir): ${shareDirPath}`);
  });

  console.log('Prerendering complete!');
}

// Allow running as a standalone script.
const isDirectRun = (() => {
  try {
    if (!process.argv[1]) return false;
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  generatePrerenderFiles();
}
