import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ShowsSection from '@/components/ShowsSection';
import TracksSection from '@/components/TracksSection';
import ContinueListening from '@/components/ContinueListening';
import NewsPreview from '@/components/NewsPreview';
import GoogleAds from '@/components/GoogleAds';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { AD_SLOTS } from '@/config/adSlots';
import { useTrackHistoryUpdater } from '@/hooks/useTrackHistoryUpdater';
import { WavyBackground } from '@/components/ui/wavy-background';

const Index = () => {
  useTrackHistoryUpdater();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        <SEO
          title="Dance One Radio | 24/7 Live Electronic Music & DJ Mixes"
          description="Dance One Radio — commercial-free dance radio streaming house, techno, trance and EDM 24/7, with live DJ mixes, weekly shows and full episode tracklists."

          keywords="dance music radio, live dance radio, electronic music streaming, edm radio online, free dance radio station, house music radio, trance radio, techno radio, internet radio, live dj sets"
        />

        <Navigation />
        <main className="flex-grow">
          <HeroSection />
          <ContinueListening />
          <ShowsSection />
          <NewsPreview />
          <GoogleAds slot={AD_SLOTS.HEADER} format="auto" />
          <GoogleAds slot={AD_SLOTS.IN_CONTENT} format="fluid" layout="in-article" />
          <TracksSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
