import { useParams, Link } from 'react-router-dom';
import { useTrackBySlug, useRelatedTracks, useRecentTracks } from '@/hooks/useTrackPage';
import { useNewsArticles } from '@/hooks/useNewsArticles';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Radio, ExternalLink, Share2, Clock, ArrowLeft, Disc3 } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';
import { format } from 'date-fns';

const TrackPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: track, isLoading } = useTrackBySlug(slug || '');
  const { data: relatedTracks } = useRelatedTracks(track?.artist || '', slug || '');
  const { data: recentTracks } = useRecentTracks(15);
  const { data: newsArticles } = useNewsArticles({ limit: 5 });
  const { play, isPlaying, currentStreamUrl } = useAudioPlayer();

  const isStreamPlaying = isPlaying && PRIMARY_STREAM_URLS.some(u => currentStreamUrl === u);

  const handlePlayRadio = () => {
    play(PRIMARY_STREAM_URLS[0], 'Dance One Radio - Live Stream');
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = track ? `🎵 ${track.artist} – ${track.title} | Dance One Radio` : '';
    if (navigator.share) {
      navigator.share({ title: text, url });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-32 text-center">
          <Disc3 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading track...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-['Orbitron'] font-bold text-foreground mb-4">Track Not Found</h1>
          <p className="text-muted-foreground mb-8">This track hasn't been played yet on Dance One Radio.</p>
          <Link to="/tracks">
            <Button className="btn-cyber"><ArrowLeft className="w-4 h-4 mr-2" /> Browse All Tracks</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const query = encodeURIComponent(`${track.artist} ${track.title}`);
  const affiliateLinks = [
    { label: 'Listen on Apple Music', url: `https://music.apple.com/us/search?term=${query}`, color: 'bg-pink-600 hover:bg-pink-700' },
    { label: 'Buy on Beatport', url: `https://www.beatport.com/search?q=${query}`, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Listen on Amazon', url: `https://www.amazon.com/s?k=${query}&tag=danceone-20`, color: 'bg-yellow-600 hover:bg-yellow-700' },
  ];

  // Filter news articles that might mention the artist
  const relatedNews = newsArticles?.filter(article =>
    article.title.toLowerCase().includes(track.artist.toLowerCase().split(' ')[0]) ||
    article.summary.toLowerCase().includes(track.artist.toLowerCase().split(' ')[0])
  ).slice(0, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "name": track.title,
    "byArtist": {
      "@type": "MusicGroup",
      "name": track.artist,
    },
    "url": window.location.href,
    "genre": track.genre || "Electronic",
    "inAlbum": {
      "@type": "MusicAlbum",
      "name": track.title,
    },
    "recordingOf": {
      "@type": "MusicComposition",
      "name": track.title,
    },
    "publisher": {
      "@type": "RadioStation",
      "name": "Dance One Radio",
      "url": "https://danceoneradio.com",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${track.artist} – ${track.title} | Dance One Radio`}
        description={`Listen to ${track.title} by ${track.artist} on Dance One Radio. Stream live electronic music, discover new tracks, and explore DJ sets.`}
        url={window.location.href}
        keywords={`${track.artist}, ${track.title}, electronic music, dance music, ${track.genre || 'EDM'}, radio`}
      />

      {/* MusicRecording Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Navigation />

      <main className="container mx-auto px-4 pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/tracks" className="hover:text-primary transition-colors">Tracks</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{track.artist} – {track.title}</span>
        </nav>

        {/* HEADER */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold text-foreground mb-3">
                {track.artist} – {track.title}
              </h1>
              <p className="text-lg text-muted-foreground">Listen on Dance One Radio</p>
              <div className="flex items-center gap-3 mt-4">
                {track.genre && <Badge variant="secondary" className="text-xs">{track.genre}</Badge>}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last played {format(new Date(track.played_at), 'MMM d, yyyy · h:mm a')}
                </span>
              </div>
            </div>
            <Button onClick={handleShare} variant="outline" size="sm" className="self-start md:self-auto">
              <Share2 className="w-4 h-4 mr-2" /> Share Track
            </Button>
          </div>
        </section>

        {/* LIVE PLAYER CTA */}
        <section className="card-cyber p-8 mb-12">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Radio className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-['Orbitron'] font-bold text-foreground mb-1">
                Currently streaming electronic music 24/7
              </h2>
              <p className="text-muted-foreground text-sm">
                Tune in to Dance One Radio for the best dance, house, trance, and EDM tracks.
              </p>
            </div>
            <Button
              onClick={handlePlayRadio}
              className={`btn-cyber ${isStreamPlaying ? 'animate-glow-pulse' : ''}`}
            >
              {isStreamPlaying ? '🔊 Now Playing' : '▶ Listen Live'}
            </Button>
          </div>
        </section>

        {/* TRACK CONTEXT */}
        <section className="mb-12">
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            <strong className="text-foreground">{track.title}</strong> by <strong className="text-foreground">{track.artist}</strong> is part of the global electronic music sound featured on Dance One Radio. Discover more tracks, DJ sets, and live streaming music on our platform.
          </p>
        </section>

        {/* DISCOVER / BUY SECTION */}
        <section className="mb-12">
          <h2 className="text-2xl font-['Orbitron'] font-bold text-foreground mb-6 flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" /> Discover & Buy
          </h2>
          <div className="flex flex-wrap gap-3">
            {affiliateLinks.map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
                <Button className={`${link.color} text-white`}>
                  <ExternalLink className="w-4 h-4 mr-2" /> {link.label}
                </Button>
              </a>
            ))}
          </div>
        </section>

        {/* RELATED SHOWS */}
        <section className="mb-12">
          <h2 className="text-2xl font-['Orbitron'] font-bold text-foreground mb-6">Related Shows</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[407, 406, 405].map(ep => (
              <Link key={ep} to={`/episode/${ep}`} className="card-cyber p-4 hover:border-primary/50 transition-colors block">
                <p className="font-semibold text-foreground text-sm">Future Dance Anthems #{ep}</p>
                <p className="text-xs text-muted-foreground mt-1">DJ mix featuring the latest dance tracks</p>
              </Link>
            ))}
          </div>
          <Link to="/shows" className="text-primary hover:underline text-sm mt-4 inline-block">
            View all shows →
          </Link>
        </section>

        {/* RELATED NEWS */}
        {relatedNews && relatedNews.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-['Orbitron'] font-bold text-foreground mb-6">Related News</h2>
            <div className="space-y-3">
              {relatedNews.map(article => (
                <a
                  key={article.id}
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-cyber p-4 flex items-start gap-4 hover:border-primary/50 transition-colors block"
                >
                  {article.image_url && (
                    <img src={article.image_url} alt={article.title} className="w-16 h-16 rounded object-cover flex-shrink-0" loading="lazy" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-sm">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{article.source_name}</p>
                  </div>
                </a>
              ))}
            </div>
            <Link to="/news" className="text-primary hover:underline text-sm mt-4 inline-block">
              More news →
            </Link>
          </section>
        )}

        {/* RELATED TRACKS BY SAME ARTIST */}
        {relatedTracks && relatedTracks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-['Orbitron'] font-bold text-foreground mb-6">
              More by {track.artist}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedTracks.map(rt => (
                <Link key={rt.slug} to={`/track/${rt.slug}`} className="card-cyber p-4 hover:border-primary/50 transition-colors block">
                  <p className="font-semibold text-foreground text-sm">{rt.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rt.artist}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* RECENTLY PLAYED */}
        <section className="mb-12">
          <h2 className="text-2xl font-['Orbitron'] font-bold text-foreground mb-6">Recently Played on Dance One Radio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentTracks?.filter(rt => rt.slug !== slug).slice(0, 15).map(rt => (
              <Link key={rt.slug} to={`/track/${rt.slug}`} className="card-cyber p-4 hover:border-primary/50 transition-colors block">
                <p className="font-semibold text-foreground text-sm truncate">{rt.title}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{rt.artist}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TrackPage;
