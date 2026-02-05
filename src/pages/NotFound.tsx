import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Music, Download, Heart, Mail, Radio, Headphones } from "lucide-react";
import SEO from "@/components/SEO";
import danceOneLogo from "@/assets/dance-one-logo.png";

const NotFound = () => {
  const location = useLocation();
  const [funnyMessage, setFunnyMessage] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{name: string, path: string, icon: any}>>([]);

  const funnyMessages = [
    "Looks like this track got lost in the mix! 🎧",
    "This page is more elusive than a perfect beat drop! 🎵",
    "Houston, we have a problem... this page is off the air! 📻",
    "This URL is dancing to its own beat... in the void! 💃",
    "Seems like this page took a wrong turn at the crossfader! 🎚️",
    "This page is currently in the DJ booth of nonexistence! 🎤",
    "Error 404: Page not found, but the beat goes on! 🎶",
    "This link is more broken than my favorite headphones! 🎧",
  ];

  const allPages = [
    { name: "Home", path: "/", icon: Home },
    { name: "Shows", path: "/shows", icon: Radio },
    { name: "Downloads", path: "/downloads", icon: Download },
    { name: "Love", path: "/love", icon: Heart },
    { name: "Contact", path: "/contact", icon: Mail },
    { name: "Player", path: "/player", icon: Headphones },
  ];

  useEffect(() => {
    // If someone hits an extensionless share bridge URL, redirect them to the real static
    // share page (the .html file is what social scrapers can read on Lovable hosting).
    const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';

    const shareEpisode = normalizedPath.match(/^\/share-episode-(\d+)$/);
    if (shareEpisode) {
      window.location.replace(`/share-episode-${shareEpisode[1]}.html`);
      return;
    }

    const legacyShareEpisode = normalizedPath.match(/^\/share\/episode\/(\d+)$/);
    if (legacyShareEpisode) {
      window.location.replace(`/share-episode-${legacyShareEpisode[1]}.html`);
      return;
    }

    if (normalizedPath === '/share-home') {
      window.location.replace('/share-home.html');
      return;
    }

    // Set proper HTTP status code for SEO
    if (typeof window !== 'undefined' && window.history) {
      document.title = '404 - Page Not Found | Dance One Radio';
    }
    
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Set random funny message
    setFunnyMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);

    // Analyze path and provide intelligent suggestions
    const path = location.pathname.toLowerCase();
    let smartSuggestions = [...allPages];

    if (path.includes('show') || path.includes('episode')) {
      smartSuggestions = [
        { name: "Shows", path: "/shows", icon: Radio },
        { name: "Episode 389", path: "/episode/389", icon: Music },
        ...allPages.filter(p => p.path !== "/shows")
      ];
    } else if (path.includes('download') || path.includes('app')) {
      smartSuggestions = [
        { name: "Downloads", path: "/downloads", icon: Download },
        ...allPages.filter(p => p.path !== "/downloads")
      ];
    } else if (path.includes('love') || path.includes('favorite')) {
      smartSuggestions = [
        { name: "Love", path: "/love", icon: Heart },
        ...allPages.filter(p => p.path !== "/love")
      ];
    } else if (path.includes('contact') || path.includes('about')) {
      smartSuggestions = [
        { name: "Contact", path: "/contact", icon: Mail },
        ...allPages.filter(p => p.path !== "/contact")
      ];
    } else if (path.includes('play') || path.includes('listen')) {
      smartSuggestions = [
        { name: "Player", path: "/player", icon: Headphones },
        { name: "Home", path: "/", icon: Home },
        ...allPages.filter(p => p.path !== "/player" && p.path !== "/")
      ];
    }

    setSuggestions(smartSuggestions.slice(0, 6));
  }, [location.pathname]);

  return (
    <>
      <SEO 
        title="404 - Page Not Found | Dance One Radio"
        description="The page you're looking for doesn't exist. Tune into Dance One Radio's main pages or contact our DJ for help."
        url={`https://danceoneradio.com${location.pathname}`}
      />
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src={danceOneLogo} 
            alt="Dance One Radio" 
            className="w-32 h-32 object-contain opacity-80"
          />
        </div>

        {/* 404 Text with Neon Effect */}
        <div className="mb-6">
          <h1 className="text-neon text-8xl md:text-9xl font-bold mb-4 animate-pulse">
            404
          </h1>
          <div className="text-neon-purple text-2xl md:text-3xl font-semibold mb-2">
            OFF THE AIR
          </div>
        </div>

        {/* Funny Message */}
        <div className="card-cyber p-6 mb-8">
          <p className="text-lg md:text-xl text-foreground/90 mb-4">
            {funnyMessage}
          </p>
          <p className="text-muted-foreground">
            The page you're looking for seems to have left the building.
            <br />
            But don't worry, the music never stops at Dance One Radio!
          </p>
        </div>

        {/* Navigation Suggestions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Where would you like to tune in?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {suggestions.map((page, index) => {
              const IconComponent = page.icon;
              return (
                <Link key={page.path} to={page.path}>
                  <Button 
                    variant="outline" 
                    className="btn-cyber w-full h-16 flex flex-col items-center justify-center gap-2 text-sm"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{page.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Still can't find what you're looking for?
          </p>
          <Link to="/contact">
            <Button className="btn-cyber">
              <Mail className="w-4 h-4 mr-2" />
              Contact Our DJ
            </Button>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default NotFound;
