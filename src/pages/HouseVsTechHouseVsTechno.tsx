import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Headphones, Music, Radio, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import SocialShare from '@/components/SocialShare';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';

interface GenreRow {
  name: string;
  bpm: string;
  feel: string;
  drums: string;
  melody: string;
  origin: string;
  listen: string;
}

const ROWS: GenreRow[] = [
  {
    name: 'House',
    bpm: '120–126 BPM',
    feel: 'Warm, soulful, song-led',
    drums: 'Open hi-hats, live-feeling percussion, clap on 2 and 4',
    melody: 'Piano stabs, organ chords, full vocal hooks',
    origin: 'Chicago, early 1980s',
    listen: '/genres/house',
  },
  {
    name: 'Tech House',
    bpm: '124–128 BPM',
    feel: 'Tight, groovy, functional',
    drums: 'Dry, punchy kick with a rolling bassline locked to it',
    melody: 'Chopped vocal snippets and short riffs, rarely a full topline',
    origin: 'UK, mid-1990s',
    listen: '/genres/tech-house',
  },
  {
    name: 'Techno',
    bpm: '128–145 BPM',
    feel: 'Hypnotic, mechanical, relentless',
    drums: 'Hard, dominant kick; percussion used as texture',
    melody: 'Often none — atmosphere, noise and modulation instead',
    origin: 'Detroit, mid-1980s',
    listen: '/genres/techno',
  },
];

const FAQ = [
  {
    q: 'What is the difference between house and tech house?',
    a: 'House is the parent genre: warmer, chord- and vocal-driven, and usually built like a song. Tech house strips that back and borrows techno\'s tighter drum programming — the bassline becomes the hook, vocals get chopped into short stabs, and the track is engineered to sit in the middle of a DJ set rather than stand alone.',
  },
  {
    q: 'What is the difference between techno and house?',
    a: 'Tempo and intent. House sits around 120–126 BPM and grooves with a swung, soulful feel rooted in disco. Techno runs faster (128 BPM and well beyond), leads with a dominant kick, and is built to be hypnotic rather than melodic. House invites you to sing along; techno asks you to lock in.',
  },
  {
    q: 'Is tech house just house with a techno kick?',
    a: 'That is a fair shorthand, but the bassline matters as much as the kick. Tech house is defined by a rolling, syncopated bass that answers the kick on the off-beats, which is what gives the genre its distinctive bounce.',
  },
  {
    q: 'Which genre is fastest?',
    a: 'Techno, comfortably. Peak-time techno commonly runs 138–145 BPM, while house and tech house both stay near 120–128 BPM.',
  },
  {
    q: 'Where can I hear all three?',
    a: 'Dance One Radio streams house, tech house and techno free, 24 hours a day. You can also open a genre stream directly from the genres page.',
  },
];

const PAGE_URL = 'https://danceoneradio.com/news/house-vs-tech-house-vs-techno';
const IMAGE = 'https://danceoneradio.com/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png';

const HouseVsTechHouseVsTechno = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'House vs Tech House vs Techno: The Differences Explained',
      description:
        'A practical guide to telling house, tech house and techno apart — BPM ranges, drum programming, basslines, melody and origins, with examples you can hear live.',
      image: IMAGE,
      author: { '@type': 'Organization', name: 'Dance One Radio' },
      publisher: {
        '@type': 'RadioStation',
        name: 'Dance One Radio',
        url: 'https://danceoneradio.com',
        logo: IMAGE,
      },
      datePublished: '2026-07-30',
      dateModified: '2026-07-30',
      mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
      articleSection: 'Music',
      keywords:
        'tech house vs house, techno vs house, house vs techno, what is tech house, difference between house and techno',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
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
        { '@type': 'ListItem', position: 2, name: 'News', item: 'https://danceoneradio.com/news' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'House vs Tech House vs Techno',
          item: PAGE_URL,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="House vs Tech House vs Techno: Differences Explained"
        description="How to tell house, tech house and techno apart — BPM, drums, basslines, melody and origins, explained by the DJs at Dance One Radio."
        url={PAGE_URL}
        type="article"
        keywords="tech house vs house, techno vs house, house vs techno, what is tech house, difference between house and techno, dance music genres explained"
        structuredData={structuredData}
      />

      <Navigation />

      <main className="pt-16 pb-12">
        <section className="relative py-12 sm:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="mb-6">
              <Link to="/news">
                <Button variant="ghost" className="hover:text-primary pl-0">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to News
                </Button>
              </Link>
            </div>

            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                <TrendingUp className="w-3.5 h-3.5" />
                Genre Guide
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Orbitron'] font-bold mb-6 leading-tight">
                <span className="text-neon">House</span>{' '}
                <span className="text-foreground">vs</span>{' '}
                <span className="text-neon-purple">Tech House</span>{' '}
                <span className="text-foreground">vs Techno</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Three genres, one four-to-the-floor kick, and endless arguments about which is which.
                Here is the practical way to tell them apart — by tempo, drums, bassline and intent —
                with a live stream for each so you can hear the difference immediately.
              </p>

              <SocialShare
                url={PAGE_URL}
                title="House vs Tech House vs Techno — Dance One Radio"
                description="How to tell house, tech house and techno apart."
                image={IMAGE}
              />
            </div>
          </div>
        </section>

        <GoogleAds key="hvt-top" slot={AD_SLOTS.NEWS} />

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-6">
              {ROWS.map((row) => (
                <Card key={row.name} className="card-cyber p-5 sm:p-7">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h2 className="text-xl sm:text-2xl font-['Orbitron'] font-bold text-neon-purple">
                      {row.name}
                    </h2>
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      {row.bpm}
                    </span>
                    <span className="px-2.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                      {row.origin}
                    </span>
                  </div>

                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-semibold text-primary">Overall feel</dt>
                      <dd className="text-muted-foreground">{row.feel}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-primary">Drums and groove</dt>
                      <dd className="text-muted-foreground">{row.drums}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-primary">Melody and vocals</dt>
                      <dd className="text-muted-foreground">{row.melody}</dd>
                    </div>
                  </dl>

                  <Link to={row.listen} className="inline-block mt-5">
                    <Button variant="outline" className="border-primary/40 hover:border-primary">
                      <Radio className="w-4 h-4 mr-2" />
                      Listen to {row.name.toLowerCase()} live
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="card-cyber p-6 sm:p-8">
                <h2 className="text-xl font-['Orbitron'] font-bold mb-4">
                  The three-second test
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Ignore the tempo for a moment and listen to what is carrying the track. If a chord
                  progression or a full vocal is doing the work, you are hearing house. If the bassline
                  is doing the work — rolling underneath a dry, clipped kick with a chopped vocal on
                  top — that is tech house. If the kick itself is doing the work and everything else is
                  texture, it is techno.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The second tell is arrangement. House and tech house records are built for a DJ to mix
                  in and out of within a few minutes. Techno is built to sustain a mood across a much
                  longer stretch, which is why its changes are so gradual — a filter opening over
                  thirty-two bars counts as a big moment.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The edges genuinely blur, and that is fine. Plenty of modern releases sit squarely
                  between tech house and techno, and the melodic side of the spectrum has its own name
                  now. If a track keeps techno&apos;s pulse but leads with an emotional synth line, you
                  are in{' '}
                  <Link to="/genres/melodic-house-techno" className="text-primary hover:text-neon underline">
                    melodic house and techno
                  </Link>{' '}
                  territory.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <GoogleAds key="hvt-mid" slot={AD_SLOTS.IN_CONTENT} format="rectangle" />

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="card-cyber p-6 sm:p-8">
                <h2 className="text-xl font-['Orbitron'] font-bold mb-5">
                  Frequently asked questions
                </h2>
                <div className="space-y-5">
                  {FAQ.map((f) => (
                    <div key={f.q}>
                      <h3 className="font-semibold text-primary mb-1">{f.q}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-['Orbitron'] font-bold mb-6">Keep exploring</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/genres/deep-house">
                  <Card className="card-cyber p-5 hover:border-primary/50 transition-all group h-full">
                    <div className="flex items-center gap-3">
                      <Headphones className="w-5 h-5 text-neon" />
                      <div>
                        <h3 className="font-semibold text-primary group-hover:text-neon transition-colors">
                          Deep House Radio
                        </h3>
                        <p className="text-sm text-muted-foreground">Warm chords and rolling grooves</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link to="/genres/progressive-house">
                  <Card className="card-cyber p-5 hover:border-primary/50 transition-all group h-full">
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-neon-purple" />
                      <div>
                        <h3 className="font-semibold text-primary group-hover:text-neon transition-colors">
                          Progressive House Radio
                        </h3>
                        <p className="text-sm text-muted-foreground">Long builds and big breakdowns</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link to="/news/history-of-progressive-house">
                  <Card className="card-cyber p-5 hover:border-primary/50 transition-all group h-full">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-primary group-hover:text-neon transition-colors">
                          History of Progressive House
                        </h3>
                        <p className="text-sm text-muted-foreground">From 1990 to the modern revival</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link to="/genres">
                  <Card className="card-cyber p-5 hover:border-primary/50 transition-all group h-full">
                    <div className="flex items-center gap-3">
                      <Radio className="w-5 h-5 text-accent" />
                      <div>
                        <h3 className="font-semibold text-primary group-hover:text-neon transition-colors">
                          All Genre Streams
                        </h3>
                        <p className="text-sm text-muted-foreground">Nine live genre channels</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HouseVsTechHouseVsTechno;
