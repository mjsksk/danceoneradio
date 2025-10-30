import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import { CookieConsent } from "@/components/CookieConsent";
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
import DesktopPlayer from "./pages/DesktopPlayer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SecurityHeaders />
      <Toaster />
      <Sonner />
      <CookieConsent />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
          <Route path="/desktop" element={<DesktopPlayer />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
