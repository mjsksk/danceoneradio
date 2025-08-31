import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PopupPlayerButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const PopupPlayerButton = ({ 
  variant = "outline", 
  size = "sm", 
  className = "" 
}: PopupPlayerButtonProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const { toast } = useToast();

  const openPopupPlayer = () => {
    setIsOpening(true);
    
    try {
      // Calculate center position with fixed ratio for optimal fit
      const width = 420;
      const height = 580;
      const left = Math.round((window.screen.width - width) / 2);
      const top = Math.round((window.screen.height - height) / 2);
      
      // Create popup URL with parameters
      const popupUrl = `${window.location.origin}/player?radio_player=4663&index=0`;
      
      // Open popup window
      const popup = window.open(
        popupUrl,
        'DanceOneRadioPlayer',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`
      );
      
      if (popup) {
        // Focus the popup window
        popup.focus();
        
        toast({
          title: "Player Opened",
          description: "The radio player opened in a new window.",
        });
      } else {
        throw new Error('Popup blocked');
      }
    } catch (error) {
      console.error('Error opening popup player:', error);
      
      toast({
        title: "Error Opening Player",
        description: "Please allow popups for this site and try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsOpening(false), 1000);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={openPopupPlayer}
      disabled={isOpening}
      className={`gap-2 ${className}`}
      title="Open player in popup window"
    >
      <ExternalLink className="w-4 h-4" />
      {isOpening ? 'Opening...' : 'Popup Player'}
    </Button>
  );
};

export default PopupPlayerButton;