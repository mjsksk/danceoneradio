import PodcastPreview from './PodcastPreview';
const ShowsSection = () => {
  return <section id="shows" className="py-20 relative">
      {/* Scrolling Title Banner */}
      <div className="overflow-hidden bg-gradient-to-r from-neon/20 to-neon-purple/20 border-y border-neon/30 mb-12">
        <div className="animate-scroll whitespace-nowrap py-4">
          <span className="text-lg font-audiowide font-bold text-neon-purple mx-8">
            Listen to biweekly rebranded episodes on Friday at 5 PM Pacific. One hour of brand new music featured with exclusives. Download the mobile app below to get updates today.
          </span>
        </div>
      </div>
      
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