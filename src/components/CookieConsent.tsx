import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import {
  shouldShowConsent,
  acceptAll,
  rejectNonEssential,
  setConsent,
  initializeConsentScripts,
} from '@/utils/consentManager';

interface CookieConsentProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export const CookieConsent = ({ forceShow = false, onClose }: CookieConsentProps) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    functional: false,
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    // Check if we should show the consent banner
    if (forceShow || shouldShowConsent()) {
      setShowBanner(true);
    }
  }, [forceShow]);

  const handleAcceptAll = () => {
    acceptAll();
    initializeConsentScripts();
    setShowBanner(false);
    setShowCustomize(false);
    onClose?.();
  };

  const handleRejectNonEssential = () => {
    rejectNonEssential();
    setShowBanner(false);
    setShowCustomize(false);
    onClose?.();
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleSavePreferences = () => {
    setConsent(preferences);
    initializeConsentScripts();
    setShowBanner(false);
    setShowCustomize(false);
    onClose?.();
  };

  const handleCloseCustomize = () => {
    setShowCustomize(false);
    if (forceShow) {
      onClose?.();
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner - Full screen overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-2xl mx-4 bg-card/95 backdrop-blur-lg border-2 border-primary/40 rounded-lg shadow-2xl shadow-primary/20 animate-scale-in">
          <div className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-['Orbitron'] font-bold text-primary mb-3">
                🍪 Cookie Consent
              </h3>
              <p className="text-base text-foreground/90 font-['Rajdhani'] leading-relaxed">
                We use cookies to enhance your experience, analyze site traffic, and serve personalized content. 
                Accepting cookies helps keep Dance One Radio free and supports our community.
              </p>
              <a href="/privacy" className="text-sm text-primary hover:underline mt-2 inline-block font-['Rajdhani']">
                Learn more in our Privacy Policy →
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAcceptAll}
                size="lg"
                className="btn-cyber flex-1 text-lg font-bold"
              >
                ✓ Accept All
              </Button>
              <Button
                onClick={handleRejectNonEssential}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10 flex-1"
              >
                Reject Non-Essential
              </Button>
              <Button
                onClick={handleCustomize}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10 flex-1"
              >
                Customize
              </Button>
            </div>
          </div>
        </div>
      </div>


      {/* Customization Modal */}
      <Dialog open={showCustomize} onOpenChange={handleCloseCustomize}>
        <DialogContent className="sm:max-w-[600px] bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-['Orbitron'] text-primary">
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-['Rajdhani']">
              Choose which cookies you want to allow. You can change these settings at any time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Essential Cookies - Always On */}
            <div className="flex items-start justify-between space-x-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-['Orbitron'] font-semibold text-foreground">
                    Essential Cookies
                  </h4>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-['Rajdhani']">
                    Always Active
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-['Rajdhani']">
                  Required for the website to function properly. These cannot be disabled as they enable core functionality like security, network management, and basic features.
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start justify-between space-x-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="flex-1">
                <h4 className="font-['Orbitron'] font-semibold text-foreground mb-2">
                  Functional Cookies
                </h4>
                <p className="text-sm text-muted-foreground font-['Rajdhani']">
                  Enable enhanced functionality like saving your liked tracks, player preferences, and personalized features. Your experience may be limited without these.
                </p>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, functional: checked })
                }
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between space-x-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="flex-1">
                <h4 className="font-['Orbitron'] font-semibold text-foreground mb-2">
                  Analytics Cookies
                </h4>
                <p className="text-sm text-muted-foreground font-['Rajdhani']">
                  Help us understand how visitors interact with our website by collecting and reporting anonymous information. This helps us improve your experience.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, analytics: checked })
                }
              />
            </div>

            {/* Advertising Cookies */}
            <div className="flex items-start justify-between space-x-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="flex-1">
                <h4 className="font-['Orbitron'] font-semibold text-foreground mb-2">
                  Advertising Cookies
                </h4>
                <p className="text-sm text-muted-foreground font-['Rajdhani']">
                  Used to deliver relevant advertisements and support our free service. These cookies may track your browsing activity to show you personalized ads.
                </p>
              </div>
              <Switch
                checked={preferences.advertising}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, advertising: checked })
                }
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              onClick={handleCloseCustomize}
              variant="ghost"
              className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="flex-1 btn-cyber"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper component to reopen cookie settings from anywhere
export const CookieSettingsButton = () => {
  const [showConsent, setShowConsent] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowConsent(true)}
        className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm"
      >
        Cookie Settings
      </button>
      {showConsent && (
        <CookieConsent forceShow={true} onClose={() => setShowConsent(false)} />
      )}
    </>
  );
};
