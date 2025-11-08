import { Button } from '@/components/ui/button';
import { Play, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const PodcastSection = () => {
  const episodes = [
    { id: 394, date: 'NOV 15 • 1H 33M', title: 'Future Dance Anthems with Mario 394', link: '/episode/394' },
    { id: 393, date: 'NOV 1 • 1H 49M', title: 'Future Dance Anthems with Mario 393', link: '/episode/393' },
    { id: 387, date: 'FRI • 1H 5M', title: 'Future Dance Anthems with Mario 387' },
    { id: 386, date: 'JUL 19 • 59M', title: 'Future Dance Anthems with Mario 386' },
    { id: 385, date: 'JUL 13 • 1H 5M', title: 'Future Dance Anthems with Mario 385' },
    { id: 384, date: 'JUN 28 • 1H 3M', title: 'Future Dance Anthems with Mario 384' },
  ];

  return (
    <section className="py-16 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-background/20 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-['Orbitron'] font-bold text-primary mb-1">
                  Podcasts
                </h3>
                <p className="text-muted-foreground font-['Rajdhani']">
                  Future Dance Anthems... Dance anthems that rule the dance and electronic scene
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {episodes.map((episode, index) => {
                const content = (
                  <>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground font-['Rajdhani'] mb-1">
                        {episode.date}
                      </div>
                      <div className="text-sm text-foreground font-['Rajdhani'] group-hover:text-primary transition-colors">
                        {episode.title}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </>
                );

                return episode.link ? (
                  <Link 
                    key={episode.id}
                    to={episode.link}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors group"
                  >
                    {content}
                  </Link>
                ) : (
                  <div 
                    key={episode.id}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors group"
                  >
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button className="btn-cyber flex-1">
                <Play className="w-4 h-4 mr-2" />
                Latest Episode
              </Button>
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                <ExternalLink className="w-4 h-4 mr-2" />
                See More Episodes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PodcastSection;