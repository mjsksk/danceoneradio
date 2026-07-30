import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Headphones, Calendar, Music, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import SocialShare from '@/components/SocialShare';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';

interface Era {
  years: string;
  title: string;
  summary: string;
  artists: string;
  records: string[];
}

const HistoryOfProgressiveHouse = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const eras: Era[] = [
    {
      years: '1990–1993',
      title: 'The British Origins',
      summary:
        "Progressive house began in the UK as a reaction to the raw, sample-heavy acid house of the late eighties. Producers stripped out the vocal hooks and built long, hypnotic arrangements that unfolded slowly across eight or nine minutes. The term itself was coined by Mixmag journalist Dom Phillips in 1992 to describe records that 'progressed' rather than repeated — Guerilla Records, Leftfield and Guy Called Gerald were the reference points.",
      artists: 'Leftfield, Sasha, Guerilla Records, Fluke, Spooky',
      records: [
        'Leftfield — "Not Forgotten" (1990)',
        'Leftfield — "Song of Life" (1992)',
        'Spooky — "Little Bullet" (1993)',
      ],
    },
    {
      years: '1993–1998',
      title: 'Sasha, Digweed and the Progressive Sound',
      summary:
        'The Renaissance club in Mansfield and its landmark mix compilations turned progressive house from a producer style into a DJ discipline. Sasha and John Digweed made the extended, seamless journey set the defining format: a two- or three-hour arc with slow tension, no obvious peaks, and tracks selected for how they blend rather than how they land alone. Northern Exposure and the Renaissance Mix Collection are still the canonical documents of the era.',
      artists: 'Sasha, John Digweed, BT, Nalin & Kane, Chicane',
      records: [
        'Renaissance: The Mix Collection (1994)',
        'BT — "Embracing the Sunshine" (1995)',
        'Sasha & Digweed — Northern Exposure (1996)',
      ],
    },
    {
      years: '1998–2004',
      title: 'Progressive Breaks and the Global Underground Years',
      summary:
        'As trance dominated the mainstream, progressive house went deeper and darker. Global Underground, Bedrock and Hooj Choons pushed a tougher, breakbeat-influenced strain, while Hernán Cattáneo and Nick Warren carried the sound to South America, where it took root permanently. Buenos Aires and São Paulo became — and remain — the genre\'s most devoted audiences.',
      artists: 'Hernán Cattáneo, Nick Warren, John Digweed, Deep Dish, James Zabiela',
      records: [
        'Deep Dish — "Flashdance" (2004)',
        'Way Out West — "The Gift" (1996)',
        'Global Underground: Buenos Aires (1999)',
      ],
    },
    {
      years: '2005–2011',
      title: 'Electro Crossover and the Big-Room Turn',
      summary:
        "Eric Prydz's \"Call on Me\" and later \"Pjanoo\" proved a progressive record could top pop charts without losing its structure. At the same time Swedish House Mafia, Deadmau5 and Avicii compressed the genre's long builds into festival-length arrangements. Purists call this the moment progressive house lost its patience; commercially, it is when the genre reached the largest audience it has ever had.",
      artists: 'Eric Prydz, Deadmau5, Swedish House Mafia, Avicii, Above & Beyond',
      records: [
        'Eric Prydz — "Pjanoo" (2008)',
        'Deadmau5 — "Strobe" (2009)',
        'Swedish House Mafia — "One" (2010)',
      ],
    },
    {
      years: '2012–2017',
      title: 'Melodic House, Techno and the Reset',
      summary:
        'When EDM peaked, the underground responded. Labels like Anjunadeep, Innervisions and Afterlife built a slower, more emotional strain — melodic house and techno — that inherited progressive house\'s long-form structure and atmospheric intent while trading the vocal hooks for texture and drone. This is where progressive house went to rebuild.',
      artists: 'Lane 8, Yotto, Ben Böhmer, Tale of Us, Âme',
      records: [
        'Lane 8 — "Ghost" (2014)',
        'Yotto — "Personal Space" (2016)',
        'Ben Böhmer — "Beyond Beliefs" (2017)',
      ],
    },
    {
      years: '2018–Today',
      title: 'The Modern Revival',
      summary:
        'Progressive house is now split between two healthy scenes. One is festival-facing and vocal-led — John Summit, Meduza, Martin Garrix and Vintage Culture regularly place progressive records on streaming charts. The other is the long-form underground, where Hernán Cattáneo still plays six-hour sunrise sets and Anjunadeep sells out multi-day events. Both are recognisably descended from the same 1992 idea: a record that goes somewhere.',
      artists: 'John Summit, Meduza, Vintage Culture, Ben Böhmer, Hernán Cattáneo',
      records: [
        'Meduza — "Piece of Your Heart" (2019)',
        'John Summit & Hayla — "Where You Are" (2023)',
        'Anyma & Chris Avantgarde — "Consciousness" (2022)',
      ],
    },
  ];

  const faqs = [
    {
      q: 'What defines progressive house?',
      a: 'Long, evolving arrangements built on a 4/4 kick at roughly 122–128 BPM, with layered synth progressions that change gradually across the track instead of resolving into a single drop. The emphasis is on tension, atmosphere and arrangement rather than a hook.',
    },
    {
      q: 'How is progressive house different from trance?',
      a: 'Trance typically runs faster (132–140 BPM), uses brighter supersaw leads and builds to an explicit euphoric breakdown and climax. Progressive house is slower, groovier and more restrained — the payoff is usually a shift in texture rather than a full release.',
    },
    {
      q: 'How is it different from melodic house and techno?',
      a: "Melodic house and techno is progressive house's direct descendant. It keeps the long-form structure and emotional pacing but leans darker, more percussive and more synth-driven, with far fewer vocals. Many artists move freely between the two.",
    },
    {
      q: 'Who invented progressive house?',
      a: 'No single person. The sound emerged from UK producers and labels around 1990–1992 — Leftfield, Guerilla Records and the Renaissance club scene — and the name was popularised by Mixmag writer Dom Phillips in 1992.',
    },
    {
      q: 'Where can I listen to progressive house now?',
      a: 'Dance One Radio streams progressive house, trance, techno and deep house 24/7, alongside weekly DJ shows and guest mixes.',
    },
  ];

  const pageUrl = 'https://danceoneradio.com/news/history-of-progressive-house';
  const heroImage = 'https://danceoneradio.com/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'The History of Progressive House: From 1990 to Today',
      description:
        'A complete guide to progressive house history — its UK origins, the Sasha and Digweed era, the Global Underground years, the EDM crossover, and the modern melodic revival.',
      image: heroImage,
      author: { '@type': 'Organization', name: 'Dance One Radio' },
      publisher: {
        '@type': 'RadioStation',
        name: 'Dance One Radio',
        url: 'https://danceoneradio.com',
        logo: heroImage,
      },
      datePublished: '2026-07-30',
      dateModified: '2026-07-30',
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
      articleSection: 'Music',
      keywords:
        'progressive house history, what is progressive house, progressive house origins, Sasha Digweed, melodic house and techno',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
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
        { '@type': 'ListItem', position: 3, name: 'History of Progressive House', item: pageUrl },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="History of Progressive House: 1990 to Today | Dance One Radio"
        description="How progressive house began in the UK in 1990, grew through Sasha, Digweed and Global Underground, crossed into EDM, and returned as melodic house. A full genre guide."
        url={pageUrl}
        type="article"
        keywords="progressive house history, what is progressive house, progressive house origins, Sasha Digweed progressive house, melodic house and techno, best progressive house eras"
        structuredData={structuredData}
      />

      <Navigation />

      <main className="pt-16 pb-12">
        <section className="relative py-12 sm:py-20 overflow-hidden">
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

            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Genre Guide
                </span>
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Updated July 2026
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Orbitron'] font-bold mb-6 leading-tight">
                <span className="text-neon-purple">The History of Progressive House</span>{' '}
                <span className="text-foreground">— 1990 to Today</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                Three decades of one of dance music's most enduring sounds: where it came from, who
                shaped it, the records that mattered, and how it survived every trend that tried to
                replace it.
              </p>

              <SocialShare
                url={pageUrl}
                title="The History of Progressive House — Dance One Radio"
                description="From 1990s London to today's melodic revival: a complete progressive house genre guide."
                image={heroImage}
              />
            </div>
          </div>
        </section>

        <GoogleAds key="history-top" slot={AD_SLOTS.NEWS} />

        {/* Definition */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="card-cyber p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center shrink-0">
                    <Headphones className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-['Orbitron'] font-bold mb-3">
                      What is progressive house?
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Progressive house is a subgenre of house music built around gradual change. A
                      typical record runs six to nine minutes at 122–128 BPM and layers synth
                      progressions, filtered pads and percussion so that the arrangement is
                      noticeably different at the end than it was at the start. There is rarely a
                      single drop; the reward is the journey between states.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      That structural idea — music that progresses — is why the genre has outlasted
                      trance revivals, the EDM boom and the tech house wave. Every few years it
                      changes clothes and comes back under a new name.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-['Orbitron'] font-bold mb-8 text-center">
                Six eras of progressive house
              </h2>

              <div className="space-y-6">
                {eras.map((era) => (
                  <Card key={era.years} className="card-cyber p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold font-['Orbitron']">
                        {era.years}
                      </span>
                    </div>
                    <h3 className="text-xl font-['Orbitron'] font-bold mb-3">{era.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{era.summary}</p>

                    <p className="text-sm mb-3">
                      <span className="font-semibold text-foreground">Key artists: </span>
                      <span className="text-muted-foreground">{era.artists}</span>
                    </p>

                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Defining records
                      </p>
                      <ul className="space-y-1.5">
                        {era.records.map((record) => (
                          <li
                            key={record}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <Music className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                            <span>{record}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <GoogleAds key="history-mid" slot={AD_SLOTS.NEWS} />

        {/* FAQ */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-['Orbitron'] font-bold mb-8 text-center">
                Progressive house FAQ
              </h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <Card key={faq.q} className="card-cyber p-6">
                    <h3 className="text-lg font-['Orbitron'] font-bold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Keep reading / CTA */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="card-cyber p-6 sm:p-8 text-center">
                <h2 className="text-2xl font-['Orbitron'] font-bold mb-3">
                  Hear the genre, not just read about it
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Dance One Radio streams progressive house, trance, techno and deep house around
                  the clock, with weekly DJ shows and guest mixes.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/">
                    <Button className="btn-neon">Listen live</Button>
                  </Link>
                  <Link to="/news/best-progressive-house-tracks-2024">
                    <Button variant="outline">Top 10 progressive house tracks of 2024</Button>
                  </Link>
                  <Link to="/shows">
                    <Button variant="outline">Browse shows &amp; guest mixes</Button>
                  </Link>
                  <Link to="/genres">
                    <Button variant="outline">Explore all genres</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryOfProgressiveHouse;
