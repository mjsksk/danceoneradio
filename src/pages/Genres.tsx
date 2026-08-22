import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Radio, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { GENRES } from '@/data/genres';

const HOST = 'https://danceoneradio.com';

const Genres = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Radio by Genre — Dance One Radio',
      description:
        'Browse Dance One Radio by genre: dedicated live streams for house, tech house, trance, techno, EDM and more.',
      url: `${HOST}/genres`,
      inLanguage: 'en-US',
      isPartOf: { '@type': 'WebSite', name: 'Dance One Radio', url: HOST },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Dance One Radio genre channels',
      itemListElement: GENRES.map((g, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${g.name} radio`,
        url: `${HOST}/genres/${g.slug}`,
        item: {
          '@type': 'RadioStation',
          name: `Dance One Radio — ${g.name}`,
          url: `${HOST}/genres/${g.slug}`,
          genre: g.name,
          broadcastFrequency: 'Internet',
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${HOST}/` },
        { '@type': 'ListItem', position: 2, name: 'Genres', item: `${HOST}/genres` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Radio by Genre: House, Trance, Techno, EDM | Dance One"
        description="Browse Dance One Radio by genre. Dedicated live streams and pages for house, tech house, trance, techno, EDM and dance music — free, 24/7."
        keywords="electronic music radio by genre, house radio, trance radio, techno radio, edm radio, tech house radio, dance music genres"
        url="https://danceoneradio.com/genres"
        image="https://danceoneradio.com/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png"
        imageAlt="Dance One Radio genre channels — house, trance, techno, EDM"
        structuredData={structuredData}
      />
      <Navigation />

      <main className="pt-16">
        <section className="py-10 sm:py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/30 text-xs uppercase tracking-widest text-primary">
                <Radio className="w-3.5 h-3.5" />
                Browse by genre
              </div>
              <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold mb-4">
                <span className="text-neon">Electronic Music Radio</span>{' '}
                <span className="text-neon-purple">by Genre</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Pick a sound and we&apos;ll tune you in. Dance One Radio streams the
                full electronic spectrum — from soulful house to peak-time techno —
                free, 24/7, with no signup required.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GENRES.map((g) => (
                <Link key={g.slug} to={`/genres/${g.slug}`} className="group">
                  <Card className="card-cyber h-full p-5 transition-all duration-200 group-hover:scale-[1.02] group-hover:border-primary/60">
                    <h2 className="text-xl font-['Orbitron'] font-bold mb-2 text-primary group-hover:text-neon">
                      {g.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {g.tagline}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-neon-purple">
                      Listen to {g.name} radio
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Genres;
