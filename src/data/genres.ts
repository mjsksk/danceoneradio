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
  /** Absolute-from-root path used for og:image / twitter:image on this genre page. */
  ogImage?: string;
  ogImageAlt?: string;
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
  {
    slug: 'progressive-house',
    name: 'Progressive House',
    h1: 'Progressive House Radio — Live 24/7',
    tagline: 'Long builds, big breakdowns and melodic peak-time energy, streaming non-stop.',
    metaTitle: 'Progressive House Radio — Live 24/7 | Dance One Radio',
    metaDescription:
      'Free progressive house radio streaming 24/7. Melodic builds, euphoric breakdowns and 126–130 BPM club cuts. Listen live on Dance One Radio.',
    keywords:
      'progressive house radio, progressive house stream, prog house radio, melodic house radio, progressive house music online, listen progressive house',
    intro:
      'Progressive house is the patient side of dance music: tracks unfold over six or seven minutes, layering pads, arpeggios and vocals until the breakdown pays everything off. Dance One Radio streams it continuously at the 126–130 BPM sweet spot, mixing the current wave of melodic releases with the Sasha, Digweed and early-Deadmau5 records the sound was built on. Press play — it is free, no signup, and it runs around the clock.',
    highlights: [
      'Full-length progressive cuts, not radio edits — the builds stay intact',
      'Modern releases alongside the 1990s and 2000s records that defined the genre',
      'Beat-matched by working DJs for continuous listening',
      'Free on web, desktop and mobile',
    ],
    artists: [
      'Sasha', 'John Digweed', 'Cristoph', 'Yotto', 'Lane 8', 'Meduza', 'Martin Garrix', 'Above & Beyond',
    ],
    faq: [
      {
        q: 'What BPM is progressive house?',
        a: 'Most progressive house sits between 124 and 130 BPM — slower than trance, a touch steadier than tech house, which gives the arrangements room to build.',
      },
      {
        q: 'How is progressive house different from trance?',
        a: 'Trance runs faster (typically 136–142 BPM) and leans on a big, obvious lead melody. Progressive house is slower, groove-first, and reveals its melody gradually instead of announcing it.',
      },
      {
        q: 'Is the progressive house stream free?',
        a: 'Yes. It plays free in any modern browser with no signup, and the live audio stream carries no injected ads.',
      },
    ],
  },
  {
    slug: 'deep-house',
    name: 'Deep House',
    h1: 'Deep House Radio — Live 24/7',
    tagline: 'Warm chords, rolling basslines and late-night grooves, all day long.',
    metaTitle: 'Deep House Radio — Live 24/7 | Dance One Radio',
    metaDescription:
      'Free deep house radio streaming 24/7. Warm chords, soulful vocals and rolling 120–125 BPM grooves. Listen live on Dance One Radio.',
    keywords:
      'deep house radio, deep house stream, deep house music online, soulful deep house radio, chill house radio, listen deep house',
    intro:
      'Deep house came out of Chicago in the mid-1980s, when producers slowed house down and swapped its raw drum-machine edge for jazz chords, soul vocals and a heavier, rounder bass. Dance One Radio streams that lineage continuously — classic Larry Heard-inspired warmth, the 2010s melodic wave, and the current crop of deep and organic releases — at a steady 120–125 BPM.',
    highlights: [
      'Warm, chord-led deep house rather than generic lounge filler',
      'Classic Chicago and New York cuts mixed with current releases',
      'Ideal for working, driving and late-night listening',
      'Free in the browser, plus desktop and mobile apps',
    ],
    artists: [
      'Larry Heard', 'Kerri Chandler', 'Lane 8', 'Purple Disco Machine', 'Yotto', 'Ben Böhmer', 'Sonny Fodera',
    ],
    faq: [
      {
        q: 'What is deep house music?',
        a: 'Deep house is a subgenre of house built on jazz- and soul-influenced chords, muted percussion and a prominent, rounded bassline, usually around 120–125 BPM. It trades peak-time aggression for atmosphere and groove.',
      },
      {
        q: 'What is the difference between house and deep house?',
        a: 'House is the broader genre and tends to be brighter and more direct. Deep house is slower, chord-heavier and moodier, with vocals used as texture more often than as a hook.',
      },
      {
        q: 'Can I listen to deep house radio for free?',
        a: 'Yes. The deep house stream plays free in any browser with no account required.',
      },
    ],
  },
  {
    slug: 'melodic-house-techno',
    name: 'Melodic House & Techno',
    h1: 'Melodic House & Techno Radio — Live 24/7',
    tagline: 'Emotional, hypnotic, driving — the Afterlife and Anjunadeep sound, non-stop.',
    metaTitle: 'Melodic House & Techno Radio — Live 24/7 | Dance One Radio',
    metaDescription:
      'Free melodic house and techno radio streaming 24/7. Afterlife, Anjunadeep and All Day I Dream flavoured sets on Dance One Radio.',
    keywords:
      'melodic techno radio, melodic house radio, afterlife radio stream, anjunadeep radio, organic house radio, melodic techno online',
    intro:
      'Melodic house and techno is what happens when techno keeps its hypnotic drive but hands the lead to a synth line with real emotional weight. It is the sound of Afterlife, Anjunadeep and All Day I Dream — long arrangements, cinematic pads, and drops that swell rather than explode. Dance One Radio streams it continuously, from sunrise-set organic house through to darker, faster peak-time melodic techno.',
    highlights: [
      'The full melodic spectrum — organic house through to driving melodic techno',
      'Label-led curation: Afterlife, Anjunadeep, All Day I Dream, Siamese',
      'Extended arrangements that keep the hypnotic flow intact',
      'Free 24/7 on web, desktop and mobile',
    ],
    artists: [
      'Tale Of Us', 'Anyma', 'Ben Böhmer', 'Yotto', 'Massano', 'Argy', 'Kevin de Vries', 'Lane 8',
    ],
    faq: [
      {
        q: 'What is melodic techno?',
        a: 'Melodic techno keeps techno\'s steady, hypnotic four-to-the-floor pulse but foregrounds emotive synth melodies and long, cinematic builds. It usually runs around 120–126 BPM.',
      },
      {
        q: 'Is melodic house the same as melodic techno?',
        a: 'They are close relatives and often programmed together. Melodic house is generally warmer and groovier; melodic techno is darker, more driving and more machine-like.',
      },
      {
        q: 'Where can I listen to melodic techno radio?',
        a: 'Right here — the Dance One Radio stream plays melodic house and techno free, 24 hours a day, in your browser or through the apps.',
      },
    ],
  },
];


export const getGenreBySlug = (slug?: string) =>
  GENRES.find((g) => g.slug === slug);
