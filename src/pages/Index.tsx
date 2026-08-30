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
          title="Dance One Radio — Electronic Dance Music Radio Station Streaming Live 24/7"
          description="Dance One Radio is a live electronic dance music radio station streaming free 24/7 — house, trance, techno, progressive and EDM mixes, weekly DJ shows and full episode tracklists."
          keywords="dance music radio, electronic dance music radio, live dance radio station, edm radio online, free electronic music stream, house music radio, trance radio, techno radio"
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
