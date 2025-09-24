import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import Index from "./pages/Index";
import Shows from "./pages/Shows";
import Gallery from "./pages/Gallery";
import Downloads from "./pages/Downloads";
import Privacy from "./pages/Privacy";
import Love from "./pages/Love";
import Dmca from "./pages/Dmca";
import Contact from "./pages/Contact";
import PlayerPage from "./pages/PlayerPage";
import Episode389 from "./pages/Episode389";
import Episode390 from "./pages/Episode390";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SecurityHeaders />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/love" element={<Love />} />
          <Route path="/dmca" element={<Dmca />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/player" element={<PlayerPage />} />
          <Route path="/episode/389" element={<Episode389 />} />
          <Route path="/episode/390" element={<Episode390 />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
