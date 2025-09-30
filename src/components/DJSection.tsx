import { Button } from '@/components/ui/button';
import { Instagram, X, Music, Calendar } from 'lucide-react';
const DJSection = () => {
  const djs = [{
    id: 1,
    name: "DJ Pulse",
    role: "Resident DJ",
    genre: "Progressive House",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face",
    bio: "Pioneer of progressive house with over 10 years in the scene",
    socials: {
      instagram: "@djpulse",
      twitter: "@djpulse_music"
    },
    nextShow: "Saturday 5PM PST"
  }, {
    id: 2,
    name: "Ivan Samel",
    role: "Sound Engineer",
    genre: "EQ Wave Magician",
    subtitle: "Creator of the best sounding experience",
    image: "/lovable-uploads/ivan-samel.jpg",
    bio: "",
    socials: {
      instagram: "",
      twitter: ""
    },
    nextShow: "SOUNDING 24/7"
  }, {
    id: 3,
    name: "DJ Cosmos",
    role: "Deep House Explorer",
    genre: "Deep House",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Journey through cosmic soundscapes and deep grooves",
    socials: {
      instagram: "@djcosmos",
      twitter: "@cosmos_deep"
    },
    nextShow: "Sunday 7PM PST"
  }, {
    id: 4,
    name: "Mario",
    role: "Future Dance Anthems Host",
    genre: "Electronic Dance Music",
    image: "/lovable-uploads/f807b27f-9eaf-4d20-b3f5-4bad24538a4e.png",
    bio: "Host of Future Dance Anthems, bringing you the latest electronic music",
    socials: {
      instagram: "@mario",
      twitter: "@mario_dance"
    },
    nextShow: "Friday 5PM PST"
  }];
  return <section id="djs" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-['Orbitron'] font-bold mb-6">
            <span className="text-neon">D1R</span>{" "}
            <span className="text-neon-purple">TEAM</span>
          </h2>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {djs.map((dj, index) => <div key={dj.id} className="card-cyber p-6 text-center group animate-fade-in" style={{
          animationDelay: `${index * 0.1}s`
        }}>
              {/* DJ Photo */}
              <div className="relative mb-6">
                <div className="dj-photo mx-auto rounded-full overflow-hidden border-2 border-primary/50 group-hover:border-primary transition-all duration-300 w-32 h-32 flex items-center justify-center bg-background">
                  {dj.image ? (
                    <img 
                      src={dj.image.includes('unsplash') ? dj.image.replace('w=400&h=400', 'w=128&h=128') : dj.image} 
                      alt={dj.name} 
                      className="group-hover:scale-110 transition-transform duration-300" 
                      loading="lazy"
                      width="128"
                      height="128"
                    />
                  ) : null}
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-glow-pulse">
                  <Music className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>

              {/* DJ Info */}
              <div className="mb-6">
                <h3 className="text-xl font-['Orbitron'] font-bold text-primary mb-2">
                  {dj.name}
                </h3>
                <p className="text-accent font-['Rajdhani'] font-medium mb-2">
                  {dj.role}
                </p>
                <p className="text-sm text-muted-foreground font-['Rajdhani'] mb-1">
                  {dj.genre}
                </p>
                {dj.subtitle && (
                  <p className="text-sm text-muted-foreground font-['Rajdhani'] mb-3">
                    {dj.subtitle}
                  </p>
                )}
                <p className="text-xs text-muted-foreground font-['Rajdhani'] leading-relaxed">
                  {dj.bio}
                </p>
              </div>

              {/* Next Show */}
              <div className="mb-6 p-3 bg-secondary/50 rounded-lg border border-primary/20">
                <div className="flex items-center justify-center text-xs text-muted-foreground mb-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {dj.nextShow === "SOUNDING 24/7" ? "SOUNDING 24/7" : "NEXT SHOW"}
                </div>
                {dj.nextShow && dj.nextShow !== "SOUNDING 24/7" && (
                  <p className="text-sm font-['Rajdhani'] font-semibold text-primary">
                    {dj.nextShow}
                  </p>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/20">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/20">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Follow Button */}
              
            </div>)}
        </div>

        {/* Join DJ Team CTA */}
        <div className="text-center mt-16">
          
        </div>
      </div>
    </section>;
};
export default DJSection;