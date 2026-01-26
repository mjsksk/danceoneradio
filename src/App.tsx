import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import FloatingPlayer from "@/components/FloatingPlayer";
import { ScrollToTop } from "@/components/ScrollToTop";
import NewYearBanner from "@/components/NewYearBanner";
import Index from "./pages/Index";
import Shows from "./pages/Shows";
import Gallery from "./pages/Gallery";
import LoveParade2005 from "./pages/LoveParade2005";
import LoveParade2006 from "./pages/LoveParade2006";
import Downloads from "./pages/Downloads";
import Privacy from "./pages/Privacy";
import Love from "./pages/Love";
import Dmca from "./pages/Dmca";
import Contact from "./pages/Contact";
import PlayerPage from "./pages/PlayerPage";
import Episode389 from "./pages/Episode389";
import Episode390 from "./pages/Episode390";
import Episode391 from "./pages/Episode391";
import Episode392 from "./pages/Episode392";
import Episode393 from "./pages/Episode393";
import Episode394 from "./pages/Episode394";
import Episode395 from "./pages/Episode395";
import Episode396 from "./pages/Episode396";
import Episode397 from "./pages/Episode397";
import Episode398 from "./pages/Episode398";
import Episode399 from "./pages/Episode399";
import Episode400 from "./pages/Episode400";
import Episode401 from "./pages/Episode401";
import Episode402 from "./pages/Episode402";
import News from "./pages/News";
import NewsTopStories from "./pages/NewsTopStories";
import NewsArtistsReleases from "./pages/NewsArtistsReleases";
import NewsFestivalsEvents from "./pages/NewsFestivalsEvents";
import NewsIndustryCulture from "./pages/NewsIndustryCulture";
import About from "./pages/About";
import Admin from "./pages/Admin";
import DesktopPlayer from "./pages/DesktopPlayer";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

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
              <ScrollToTop />
              <NewYearBanner />
              <div className="pb-20">
                <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/shows" element={<Shows />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/love-parade-2005" element={<LoveParade2005 />} />
                <Route path="/gallery/love-parade-2006" element={<LoveParade2006 />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/love" element={<Love />} />
                <Route path="/dmca" element={<Dmca />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/player" element={<PlayerPage />} />
                <Route path="/episode/389" element={<Episode389 />} />
                <Route path="/episode/390" element={<Episode390 />} />
                <Route path="/episode/391" element={<Episode391 />} />
                <Route path="/episode/392" element={<Episode392 />} />
                <Route path="/episode/393" element={<Episode393 />} />
                <Route path="/episode/394" element={<Episode394 />} />
                <Route path="/episode/395" element={<Episode395 />} />
                <Route path="/episode/396" element={<Episode396 />} />
                <Route path="/episode/397" element={<Episode397 />} />
                <Route path="/episode/398" element={<Episode398 />} />
                <Route path="/episode/399" element={<Episode399 />} />
                <Route path="/episode/400" element={<Episode400 />} />
                <Route path="/episode/401" element={<Episode401 />} />
                <Route path="/episode/402" element={<Episode402 />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/top-stories" element={<NewsTopStories />} />
                <Route path="/news/artists-releases" element={<NewsArtistsReleases />} />
                <Route path="/news/festivals-events" element={<NewsFestivalsEvents />} />
                <Route path="/news/industry-culture" element={<NewsIndustryCulture />} />
                <Route path="/admin" element={<AdminRoute requiredRole="admin"><Admin /></AdminRoute>} />
                <Route path="/desktop" element={<DesktopPlayer />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <FloatingPlayer />
            </ErrorBoundary>
          </BrowserRouter>
        </AudioPlayerProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
