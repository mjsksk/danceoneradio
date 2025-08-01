import { Button } from '@/components/ui/button';
import { Clock, Calendar, User, Play } from 'lucide-react';

const ShowsSection = () => {
  const shows = [
    {
      id: 1,
      title: "Progressive Waves",
      dj: "DJ Pulse",
      time: "Every Friday 5PM PST",
      duration: "1 Hour",
      genre: "Progressive House",
      status: "live",
      description: "Brand new music featured with exclusives"
    },
    {
      id: 2,
      title: "Cyber Nights",
      dj: "DJ Neon",
      time: "Saturday 9PM PST",
      duration: "2 Hours",
      genre: "Cyberpunk / Synthwave",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Deep Space",
      dj: "DJ Cosmos",
      time: "Sunday 7PM PST",
      duration: "90 Minutes",
      genre: "Deep House",
      status: "upcoming"
    },
    {
      id: 4,
      title: "Trance Portal",
      dj: "DJ Aurora",
      time: "Monday 8PM PST",
      duration: "2 Hours",
      genre: "Trance",
      status: "scheduled"
    }
  ];

  return (
    <section id="shows" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-['Orbitron'] font-bold mb-6">
            <span className="text-neon">LIVE</span>{" "}
            <span className="text-neon-purple">SHOWS</span>
          </h2>
          <p className="text-xl text-muted-foreground font-['Rajdhani'] max-w-2xl mx-auto">
            Biweekly rebranded episodes featuring the latest in electronic dance music
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {shows.map((show, index) => (
            <div
              key={show.id}
              className="card-cyber p-6 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-['Orbitron'] font-semibold uppercase tracking-wider ${
                    show.status === 'live'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : show.status === 'upcoming'
                      ? 'bg-primary/20 text-primary border border-primary/50'
                      : 'bg-muted/20 text-muted-foreground border border-muted/50'
                  }`}
                >
                  {show.status === 'live' && '🔴 '}{show.status}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary hover:bg-primary/20"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>

              {/* Show Info */}
              <div className="mb-4">
                <h3 className="text-2xl font-['Orbitron'] font-bold text-primary mb-2">
                  {show.title}
                </h3>
                <p className="text-lg text-accent font-['Rajdhani'] font-medium mb-2">
                  {show.genre}
                </p>
                {show.description && (
                  <p className="text-muted-foreground font-['Rajdhani'] mb-3">
                    {show.description}
                  </p>
                )}
              </div>

              {/* Schedule Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-muted-foreground">
                  <User className="w-4 h-4 mr-3 text-primary" />
                  <span className="font-['Rajdhani']">{show.dj}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-3 text-primary" />
                  <span className="font-['Rajdhani']">{show.time}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-3 text-primary" />
                  <span className="font-['Rajdhani']">{show.duration}</span>
                </div>
              </div>

              {/* Audio Wave Visualization */}
              <div className="flex items-center justify-center space-x-1 mb-4">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      show.status === 'live' 
                        ? 'bg-primary wave-animation' 
                        : 'bg-muted'
                    }`}
                    style={{
                      height: `${8 + Math.random() * 16}px`,
                      animationDelay: show.status === 'live' ? `${i * 0.1}s` : '0s'
                    }}
                  />
                ))}
              </div>

              {/* Action Button */}
              <Button 
                className={`w-full ${
                  show.status === 'live' 
                    ? 'btn-cyber animate-glow-pulse' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
                disabled={show.status === 'scheduled'}
              >
                {show.status === 'live' ? 'LISTEN NOW' : 
                 show.status === 'upcoming' ? 'SET REMINDER' : 
                 'COMING SOON'}
              </Button>
            </div>
          ))}
        </div>

        {/* View All Shows Button */}
        <div className="text-center mt-12">
          <Button className="btn-cyber" size="lg">
            View Full Schedule
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ShowsSection;