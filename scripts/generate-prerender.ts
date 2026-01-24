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
