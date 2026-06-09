export interface Genre {
  slug: string;
  name: string;
  h1: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  intro: string;
  highlights: string[];
  artists: string[];
  faq: { q: string; a: string }[];
}

export const GENRES: Genre[] = [
  {
    slug: 'house',
    name: 'House',
    h1: 'House Music Radio — Live 24/7',
    tagline: 'Soulful, vocal, classic and modern house, streaming non-stop.',
    metaTitle: 'House Music Radio — Live 24/7 | Dance One Radio',
    metaDescription:
      'Free house music radio streaming live 24/7. Soulful, vocal, classic and modern house — no signup, no ads on stream. Listen now on Dance One Radio.',
    keywords:
      'house radio, house music radio, online house radio, live house stream, vocal house radio, soulful house, classic house radio',
    intro:
      'House music was born on the dance floors of Chicago in the early 1980s and has shaped club culture ever since. Dance One Radio streams a continuous mix of house — from the warm, soulful Chicago and New York sound through to today\'s vocal, funky and tech-flavoured productions. It plays free in your browser, no signup needed, and the stream runs around the clock.',
    highlights: [
      'Continuous, beat-matched house 24/7 — no awkward gaps between tracks',
      'A mix of new releases and the classics that defined the genre',
      'Curated by working DJs, not random algorithms',
      'Free to listen on web, desktop and the apps page',
    ],
    artists: [
      'Mark Knight', 'Wh0', 'CamelPhat', 'Low Steppa', 'Joshwa', 'Cristoph', 'CASSIMM', 'Mason Collective',
    ],
    faq: [
      {
        q: 'Is this house radio really free?',
        a: 'Yes. Dance One Radio is free to listen to in any modern browser. There is no signup or paywall on the live stream.',
      },
      {
        q: 'What kind of house do you play?',
        a: 'A blend of classic, vocal, soulful, funky and tech-leaning house — programmed for the dance floor rather than the lounge.',
      },
      {
        q: 'Can I listen on mobile?',
        a: 'Yes. The site works on phones and tablets, and there are dedicated desktop and mobile apps on the Apps page.',
      },
    ],
  },
  {
    slug: 'tech-house',
    name: 'Tech House',
    h1: 'Tech House Radio — Live 24/7',
    tagline: 'Driving, groovy, club-ready tech house from the labels you trust.',
    metaTitle: 'Tech House Radio — Live 24/7 | Dance One Radio',
    metaDescription:
      'Live tech house radio streaming 24/7. Toolroom, Defected, Solä and beyond — driving grooves and peak-time energy on Dance One Radio.',
    keywords:
      'tech house radio, tech house stream, live tech house, toolroom radio, defected radio alternative, club tech house',
    intro:
      'Tech house took the swing of house and married it to the precision of techno, and it has dominated club programming for the last decade. Dance One Radio streams a non-stop tech-house mix pulled from the labels that shaped the sound — Toolroom, Defected, Solä, Hot Creations and more — alongside fresh underground heat. The result is a peak-time set that runs 24 hours a day.',
    highlights: [
      'Peak-time tech house, mixed continuously',
      'Heavy rotation from Toolroom, Defected, Solä, Hot Creations and friends',
      'Includes the weekly Wh0 Plays Sessions guest mix',
      'No signup, no app required — press play in the browser',
    ],
    artists: [
      'Wh0', 'Mark Knight', 'Solardo', 'CamelPhat', 'Joshwa', 'Mason Collective', 'LEFTI', 'CASSIMM',
    ],
    faq: [
      {
        q: 'How is this different from a house radio station?',
        a: 'Tech house leans harder into the bassline and the groove, with less emphasis on vocals. Expect dance-floor energy from start to finish.',
      },
      {
        q: 'Do you take requests?',
        a: 'Yes — use the Requests page to send a track to the studio.',
      },
    ],
  },
  {
    slug: 'trance',
    name: 'Trance',
    h1: 'Trance Radio — Live 24/7',
    tagline: 'Uplifting, vocal and progressive trance, streaming around the clock.',
    metaTitle: 'Trance Radio — Live 24/7 | Dance One Radio',
    metaDescription:
      'Free trance radio streaming 24/7. Uplifting, vocal and progressive trance from Anjunabeats, Armada and beyond. Listen live on Dance One Radio.',
    keywords:
      'trance radio, trance music radio, uplifting trance radio, vocal trance, progressive trance, anjunabeats radio, online trance stream',
    intro:
      'Trance is the genre of the long build, the breakdown and the euphoric release. Dance One Radio streams a continuous trance mix that covers everything from uplifting and vocal trance through to the modern progressive sound — pulled from Anjunabeats, Armada, Black Hole and the independent producers pushing the genre forward.',
    highlights: [
      'Uplifting, vocal and progressive trance in one continuous stream',
      'Anjunabeats, Armada and Black Hole heavy rotation',
      'Curated by trance fans — not a generic dance algorithm',
      'Free, no signup, runs in any browser',
    ],
    artists: [
      'Above & Beyond', 'Armin van Buuren', 'Aly & Fila', 'Cosmic Gate', 'Markus Schulz', 'Gareth Emery',
    ],
    faq: [
      {
        q: 'Do you play uplifting or progressive trance?',
        a: 'Both. The stream blends classic uplifting, vocal trance and the modern progressive sound across the day.',
      },
      {
        q: 'Is there a trance show?',
        a: 'Yes — check the Shows page for upcoming trance-focused mixes and guest spots.',
      },
    ],
  },
  {
    slug: 'techno',
    name: 'Techno',
    h1: 'Techno Radio — Live 24/7',
    tagline: 'Driving, hypnotic, peak-time techno streaming non-stop.',
    metaTitle: 'Techno Radio — Live 24/7 | Dance One Radio',
    metaDescription:
      'Live techno radio streaming 24/7. Driving, melodic and peak-time techno from Drumcode, Afterlife and beyond on Dance One Radio.',
    keywords:
      'techno radio, techno music radio, live techno stream, drumcode radio, melodic techno, peak time techno, online techno station',
    intro:
      'Techno is built on repetition, pressure and release. Dance One Radio streams a continuous techno mix that covers the spectrum — from the driving Drumcode sound through to melodic techno from Afterlife, Anjunadeep and the long tail of independent labels keeping the genre healthy.',
    highlights: [
      'Driving, melodic and peak-time techno in one stream',
      'Drumcode, Afterlife and Anjunadeep heavy rotation',
      'Mixed beat-to-beat, no awkward silences',
      'Free in the browser, plus dedicated desktop apps',
    ],
    artists: [
      'Adam Beyer', 'Charlotte de Witte', 'Tale Of Us', 'Anyma', 'Amelie Lens', 'Maceo Plex',
    ],
    faq: [
      {
        q: 'Is this hard techno?',
        a: 'It spans the genre. Expect driving peak-time cuts, melodic techno and the occasional deeper, more hypnotic moment.',
      },
      {
        q: 'Can I listen on my phone?',
        a: 'Yes. The site works on mobile browsers and there are mobile apps on the Apps page.',
      },
    ],
  },
  {
    slug: 'edm',
    name: 'EDM',
    h1: 'EDM Radio — Live 24/7',
    tagline: 'Festival-ready big-room, electro and main-stage EDM, streaming live.',
    metaTitle: 'EDM Radio — Live 24/7 | Dance One Radio',
    metaDescription:
      'Free EDM radio streaming 24/7. Big-room, electro and main-stage EDM from Spinnin\', Revealed, Musical Freedom and beyond on Dance One Radio.',
    keywords:
      'edm radio, edm music radio, big room edm, festival edm, edm stream, electronic dance music radio, main stage edm',
    intro:
      'EDM is the main-stage sound that broke dance music into the global mainstream. Dance One Radio streams a continuous EDM mix pulled from Spinnin\', Revealed, Musical Freedom and the festival circuit — big-room, electro, future house and the crossover hits that fill the front row at every major festival.',
    highlights: [
      'Big-room, electro and main-stage EDM in one stream',
      'Spinnin\', Revealed and Musical Freedom heavy rotation',
      'The festival anthems plus the new releases chasing them',
      'Free to listen, no signup required',
    ],
    artists: [
      'Calvin Harris', 'Hardwell', 'Tiësto', 'Martin Garrix', 'David Guetta', 'Steve Aoki', 'Afrojack',
    ],
    faq: [
      {
        q: 'Is EDM the same as house or trance?',
        a: 'EDM is an umbrella term for the festival-oriented sound that grew out of house, trance and electro in the early 2010s. This stream focuses on the main-stage end of the spectrum.',
      },
      {
        q: 'Are there ads on the live stream?',
        a: 'The live audio stream runs without injected ads. Site display ads keep the station free to run.',
      },
    ],
  },
  {
    slug: 'dance',
    name: 'Dance',
    h1: 'Dance Music Radio — Live 24/7',
    tagline: 'Every flavour of dance — house, trance, techno and EDM in one stream.',
    metaTitle: 'Dance Music Radio — Live 24/7 | Dance One Radio',
    metaDescription:
      'Free dance music radio streaming 24/7. House, trance, techno and EDM in one continuous mix on Dance One Radio.',
    keywords:
      'dance radio, dance music radio, online dance station, electronic dance radio, dance music stream, live dance radio',
    intro:
      'Dance One Radio is, at its core, a dance music station. The flagship stream blends the genres that fill clubs and festivals around the world — house, tech house, trance, techno and EDM — into one continuous, beat-matched broadcast that runs 24 hours a day, every day of the year.',
    highlights: [
      'House, trance, techno and EDM in one continuous mix',
      'Live 24/7 — no scheduled silence, no recorded chatter',
      'Mixed and curated by working DJs',
      'Free in the browser plus dedicated desktop and mobile apps',
    ],
    artists: [
      'Calvin Harris', 'Above & Beyond', 'Mark Knight', 'Adam Beyer', 'Wh0', 'Armin van Buuren',
    ],
    faq: [
      {
        q: 'What is the best way to listen?',
        a: 'The fastest way is to press play here in the browser. For background listening, install the desktop or mobile app from the Apps page.',
      },
      {
        q: 'How do I see what is playing now?',
        a: 'The floating player shows the current track. The Shows page lists upcoming and recent mixes.',
      },
    ],
  },
];

export const getGenreBySlug = (slug?: string) =>
  GENRES.find((g) => g.slug === slug);
