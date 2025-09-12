import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Add Content Security Policy via meta tag
    const cspMetaTag = document.createElement('meta');
    cspMetaTag.httpEquiv = 'Content-Security-Policy';
    cspMetaTag.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://securepubads.g.doubleclick.net https://tpc.googlesyndication.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' blob: https: http:",
      "connect-src 'self' https://upbwlnpycrbhxahjztrf.supabase.co wss://upbwlnpycrbhxahjztrf.supabase.co https://api.music.apple.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
      "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ');
    
    // Only add if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      document.head.appendChild(cspMetaTag);
    }

    // Add other security headers via meta tags where possible
    const securityMetas = [
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-Frame-Options', content: 'DENY' },
      { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    securityMetas.forEach(meta => {
      const existingMeta = document.querySelector(`meta[http-equiv="${meta.httpEquiv}"]`);
      if (!existingMeta) {
        const metaTag = document.createElement('meta');
        metaTag.httpEquiv = meta.httpEquiv;
        metaTag.content = meta.content;
        document.head.appendChild(metaTag);
      }
    });
    
    // Add security event listener for potential XSS attempts
    const handleSecurityEvent = (event: Event) => {
      if (event.type === 'error') {
        const errorEvent = event as ErrorEvent;
        if (errorEvent.message?.includes('script') || errorEvent.message?.includes('unsafe')) {
          console.warn('Potential security event detected:', errorEvent.message);
        }
      }
    };
    
    window.addEventListener('error', handleSecurityEvent);
    
    return () => {
      window.removeEventListener('error', handleSecurityEvent);
    };
  }, []);

  return null;
};