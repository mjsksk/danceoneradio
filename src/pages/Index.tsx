import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ShowsSection from '@/components/ShowsSection';
import DJSection from '@/components/DJSection';
import TracksSection from '@/components/TracksSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <main>
        <HeroSection />
        <ShowsSection />
        <DJSection />
        <TracksSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
