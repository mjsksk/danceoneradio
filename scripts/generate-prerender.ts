import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'node:url';

// Routes to prerender with their SEO metadata
const routes = [
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
    path: '/love-parade-2005',
    title: 'Love Parade 2005 Photo Gallery - Dance One Radio',
    description: 'View photos from Love Parade 2005, celebrating electronic dance music culture and the spirit of peace, love, and unity.',
    image: '/assets/love-parade-2005.jpg'
  },
  {
    path: '/love-parade-2006',
    title: 'Love Parade 2006 Photo Gallery - Dance One Radio',
    description: 'View photos from Love Parade 2006 in San Francisco, one of the last major Love Parade events celebrating electronic music.',
    image: '/assets/love-parade-2006.png'
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
  // Episode pages
  {
    path: '/episode/389',
    title: 'Anthems of the week 389 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 389 featuring 54 tracks of the latest electronic dance music, including exclusive unreleased tracks from top artists.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/390',
    title: 'Anthems of the week 390 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 390 featuring 28 tracks of the latest electronic dance music, including exclusive unreleased tracks from top artists.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/391',
    title: 'Anthems of the week 391 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 391 featuring 26 tracks of the latest electronic dance music, including tracks from Above & Beyond, Prospa, KETTAMA, and more.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/392',
    title: 'Anthems of the week 392 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 392 featuring 25 tracks of the latest electronic dance music, including tracks from John Summit, KETTAMA, Hot Since 82, and more.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/393',
    title: 'Anthems of the week 393 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 393 featuring 35 tracks of the latest electronic dance music, including tracks from Hana, Chaney, Bruno Martini, Kaskade, and more.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/394',
    title: 'Anthems of the week 394 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 394 featuring 19 tracks of the latest electronic dance music, including tracks from CamelPhat, Kaz James, Nic Fanciulli, and more.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/395',
    title: 'Anthems of the week 395 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 395 featuring 15 tracks of the latest electronic dance music, including tracks from Durante, Faithless, Above & Beyond, and more.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/396',
    title: 'Anthems of the week 396 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 396 featuring the latest electronic dance music tracks and unreleased anthems.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/397',
    title: 'Anthems of the week 397 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 397 featuring the latest electronic dance music tracks and unreleased anthems.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/398',
    title: 'Anthems of the week 398 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 398 featuring the latest electronic dance music tracks and unreleased anthems.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/399',
    title: 'Anthems of the week 399 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 399 featuring the latest electronic dance music tracks and unreleased anthems.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/400',
    title: 'Anthems of the week 400 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 400 featuring the latest electronic dance music tracks and unreleased anthems.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/401',
    title: 'Anthems of the week 401 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 401 featuring the latest electronic dance music tracks and unreleased anthems.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  {
    path: '/episode/402',
    title: 'Anthems of the week 402 - Future Dance Anthems with Mario | Dance One Radio',
    description: 'Episode 402 featuring 21 tracks including Claptone, Simon Doty, Marsh, Meduza, Vintage Culture and more.',
    image: '/lovable-uploads/mario-show.jpg'
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

function escapeAttr(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildMetaBlock(route: (typeof routes)[number]) {
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

function generateHTMLFromTemplate(templateHtml: string, route: (typeof routes)[number]) {
  const cleaned = stripDynamicHeadTags(templateHtml);

  // IMPORTANT: inject at the START of <head> so crawlers pick up these tags first.
  // Some scrapers (including Facebook) will use the first occurrence when duplicates exist.
  const headInjected = cleaned.replace(
    /<head(\s[^>]*)?>/i,
    (match) => `${match}${buildMetaBlock(route)}`
  );

  return headInjected;
}

// Build a minimal share page that auto-redirects to the real page.
function generateSharePageHTML(route: (typeof routes)[number]) {
  const baseUrl = 'https://danceoneradio.com';
  const fullUrl = `${baseUrl}${route.path}`;
  const imageUrl = route.image.startsWith('http') ? route.image : `${baseUrl}${route.image}`;

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
  <link rel="canonical" href="${fullUrl}" />

  <!-- Facebook App ID -->
  <meta property="fb:app_id" content="111030096697" />

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${fullUrl}" />
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

  <!-- Structured Data -->
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
      url: baseUrl
    }
  }, null, 2)}
  </script>

  <!-- Redirect to real page after crawlers have captured metadata -->
  <meta http-equiv="refresh" content="0;url=${fullUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${fullUrl}">${title}</a>...</p>
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

    // Also generate a /share/<route> page with only meta tags + redirect.
    // This is useful for social sharing on hosts that don't run edge functions.
    const shareDir = path.join(distDir, 'share', route.path === '/' ? '' : route.path.slice(1));
    if (!fs.existsSync(shareDir)) {
      fs.mkdirSync(shareDir, { recursive: true });
    }
    const shareHtml = generateSharePageHTML(route);
    const sharePath = path.join(shareDir, 'index.html');
    fs.writeFileSync(sharePath, shareHtml);
    console.log(`Generated share page: ${sharePath}`);
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
