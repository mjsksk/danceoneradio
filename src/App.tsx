import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import FloatingPlayer from "@/components/FloatingPlayer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BackToTop } from "@/components/BackToTop";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import NewYearBanner from "@/components/NewYearBanner";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

const VisitorTracker = () => {
  useVisitorTracking();
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AudioPlayerProvider>
          <Toaster />
          <Sonner />
          <CookieConsent />
          <BrowserRouter>
            <ErrorBoundary>
              <ReadingProgressBar />
              <ScrollToTop />
              <VisitorTracker />
              <NewYearBanner />
              <div className="pb-20">
                <AnimatedRoutes />
              </div>
              <BackToTop />
              <NotificationPrompt />
              <FloatingPlayer />
            </ErrorBoundary>
          </BrowserRouter>
        </AudioPlayerProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
