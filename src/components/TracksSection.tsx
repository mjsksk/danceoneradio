import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Heart, Share2, Clock } from 'lucide-react';

const TracksSection = () => {
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);

  const tracks = [
    {
      id: 1,
      title: "Digital Dreams",
      artist: "DJ Pulse",
      duration: "6:42",
      genre: "Progressive House",
      releaseDate: "2024-01-15",
      waveform: [12, 24, 18, 32, 28, 15, 22, 35, 28, 16, 20, 30],
      likes: 1247,
      downloads: 532
    },
    {
      id: 2,
      title: "Neon Nights",
      artist: "DJ Neon",
      duration: "5:38",
      genre: "Cyberpunk",
      releaseDate: "2024-01-12",
      waveform: [20, 15, 28, 22, 35, 18, 25, 32, 20, 24, 18, 28],
      likes: 892,
      downloads: 345
    },
    {
      id: 3,
      title: "Deep Space Journey",
      artist: "DJ Cosmos",
      duration: "7:15",
      genre: "Deep House",
      releaseDate: "2024-01-10",
      waveform: [15, 28, 22, 18, 25, 32, 20, 35, 28, 16, 22, 30],
      likes: 1156,
      downloads: 478
    },
    {
      id: 4,
      title: "Aurora Rising",
      artist: "DJ Aurora",
      duration: "8:22",
      genre: "Trance",
      releaseDate: "2024-01-08",
      waveform: [25, 32, 20, 28, 35, 18, 22, 30, 25, 20, 28, 32],
      likes: 1523,
      downloads: 687
    }
  ];

  const handlePlayPause = (trackId: number) => {
    if (playingTrack === trackId) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(trackId);
    }
  };

  return (
    <section id="tracks" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-['Orbitron'] font-bold mb-6">
            <span className="text-neon">LATEST</span>{" "}
            <span className="text-neon-purple">TRACKS</span>
          </h2>
          <p className="text-xl text-muted-foreground font-['Rajdhani'] max-w-2xl mx-auto">
            Exclusive releases and featured tracks from our DJ collective
          </p>
        </div>

        <div className="space-y-6">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="card-cyber p-6 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Play Button & Track Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <Button
                    onClick={() => handlePlayPause(track.id)}
                    className={`w-16 h-16 rounded-full ${
                      playingTrack === track.id
                        ? 'bg-primary text-primary-foreground animate-glow-pulse'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {playingTrack === track.id ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>

                  <div className="flex-1">
                    <h3 className="text-xl font-['Orbitron'] font-bold text-primary mb-1">
                      {track.title}
                    </h3>
                    <p className="text-lg text-accent font-['Rajdhani'] font-medium mb-1">
                      {track.artist}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground font-['Rajdhani']">
                      <span>{track.genre}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {track.duration}
                      </div>
                      <span>•</span>
                      <span>{track.releaseDate}</span>
                    </div>
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="flex items-center justify-center space-x-1 flex-1">
                  {track.waveform.map((height, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full transition-all duration-300 ${
                        playingTrack === track.id
                          ? 'bg-primary wave-animation'
                          : 'bg-muted hover:bg-primary/50'
                      }`}
                      style={{
                        height: `${height * 2}px`,
                        animationDelay: playingTrack === track.id ? `${i * 0.1}s` : '0s'
                      }}
                    />
                  ))}
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="flex items-center space-x-1 text-muted-foreground mb-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-['Rajdhani']">{track.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-['Rajdhani']">{track.downloads}</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-400 hover:bg-red-400/20"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/20"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/20"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More Tracks Button */}
        <div className="text-center mt-12">
          <Button className="btn-cyber" size="lg">
            Browse All Tracks
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TracksSection;