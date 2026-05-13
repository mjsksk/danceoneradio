import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  structuredData?: Record<string, any> | Record<string, any>[];
}

const SEO = ({ 
  title = "Dance One Radio | Live Electronic & Dance Music",
  description = "Live 24/7 dance, electronic, trance, house, and EDM music. DJ mixes, podcasts, and exclusive shows from Dance One Radio.",
  image = "/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png",
  url = window.location.href,
  type = "website",
  keywords = "dance music radio, electronic music stream, EDM radio, trance radio, house music, live DJ mixes, dance music podcast, online radio station",
  structuredData,
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags with proper selectors
    const updateMetaTag = (selector: string, content: string) => {
      let metaTag = document.querySelector(selector);
      
      if (metaTag) {
        metaTag.setAttribute('content', content);
      } else {
        // Create new meta tag if it doesn't exist
        metaTag = document.createElement('meta');
        if (selector.includes('property=')) {
          const property = selector.match(/property="([^"]+)"/)?.[1];
          if (property) metaTag.setAttribute('property', property);
        } else if (selector.includes('name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) metaTag.setAttribute('name', name);
        }
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    };

    // Full image URL
    const fullImageUrl = image.startsWith('http') ? image : window.location.origin + image;

    // Update essential meta tags
    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[name="keywords"]', keywords);
    
    // Open Graph meta tags
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', fullImageUrl);
    updateMetaTag('meta[property="og:url"]', url);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:site_name"]', "Dance One Radio");
    
    // Twitter Card meta tags
    updateMetaTag('meta[name="twitter:card"]', "summary_large_image");
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', fullImageUrl);
    updateMetaTag('meta[name="twitter:site"]', "@DanceOneRadio");
    
    // SEO robots meta tags
    updateMetaTag('meta[name="robots"]', "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    
    // Update or create canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Add structured data if not exists
    const addStructuredData = () => {
      const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic', 'true');
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": url,
        "image": fullImageUrl,
        "publisher": {
          "@type": "RadioStation",
          "name": "Dance One Radio",
          "url": "https://danceoneradio.com",
          "logo": window.location.origin + "/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png"
        }
      });
      document.head.appendChild(script);
    };

    addStructuredData();

    return () => {
      // Reset to defaults when component unmounts
      document.title = "Dance One Radio - The Castle of Dance | Live Electronic & Dance Music Stream";
    };
  }, [title, description, image, url, type, keywords]);

  return null; // This component doesn't render anything
};

export default SEO;