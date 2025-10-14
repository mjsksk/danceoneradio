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
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background/98 to-background/95 backdrop-blur-xl border-t-2 border-primary/40 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-['Orbitron'] font-bold text-primary mb-3 flex items-center gap-2">
                🍪 We Value Your Privacy
              </h3>
              <p className="text-base text-foreground/90 font-['Rajdhani'] leading-relaxed mb-2">
                We use cookies to enhance your experience, analyze site traffic, and serve personalized content.
              </p>
              <p className="text-sm text-primary/80 font-['Rajdhani'] font-semibold">
                ✨ Accepting cookies helps keep Dance One Radio free and supports our community!
              </p>
              <a href="/privacy" className="text-xs text-muted-foreground hover:text-primary underline mt-2 inline-block font-['Rajdhani']">
                Learn more in our Privacy Policy →
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:min-w-[400px]">
              <Button
                onClick={handleAcceptAll}
                size="lg"
                className="btn-cyber whitespace-nowrap text-lg font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
              >
                ✓ Accept All Cookies
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={handleRejectNonEssential}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10 whitespace-nowrap flex-1"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10 whitespace-nowrap flex-1"
                >
                  Customize
                </Button>
              </div>
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
