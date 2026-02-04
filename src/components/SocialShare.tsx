import { Share2, Facebook, MessageCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  image?: string;
  className?: string;
}

const SocialShare = ({ 
  url, 
  title,
  description,
  image,
  className = ""
}: SocialShareProps) => {
  const { toast } = useToast();

  // Convert route path to root-level share filename
  // /episode/402 → share-episode-402.html
  // /about → share-about.html
  // / → share-home.html
  const routeToShareFilename = (pathname: string): string => {
    if (pathname === '/') return 'share-home.html';
    return `share${pathname.replace(/\//g, '-')}.html`;
  };

  // Get the social preview URL (root-level .html for crawlers)
  const getSocialShareUrl = () => {
    try {
      const u = new URL(url);
      const pathname = u.pathname !== '/' ? u.pathname.replace(/\/+$/, '') : '/';
      const shareFilename = routeToShareFilename(pathname);
      return `${u.origin}/${shareFilename}`;
    } catch {
      return url;
    }
  };

  // Get the canonical URL (clean URL for humans)
  const getCanonicalUrl = () => {
    try {
      const u = new URL(url);
      const pathname = u.pathname !== '/' ? u.pathname.replace(/\/+$/, '') : '/';
      return `${u.origin}${pathname}`;
    } catch {
      return url;
    }
  };

  const socialShareUrl = getSocialShareUrl();
  const canonicalUrl = getCanonicalUrl();

  const shareData = {
    title,
    text: description,
    url: socialShareUrl
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy canonical URL to clipboard
        await navigator.clipboard.writeText(`${title}\n\n${description}\n\n${canonicalUrl}`);
        toast({
          title: "Link copied!",
          description: "The page link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  // Copy Link uses the clean canonical URL (no .html)
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      toast({
        title: "Link copied!",
        description: "The page link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Social platforms use the root-level .html URL for proper OG previews
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(socialShareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(socialShareUrl)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${socialShareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`hover:scale-105 transition-all duration-200 ${className}`}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare} className="cursor-pointer">
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
          </svg>
          X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppShare} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShare;