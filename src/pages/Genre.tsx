import { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Play, Radio } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getGenreBySlug, GENRES } from '@/data/genres';

const Genre = () => {
  const { slug } = useParams<{ slug: string }>();
  const genre = getGenreBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!genre) {
    return <Navigate to="/genres" replace />;
  }

  const url = `https://danceoneradio.com/genres/${genre.slug}`;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'RadioStation',
      name: `Dance One Radio — ${genre.name}`,
      url,
      genre: genre.name,
      broadcastFrequency: 'Internet',
      sameAs: 'https://danceoneradio.com',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: genre.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://danceoneradio.com/' },
        { '@type': 'ListItem', position: 2, name: 'Genres', item: 'https://danceoneradio.com/genres' },
        { '@type': 'ListItem', position: 3, name: genre.name, item: url },
      ],
    },
  ];

  const related = GENRES.filter((g) => g.slug !== genre.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={genre.metaTitle}
        description={genre.metaDescription}
        keywords={genre.keywords}
        url={url}
        image={genre.ogImage}
        imageAlt={genre.ogImageAlt ?? `${genre.name} radio — live 24/7 on Dance One Radio`}
        structuredData={structuredData}
      />
      <Navigation />

      <main className="pt-16">
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-6">
              <Link to="/genres">
                <Button variant="ghost" className="hover:text-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  All genres
                </Button>
              </Link>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/30 text-xs uppercase tracking-widest text-primary">
                <Radio className="w-3.5 h-3.5" />
                {genre.name} radio — live
              </div>
              <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold mb-4">
                <span className="text-neon">{genre.h1}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {genre.tagline}
              </p>
              <div className="mt-6 flex justify-center">
                <Link to="/">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-neon-purple text-primary-foreground">
                    <Play className="w-4 h-4 mr-2" />
                    Listen live now
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="card-cyber p-5 sm:p-8 mb-8">
              <h2 className="text-xl sm:text-2xl font-['Orbitron'] font-bold mb-4 text-neon-purple">
                About this {genre.name} stream
              </h2>
              <p className="text-muted-foreground leading-relaxed">{genre.intro}</p>

              <h3 className="text-lg font-['Orbitron'] font-bold mt-6 mb-3 text-primary">
                What you&apos;ll hear
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                {genre.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-neon-purple shrink-0">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-['Orbitron'] font-bold mt-6 mb-3 text-primary">
                Artists in rotation
              </h3>
              <div className="flex flex-wrap gap-2">
                {genre.artists.map((a) => (
                  <span
                    key={a}
                    className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </Card>

            <GoogleAds key={`genre-${genre.slug}-ad`} slot={AD_SLOTS.IN_CONTENT} />

            <Card className="card-cyber p-5 sm:p-8 mt-8 mb-8">
              <h2 className="text-xl sm:text-2xl font-['Orbitron'] font-bold mb-4 text-neon-purple">
                {genre.name} radio — FAQ
              </h2>
              <div className="space-y-5">
                {genre.faq.map((f) => (
                  <div key={f.q}>
                    <h3 className="font-semibold text-primary mb-1">{f.q}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div>
              <h2 className="text-lg font-['Orbitron'] font-bold mb-3 text-center">
                <span className="text-neon">Other genres</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.map((r) => (
                  <Link key={r.slug} to={`/genres/${r.slug}`}>
                    <Card className="card-cyber p-3 text-center hover:border-primary/60 transition-colors">
                      <span className="text-sm font-semibold text-primary">{r.name}</span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Genre;
