import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ShowsSection from '@/components/ShowsSection';
import DJSection from '@/components/DJSection';
import TracksSection from '@/components/TracksSection';
import AdSenseUnit from '@/components/AdSenseUnit';
import AdSenseAutoAds from '@/components/AdSenseAutoAds';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useTrackHistoryUpdater } from '@/hooks/useTrackHistoryUpdater';

const Index = () => {
  // Keep track history updated
  useTrackHistoryUpdater();

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <SEO />
      <AdSenseAutoAds />
      <Navigation />
      <main className="flex-grow">
        <HeroSection />
        <ShowsSection />
        <AdSenseUnit slot="6777392184" format="auto" />
        <DJSection />
        <AdSenseUnit slot="6777392184" format="fluid" layout="in-article" />
        <TracksSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
