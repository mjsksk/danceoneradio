import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEO = ({ 
  title = "Dance One Radio - The Castle of Dance",
  description = "Live stream of the newest dance and electronic music",
  image = "/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png", // Station logo as default
  url = window.location.href
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

    // Update meta tags with specific selectors
    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', window.location.origin + image);
    updateMetaTag('meta[property="og:url"]', url);
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:image"]', window.location.origin + image);
    
    // Debug: Log current meta tags (remove in production)
    console.log('SEO Meta Tags Updated:', {
      title,
      description,
      image: window.location.origin + image,
      url
    });
    
    // Force refresh social media tags
    if (typeof window !== 'undefined') {
      // Remove any cached social media metadata
      const existingCanonical = document.querySelector('link[rel="canonical"]');
      if (!existingCanonical) {
        const canonical = document.createElement('link');
        canonical.rel = 'canonical';
        canonical.href = url;
        document.head.appendChild(canonical);
      } else {
        existingCanonical.setAttribute('href', url);
      }
    }

    return () => {
      // Reset to defaults when component unmounts
      document.title = "Dance One Radio - The Castle of Dance";
      updateMetaTag('meta[name="description"]', "Live stream of the newest dance and electronic music");
      updateMetaTag('meta[property="og:title"]', "Dance One Radio - The Castle of Dance");
      updateMetaTag('meta[property="og:description"]', "Live stream of the newest dance and electronic music");
      updateMetaTag('meta[property="og:image"]', window.location.origin + "/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png");
      updateMetaTag('meta[name="twitter:title"]', "Dance One Radio - The Castle of Dance");
      updateMetaTag('meta[name="twitter:image"]', window.location.origin + "/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png");
    };
  }, [title, description, image, url]);

  return null; // This component doesn't render anything
};

export default SEO;