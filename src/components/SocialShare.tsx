import { Share2, Facebook, MessageCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getShareUrls } from '@/utils/shareUrls';

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


  // Desktop OS share targets (notably Facebook) can sometimes turn rich share payloads
  // into a photo-style post where the preview isn’t a clickable link.
  // Detect “mobile” *strictly*; otherwise treat it as desktop and prefer URL-only.
  const isNativeShareEnvironment = (): boolean => {
    try {
      if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
      if (typeof navigator.share !== 'function') return false;

      const uaDataMobile = (navigator as unknown as { userAgentData?: { mobile?: boolean } })
        ?.userAgentData?.mobile;
      if (typeof uaDataMobile === 'boolean') return uaDataMobile;

      const uaLooksMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      // Reduce false positives on desktop: require a coarse pointer (touch-like).
      const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;

      return uaLooksMobile && coarsePointer;
    } catch {
      return false;
    }
  };

  // Native share is *only* allowed when we’re confident this is a real mobile UA.
  // (Desktop Web Share is the main source of “looks like a link, but isn’t clickable” Facebook posts.)
  const allowNativeShare = isNativeShareEnvironment();

  // CRITICAL: when the app is opened on a Lovable preview domain, that URL is not publicly accessible
  // (it shows a Lovable login screen). Always build share URLs against the public/canonical domain.
  const publicSiteOrigin = (import.meta.env as unknown as Record<string, string | undefined>)
    .VITE_PUBLIC_SITE_ORIGIN;

  const { socialShareUrl, canonicalUrl } = getShareUrls(url, publicSiteOrigin);

  // Facebook Pages sometimes convert link previews into photo-style posts.
  // FB may also hide/remove the "pasted" URL from the post body after the preview loads.
  // To preserve a clickable link in the final post, include a *second* URL variant that
  // usually survives the auto-hide behavior (e.g. canonical + query param).
  const canonicalUrlForFacebook = `${canonicalUrl}?src=fbpage`;
  const canonicalUrlBareForFacebook = canonicalUrl.replace(/^https?:\/\//, '');

  // Facebook Pages sometimes convert link previews into photo-style posts.
  // To preserve a clickable link, include a *different* short URL that won't get auto-hidden.
  const shortEpisodeUrlForFacebook = (() => {
    try {
      const origin = new URL(canonicalUrl).origin;
      const match = canonicalUrl.match(/\/episode\/(\d+)(?:\/|$)/);
      if (!match) return null;
      return `${origin}/e/${match[1]}`;
    } catch {
      return null;
    }
  })();

  const facebookPasteText = `${socialShareUrl}\n${shortEpisodeUrlForFacebook ? `${shortEpisodeUrlForFacebook}\n` : ''}${canonicalUrlForFacebook}\n${canonicalUrlBareForFacebook}\n\n${title}\n\n${description}`;

  const richShareData: ShareData = {
    title,
    // Some share targets (including Facebook) may ignore the `url` field and only use `text`.
    // Always include a plain URL in `text` so the resulting post is clickable.
    // Put the URL FIRST: some targets only linkify the first URL they see.
    text: facebookPasteText,
    url: socialShareUrl
  };

  const getSystemShareData = (): ShareData => {
    // Desktop (or anything not confidently mobile/touch): DO NOT attempt native share.
    // It can produce a card that looks right but isn't actually clickable on Facebook.
    if (!allowNativeShare) return { url: socialShareUrl };

    // Mobile/touch: keep rich payload
    return richShareData;
  };

  const handleNativeShare = async () => {
    try {
      if (!allowNativeShare) {
        // Defensive fallback in case "More…" is somehow reachable.
        await navigator.clipboard.writeText(socialShareUrl);
        toast({
          title: 'Social link copied!',
          description: 'On desktop, use the Facebook button or paste this Social Link into Facebook for a clickable post.',
        });
        return;
      }

      const systemShareData = getSystemShareData();

      if (navigator.share && (!navigator.canShare || navigator.canShare(systemShareData))) {
        await navigator.share(systemShareData);
      } else {
        // Fallback: copy URL-first for best linkification on Facebook.
        await navigator.clipboard.writeText(facebookPasteText);
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

  // Copies the crawler-friendly .html URL + an explicit canonical URL line (best for Facebook Pages)
  const handleCopySocialPreviewLink = async () => {
    try {
      await navigator.clipboard.writeText(facebookPasteText);
        toast({
          title: "Facebook paste text copied!",
          description:
            "Paste into a Facebook Page post. If the preview card becomes non-clickable, use the /e/### line — it stays clickable and still opens the episode.",
        });
    } catch (error) {
      console.error('Failed to copy social preview link:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy social preview link to clipboard.",
        variant: "destructive"
      });
    }
  };


  // Social platforms use the root-level .html URL for proper OG previews
  const handleFacebookShare = () => {
    // Use sharer.php - it works regardless of user's Platform settings
    // (Feed Dialog requires Platform enabled, which many users disable)
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
        {allowNativeShare && (
          <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
            <Share2 className="w-4 h-4 mr-2" />
            Share via other apps
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopySocialPreviewLink} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Social Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShare;