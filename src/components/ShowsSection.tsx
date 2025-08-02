import { Button } from '@/components/ui/button';
import { Clock, Calendar, User, Play } from 'lucide-react';

const ShowsSection = () => {
  return (
    <section id="shows" className="py-20 relative">
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
          <div className="card-cyber p-6">
            <iframe 
              allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" 
              frameBorder="0" 
              height="450" 
              style={{width:'100%', maxWidth:'2500px', overflow:'hidden', borderRadius:'10px'}}
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" 
              src="https://embed.podcasts.apple.com/us/podcast/future-dance-anthems-with-mario/id1439656478"
              title="Future Dance Anthems with Mario Podcast"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowsSection;