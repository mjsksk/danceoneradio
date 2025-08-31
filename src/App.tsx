import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shows from "./pages/Shows";
import Privacy from "./pages/Privacy";
import Love from "./pages/Love";
import Dmca from "./pages/Dmca";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PopupPlayer from "./components/PopupPlayer";
import { usePopupPlayer } from "./hooks/usePopupPlayer";
import { PopupPlayerContext } from "./contexts/PopupPlayerContext";

const queryClient = new QueryClient();

const App = () => {
  const { isOpen, openPlayer, closePlayer, togglePlayer } = usePopupPlayer();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PopupPlayerContext.Provider value={{ isOpen, openPlayer, closePlayer, togglePlayer }}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shows" element={<Shows />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/love" element={<Love />} />
              <Route path="/dmca" element={<Dmca />} />
              <Route path="/contact" element={<Contact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* Global Popup Player */}
            <PopupPlayer isOpen={isOpen} onClose={closePlayer} />
          </BrowserRouter>
        </PopupPlayerContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
