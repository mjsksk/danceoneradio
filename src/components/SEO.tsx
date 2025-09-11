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

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`) || 
                   document.querySelector(`meta[name="${property}"]`);
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          metaTag.setAttribute('property', property);
        } else {
          metaTag.setAttribute('name', property);
        }
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', content);
    };

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    return () => {
      // Reset to defaults when component unmounts
      document.title = "Dance One Radio - The Castle of Dance";
      updateMetaTag('description', "Live stream of the newest dance and electronic music");
      updateMetaTag('og:title', "Dance One Radio - The Castle of Dance");
      updateMetaTag('og:description', "Live stream of the newest dance and electronic music");
      updateMetaTag('og:image', "/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png");
      updateMetaTag('twitter:title', "Dance One Radio - The Castle of Dance");
      updateMetaTag('twitter:description', "Live stream of the newest dance and electronic music");
      updateMetaTag('twitter:image', "/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png");
    };
  }, [title, description, image, url]);

  return null; // This component doesn't render anything
};

export default SEO;