import { Share2, Facebook, X, MessageCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
}

const SocialShare = ({ 
  url = window.location.href, 
  title = "Future Dance Anthems with Mario - Dance One Radio",
  description = "Dance anthems that consistently rule the dance and electronic scene.",
  className = ""
}: SocialShareProps) => {
  const { toast } = useToast();

  const shareData = {
    title,
    text: description,
    url
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${title}\n\n${description}\n\n${url}`);
        toast({
          title: "Link copied!",
          description: "The page link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
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

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
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
          <X className="w-4 h-4 mr-2" />
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