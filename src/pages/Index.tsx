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

const Index = () => {
  // Keep track history updated
  useTrackHistoryUpdater();

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <SEO />
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
  );
};

export default Index;
