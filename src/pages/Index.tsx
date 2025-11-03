import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ShowsSection from '@/components/ShowsSection';
import DJSection from '@/components/DJSection';
import TracksSection from '@/components/TracksSection';
import GoogleAds from '@/components/GoogleAds';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
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
        <ShowsSection />
        <GoogleAds slot="6777392184" format="auto" />
        <DJSection />
        <GoogleAds slot="6777392184" format="fluid" layout="in-article" />
        <TracksSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
