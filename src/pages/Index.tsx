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
import { ShaderAnimation } from '@/components/ui/shader-lines';

const Index = () => {
  // Keep track history updated
  useTrackHistoryUpdater();

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden relative">
      {/* Shader Animation Background */}
      <div className="fixed inset-0 z-0 w-screen h-screen pointer-events-none">
        <ShaderAnimation />
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10">
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
    </div>
  );
};

export default Index;
