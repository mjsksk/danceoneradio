import PodcastPreview from './PodcastPreview';
import ScrollingBanner from './ScrollingBanner';

const ShowsSection = () => {
  return <section id="shows" className="py-20 relative">
      {/* Scrolling Title Banner */}
      <ScrollingBanner />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-['Orbitron'] font-bold mb-6">
            <span className="text-neon">LIVE</span>{" "}
            <span className="text-neon-purple">SHOWS</span>
          </h2>
          <p className="text-xl text-muted-foreground font-['Rajdhani'] max-w-2xl mx-auto">
            Future Dance Anthems with Mario - Weekly episodes featuring the latest in electronic dance music
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <PodcastPreview />
        </div>
      </div>
    </section>;
};
export default ShowsSection;