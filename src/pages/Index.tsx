import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ShowsSection from '@/components/ShowsSection';
import DJSection from '@/components/DJSection';
import TracksSection from '@/components/TracksSection';
import AdSenseUnit from '@/components/AdSenseUnit';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useTrackHistoryUpdater } from '@/hooks/useTrackHistoryUpdater';

const Index = () => {
  // Keep track history updated
  useTrackHistoryUpdater();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO />
      <Navigation />
      <main>
        <HeroSection />
        <ShowsSection />
        <AdSenseUnit />
        <DJSection />
        <TracksSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
