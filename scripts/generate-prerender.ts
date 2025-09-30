import fs from 'fs';
import path from 'path';

// Routes to prerender with their SEO metadata
const routes = [
  {
    path: '/',
    title: 'Dance One Radio - The Castle of Dance | Live Electronic & Dance Music Stream',
    description: 'Listen to Dance One Radio - Live streaming the newest dance, electronic, trance, house, and EDM music 24/7. Your ultimate castle of dance music with DJ mixes, podcasts, and exclusive shows.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/shows',
    title: 'DJ Shows & Podcasts - Dance One Radio',
    description: 'Listen to exclusive DJ mixes, podcasts, and radio shows from Dance One Radio. New episodes weekly featuring the best electronic and dance music.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
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
  {
    path: '/episode/389',
    title: 'Episode 389 - Dance One Radio Podcast',
    description: 'Listen to Episode 389 of Dance One Radio podcast featuring the latest electronic and dance music tracks.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  {
    path: '/episode/390',
    title: 'Episode 390 - Dance One Radio Podcast',
    description: 'Listen to Episode 390 of Dance One Radio podcast featuring the latest electronic and dance music tracks.',
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

// Generate HTML template with SEO metadata
function generateHTML(route: typeof routes[0]): string {
  const baseUrl = 'https://danceoneradio.com';
  const fullUrl = `${baseUrl}${route.path}`;
  const imageUrl = route.image.startsWith('http') ? route.image : `${baseUrl}${route.image}`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/favicon.png" type="image/png">
    <title>${route.title}</title>
    <meta name="description" content="${route.description}" />
    <meta name="author" content="Dance One Radio" />
    <meta name="keywords" content="dance music radio, electronic music stream, EDM radio, trance radio, house music, live DJ mixes, dance music podcast, online radio station, electronic dance music" />
    <link rel="canonical" href="${fullUrl}" />
    
    <!-- Enhanced SEO Meta Tags -->
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow" />
    <meta name="bingbot" content="index, follow" />
    <meta name="language" content="English" />
    <meta name="revisit-after" content="1 days" />
    <meta name="rating" content="general" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Dance One Radio" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@DanceOneRadio" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:creator" content="@DanceOneRadio" />
    
    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "${route.title}",
      "description": "${route.description}",
      "url": "${fullUrl}",
      "image": "${imageUrl}",
      "publisher": {
        "@type": "RadioStation",
        "name": "Dance One Radio",
        "url": "${baseUrl}",
        "logo": "${baseUrl}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png"
      }
    }
    </script>

    <!-- Preconnect to critical resources -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- DNS prefetch for external resources -->
    <link rel="dns-prefetch" href="//s9.myradiostream.com">
    <link rel="dns-prefetch" href="//api.allorigins.win">
  </head>

  <body>
    <div id="root"></div>
    
    <!-- Noscript fallback with basic content -->
    <noscript>
      <h1>${route.title}</h1>
      <p>${route.description}</p>
      <p>Please enable JavaScript to use Dance One Radio.</p>
    </noscript>
    
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

// Generate prerendered HTML files
function generatePrerenderFiles() {
  const distDir = path.resolve(process.cwd(), 'dist');
  
  if (!fs.existsSync(distDir)) {
    console.error('dist directory does not exist. Run build first.');
    return;
  }

  routes.forEach(route => {
    const routePath = route.path === '/' ? 'index' : route.path.slice(1).replace(/\//g, '-');
    const fileName = `${routePath}.html`;
    const filePath = path.join(distDir, fileName);
    
    // Create subdirectories if needed
    if (route.path !== '/') {
      const subDir = path.join(distDir, route.path.slice(1));
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
      const indexPath = path.join(subDir, 'index.html');
      fs.writeFileSync(indexPath, generateHTML(route));
      console.log(`Generated: ${indexPath}`);
    } else {
      fs.writeFileSync(filePath, generateHTML(route));
      console.log(`Generated: ${filePath}`);
    }
  });

  console.log('Prerendering complete!');
}

generatePrerenderFiles();
