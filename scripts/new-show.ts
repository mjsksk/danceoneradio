#!/usr/bin/env bun
/**
 * Upcoming show page generator.
 *
 * Creates the next Wh0 Plays Sessions page (or the next Future Dance Anthems
 * episode page) from a pasted tracklist, filling in the next episode number and
 * the next broadcast date automatically, and wiring up routing, navigation,
 * show-feed data and the sitemap.
 *
 * Usage:
 *   bun run new:show                          # wh0, tracklist pasted on stdin (Ctrl-D to finish)
 *   bun run new:show -- --tracks list.txt     # read tracklist from a file
 *   bun run new:show -- --guest "Johan S"
 *   bun run new:show -- --brand fda --tracks list.txt
 *
 * Options:
 *   --brand wh0|fda     Which show (default: wh0)
 *   --tracks <file>     Tracklist file (default: stdin)
 *   --number <n>        Override auto-detected episode number
 *   --date YYYY-MM-DD   Override auto-detected broadcast date
 *   --guest "Name"      Guest DJ (wh0 only)
 *   --audio <url>       Audio URL (fda only; otherwise pulled from the RSS feed)
 *   --dry-run           Print what would change without writing
 *
 * Tracklist formats accepted (one track per line, mix and match):
 *   00:55 - Artist - Title
 *   Artist - Title
 *   1. Artist - Title
 *   Title<TAB>Artist        (two columns pasted from a spreadsheet)
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const RSS_FEED_URL = 'https://feeds.blubrry.com/feeds/biggest_tunes_with_mario_135.xml';
const STATION_TZ_LABEL = '6 PM PT';

/* ------------------------------------------------------------------ args */

interface Args {
  brand: 'wh0' | 'fda';
  tracksFile?: string;
  number?: number;
  date?: string;
  guest?: string;
  audio?: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { brand: 'wh0', dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--brand') args.brand = next() === 'fda' ? 'fda' : 'wh0';
    else if (a === '--tracks') args.tracksFile = next();
    else if (a === '--number') args.number = parseInt(next(), 10);
    else if (a === '--date') args.date = next();
    else if (a === '--guest') args.guest = next();
    else if (a === '--audio') args.audio = next();
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--help' || a === '-h') {
      console.log(fs.readFileSync(__filename, 'utf-8').split('*/')[0]);
      process.exit(0);
    }
  }
  return args;
}

/* ------------------------------------------------------------ tracklist */

export interface ParsedTrack {
  position: number;
  timestamp: string;
  artist: string;
  title: string;
}

export function parseTracklist(raw: string): ParsedTrack[] {
  const tracks: ParsedTrack[] = [];
  for (const line of raw.split(/\r?\n/)) {
    let text = line.trim();
    if (!text) continue;

    // Leading list numbering: "1." / "01)" / "1 -"
    text = text.replace(/^\d{1,2}\s*[.)]\s+/, '');

    // Leading timestamp: "00:55", "1:02:33", optionally followed by a dash
    let timestamp = '';
    const tsMatch = text.match(/^((?:\d{1,2}:)?\d{1,2}:\d{2})\s*[-–—]?\s*/);
    if (tsMatch) {
      timestamp = tsMatch[1];
      text = text.slice(tsMatch[0].length).trim();
    }
    if (!text) continue;

    let artist = '';
    let title = '';

    if (text.includes('\t')) {
      // Spreadsheet paste: Title <TAB> Artist
      const cols = text.split('\t').map((c) => c.trim()).filter(Boolean);
      title = cols[0] ?? '';
      artist = cols[1] ?? '';
    } else {
      const sep = text.match(/\s[-–—]\s/);
      if (sep && sep.index !== undefined) {
        artist = text.slice(0, sep.index).trim();
        title = text.slice(sep.index + sep[0].length).trim();
      } else {
        title = text;
      }
    }

    // Collapse duplicated titles like "House On Fire - House On Fire"
    const dupe = title.match(/^(.*?)\s[-–—]\s\1$/);
    if (dupe) title = dupe[1];

    if (!title && !artist) continue;
    tracks.push({ position: tracks.length + 1, timestamp, artist, title });
  }
  return tracks;
}

/* ----------------------------------------------------------------- dates */

/** Next Friday strictly after `from`, at 18:00 station-local. */
function nextFridayAfter(from: Date): Date {
  const d = new Date(from.getTime());
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() !== 5);
  d.setHours(18, 0, 0, 0);
  return d;
}

function isoLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

function longDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function ymd(d: Date): string {
  return isoLocal(d).slice(0, 10);
}

/* --------------------------------------------------------------- helpers */

const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf-8');

const pending: { file: string; content: string }[] = [];
function queueWrite(file: string, content: string) {
  pending.push({ file, content });
}

function existingNumbers(prefix: string): number[] {
  const dir = path.join(ROOT, 'src', 'pages');
  const re = new RegExp(`^${prefix}(\\d+)\\.tsx$`);
  return fs
    .readdirSync(dir)
    .map((f) => f.match(re))
    .filter(Boolean)
    .map((m) => parseInt(m![1], 10))
    .sort((a, b) => a - b);
}

function uniqueNames(tracks: ParsedTrack[], max = 10): string {
  const seen: string[] = [];
  for (const t of tracks) {
    for (const name of t.artist.split(/,|&|feat\.|ft\./i).map((n) => n.trim())) {
      if (name && !seen.includes(name)) seen.push(name);
    }
  }
  return seen.slice(0, max).join(', ');
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/* -------------------------------------------------------- wh0 generation */

function wh0PageSource(opts: {
  num: number;
  guest?: string;
  dateLabel: string;
  tracks: ParsedTrack[];
}): string {
  const { num, guest, dateLabel, tracks } = opts;
  const names = uniqueNames(tracks);
  const heading = guest
    ? `Wh0 Plays Sessions Episode ${num} with ${guest}`
    : `Wh0 Plays Sessions Episode ${num}`;
  const description = `${heading}. ${tracks.length} house and tech house tracks featuring ${names} and more.`;
  const trackLines = tracks
    .map(
      (t) =>
        `    { position: ${t.position}, timestamp: "${esc(t.timestamp)}", artist: "${esc(
          t.artist,
        )}", title: "${esc(t.title)}", label: "Wh0 Plays" },`,
    )
    .join('\n');

  return `/**
 * ${heading}
 *
 * AUTO-GENERATED by scripts/new-show.ts — regenerate rather than hand-editing
 * the boilerplate; tracklist edits here are safe.
 */

import { ArrowLeft, Calendar, Clock, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import TrackAffiliateLinks from '@/components/TrackAffiliateLinks';
import { Link } from 'react-router-dom';
import Wh0SessionNav from '@/components/Wh0SessionNav';
import { useState, useEffect } from 'react';

interface Track {
  position: number;
  title: string;
  artist: string;
  timestamp: string;
  label: string;
}

const Wh0PlaysSession${num} = () => {
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = '/images/wh0-plays-sessions-logo.jpg';
  }, []);

  const tracks: Track[] = [
${trackLines}
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO
        title="${esc(heading)} Tracklist | Dance One Radio"
        description="${esc(description).slice(0, 300)}"
        image="https://danceoneradio.com/lovable-uploads/mario-show.jpg"
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />
      <div
        className={\`fixed inset-0 z-0 opacity-20 transition-opacity duration-500 \${
          bgLoaded ? 'opacity-20' : 'opacity-0'
        }\`}
        style={{
          backgroundImage: 'url(/images/wh0-plays-sessions-logo.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />

      <div className="relative z-10">
        <Navigation />

      <main className="pt-16">
        <section className="py-6 sm:py-12 relative">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Link to="/shows">
                <Button variant="ghost" className="mb-4 hover:text-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Shows
                </Button>
              </Link>
              <Wh0SessionNav current={${num}} className="mt-4" />
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <img
                  src="/images/wh0-plays-sessions-logo.jpg"
                  alt="${esc(heading)}"
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                  loading="eager"
                  width="320"
                  height="320"
                  decoding="async"
                  srcSet="/images/wh0-plays-sessions-logo-480w.jpg 480w, /images/wh0-plays-sessions-logo-960w.jpg 960w, /images/wh0-plays-sessions-logo-1440w.jpg 1440w, /images/wh0-plays-sessions-logo.jpg 1920w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <h1 className="text-3xl md:text-5xl font-['Orbitron'] font-bold mb-4 text-center">
                <span className="text-neon">Wh0 Plays Sessions</span>{" "}
                <span className="text-neon-purple">${num}</span>
              </h1>
${
  guest
    ? `              <p className="text-center text-lg text-muted-foreground mb-6">
                with <span className="text-neon font-semibold">${esc(guest)}</span>
              </p>
`
    : ''
}
              <Card className="card-cyber p-3 sm:p-6 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-muted-foreground text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neon" />
                    <span>${dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-neon-purple" />
                    <span>60 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      House • Tech House • Dance
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    ${esc(description)}
                  </p>

                  <div className="mt-4">
                    <SocialShare
                      url={typeof window !== 'undefined' ? window.location.href : ''}
                      title="${esc(heading)} - Dance One Radio"
                      description="${esc(heading)} - ${tracks.length} tracks of house heat."
                      image={\`\${typeof window !== 'undefined' ? window.location.origin : ''}/lovable-uploads/mario-show.jpg\`}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <GoogleAds key="wh0-${num}-ad" slot={AD_SLOTS.IN_CONTENT} />

        <section className="py-6 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Orbitron'] font-bold mb-4 sm:mb-8 text-center">
                <span className="text-neon-purple">Track Listing</span>
              </h2>

              <div className="grid gap-3">
                {tracks.map((track) => (
                  <Card key={track.position} className="card-cyber p-2 sm:p-4 hover:scale-[1.01] transition-all duration-200 group">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-neon/20 to-neon-purple/20 border border-neon/30 rounded-full flex items-center justify-center text-neon font-['Orbitron'] font-bold text-xs sm:text-sm shrink-0">
                        {track.position}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold text-primary group-hover:text-neon transition-colors break-words sm:truncate">
                          {track.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words sm:truncate">
                          {track.artist}
                        </p>
                        {track.label && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5">
                            {track.label}
                          </p>
                        )}
                        {track.timestamp && (
                          <p className="text-[10px] sm:text-xs text-neon/60 font-mono mt-0.5">
                            {track.timestamp}
                          </p>
                        )}
                        <div className="sm:hidden">
                          <TrackAffiliateLinks title={track.title} artist={track.artist} variant="mobile" />
                        </div>
                      </div>

                      <div className="hidden sm:block">
                        <TrackAffiliateLinks title={track.title} artist={track.artist} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
        <GoogleAds key="wh0-${num}-tracklist-ad" slot={AD_SLOTS.AFTER_TRACKLIST} format="rectangle" />
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <Wh0SessionNav current={${num}} />
          </div>
        </div>
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default Wh0PlaysSession${num};
`;
}

/* ------------------------------------------------------------- wiring up */

function wireWh0(num: number, guest: string | undefined, broadcastDate: string, tracks: ParsedTrack[]) {
  // 1) Wh0SessionNav SESSIONS list
  const navPath = 'src/components/Wh0SessionNav.tsx';
  let nav = read(navPath);
  if (!new RegExp(`\\b${num}\\b`).test(nav.split('\n').find((l) => l.startsWith('const SESSIONS')) ?? '')) {
    nav = nav.replace(/const SESSIONS = \[([^\]]*)\]/, (_m, list) => `const SESSIONS = [${list.trim().replace(/,$/, '')}, ${num}]`);
    queueWrite(navPath, nav);
  }

  // 2) wh0Sessions.ts feed entry (newest first)
  const dataPath = 'src/data/wh0Sessions.ts';
  let data = read(dataPath);
  if (!data.includes(`number: ${num},`)) {
    const blurb = `${tracks.length} tracks • ${uniqueNames(tracks, 8)} & more`;
    const entry = `  {
    number: ${num},
    title: 'Wh0 Plays Sessions Episode ${num}${guest ? ` with ${guest}` : ''}',
    ${guest ? `guest: '${guest.replace(/'/g, "\\'")}',` : `blurb: '${blurb.replace(/'/g, "\\'")}',`}
    link: '/show/wh0-plays-sessions/${num}',
    broadcastDate: '${broadcastDate}',
    genres: 'House • Tech House • Dance',
  },
`;
    data = data.replace('export const WH0_SESSIONS: Wh0Session[] = [\n', `export const WH0_SESSIONS: Wh0Session[] = [\n${entry}`);
    queueWrite(dataPath, data);
  }

  // 3) Routing
  wireRoute(
    `const Wh0PlaysSession${num} = lazy(() => import('@/pages/Wh0PlaysSession${num}'));`,
    /const Wh0PlaysSession\d+ = lazy\(\(\) => import\('@\/pages\/Wh0PlaysSession\d+'\)\);/g,
    `        <Route path="/show/wh0-plays-sessions/${num}" element={<PageTransition><Wh0PlaysSession${num} /></PageTransition>} />`,
    /^.*<Route path="\/show\/wh0-plays-sessions\/\d+".*$/gm,
    `/show/wh0-plays-sessions/${num}`,
  );

  // 4) Sitemap
  addSitemapUrl(`https://danceoneradio.com/show/wh0-plays-sessions/${num}`, 0.7);
}

function wireRoute(
  lazyLine: string,
  lazyPattern: RegExp,
  routeLine: string,
  routePattern: RegExp,
  routePath: string,
) {
  const routesPath = 'src/components/AnimatedRoutes.tsx';
  let routes = pending.find((p) => p.file === routesPath)?.content ?? read(routesPath);

  if (!routes.includes(lazyLine)) {
    const lazyMatches = [...routes.matchAll(lazyPattern)];
    const last = lazyMatches[lazyMatches.length - 1];
    if (!last) throw new Error('Could not locate lazy imports in AnimatedRoutes.tsx');
    const at = last.index! + last[0].length;
    routes = routes.slice(0, at) + '\n' + lazyLine + routes.slice(at);
  }

  if (!routes.includes(`path="${routePath}"`)) {
    const routeMatches = [...routes.matchAll(routePattern)];
    const last = routeMatches[routeMatches.length - 1];
    if (!last) throw new Error('Could not locate sibling routes in AnimatedRoutes.tsx');
    const at = last.index! + last[0].length;
    routes = routes.slice(0, at) + '\n' + routeLine + routes.slice(at);
  }

  const idx = pending.findIndex((p) => p.file === routesPath);
  if (idx >= 0) pending[idx].content = routes;
  else queueWrite(routesPath, routes);
}

function addSitemapUrl(loc: string, priority: number) {
  const sitemapPath = 'public/sitemap.xml';
  let xml = pending.find((p) => p.file === sitemapPath)?.content ?? read(sitemapPath);
  if (xml.includes(`<loc>${loc}</loc>`)) return;
  const today = ymd(new Date());
  const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  xml = xml.replace('</urlset>', `${entry}</urlset>`);
  const idx = pending.findIndex((p) => p.file === sitemapPath);
  if (idx >= 0) pending[idx].content = xml;
  else queueWrite(sitemapPath, xml);
}

/* -------------------------------------------------------- fda generation */

async function fetchLatestRssEpisode(): Promise<{ number: number; audioUrl: string; date: Date } | null> {
  try {
    const res = await fetch(`${RSS_FEED_URL}?t=${Date.now()}`);
    if (!res.ok) return null;
    const xml = await res.text();
    const item = xml.match(/<item>([\s\S]*?)<\/item>/)?.[1];
    if (!item) return null;
    const title = (item.match(/<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/) ?? [])
      .slice(1)
      .find(Boolean) as string | undefined;
    const number = parseInt(title?.match(/(\d{3,4})/)?.[1] ?? '0', 10);
    const audioUrl = item.match(/<enclosure url="([^"]+)"/)?.[1] ?? '';
    const pub = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
    return { number, audioUrl, date: pub ? new Date(pub) : new Date() };
  } catch {
    return null;
  }
}

function fdaPageSource(opts: { num: number; prevNum: number; dateLabel: string; audioUrl: string; tracks: ParsedTrack[] }) {
  const { num, prevNum, dateLabel, audioUrl, tracks } = opts;
  const prev = read(`src/pages/Episode${prevNum}.tsx`);
  let out = prev;
  out = out.replace(new RegExp(`Episode${prevNum}\\b`, 'g'), `Episode${num}`);
  out = out.replace(new RegExp(`\\b${prevNum}\\b`, 'g'), String(num));
  out = out.replace(/const audioUrl = "[^"]*"/, `const audioUrl = "${audioUrl}"`);
  out = out.replace(
    /<span>[A-Z][a-z]+ \d{1,2}, \d{4}<\/span>/,
    `<span>${dateLabel}</span>`,
  );
  out = out.replace(
    /description="Episode \d+ tracklist[^"]*"/,
    `description="Episode ${num} tracklist featuring ${uniqueNames(tracks, 8)} and more."`,
  );
  return out;
}

function fdaTracksSql(num: number, tracks: ParsedTrack[]): string {
  const values = tracks
    .map(
      (t) =>
        `  (${num}, ${t.position}, '${t.title.replace(/'/g, "''")}', '${t.artist.replace(/'/g, "''")}', ${
          t.timestamp ? `'${t.timestamp}'` : 'NULL'
        })`,
    )
    .join(',\n');
  return `-- Tracklist for episode ${num}\ninsert into public.show_tracks (episode_number, position, title, artist, timestamp)\nvalues\n${values};\n`;
}

/* ------------------------------------------------------------------ main */

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) {
    console.log('Paste the tracklist, then press Ctrl-D:');
  }
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf-8');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const raw = args.tracksFile ? fs.readFileSync(args.tracksFile, 'utf-8') : await readStdin();
  const tracks = parseTracklist(raw);
  if (tracks.length === 0) {
    console.error('No tracks found in the pasted list.');
    process.exit(1);
  }

  if (args.brand === 'wh0') {
    const nums = existingNumbers('Wh0PlaysSession');
    const latest = nums[nums.length - 1];
    const num = args.number ?? latest + 1;
    if (fs.existsSync(path.join(ROOT, 'src', 'pages', `Wh0PlaysSession${num}.tsx`))) {
      console.error(`Wh0PlaysSession${num}.tsx already exists.`);
      process.exit(1);
    }

    const latestDate =
      read('src/data/wh0Sessions.ts').match(/broadcastDate: '([\d\-T:]+)'/)?.[1] ?? isoLocal(new Date());
    const date = args.date
      ? new Date(`${args.date}T18:00:00`)
      : nextFridayAfter(new Date(latestDate));

    queueWrite(
      `src/pages/Wh0PlaysSession${num}.tsx`,
      wh0PageSource({ num, guest: args.guest, dateLabel: longDate(date), tracks }),
    );
    wireWh0(num, args.guest, isoLocal(date), tracks);

    console.log(`Wh0 Plays Sessions ${num} — ${longDate(date)} ${STATION_TZ_LABEL} — ${tracks.length} tracks`);
  } else {
    const nums = existingNumbers('Episode');
    const prevNum = nums[nums.length - 1];
    const rss = await fetchLatestRssEpisode();
    const num = args.number ?? Math.max(prevNum + 1, rss?.number ?? 0);
    if (fs.existsSync(path.join(ROOT, 'src', 'pages', `Episode${num}.tsx`))) {
      console.error(`Episode${num}.tsx already exists.`);
      process.exit(1);
    }
    const audioUrl = args.audio ?? (rss && rss.number === num ? rss.audioUrl : '');
    if (!audioUrl) {
      console.warn('⚠️  No audio URL found in the RSS feed yet — pass --audio once the episode is published.');
    }
    const date = args.date ? new Date(`${args.date}T18:00:00`) : nextFridayAfter(new Date());

    queueWrite(
      `src/pages/Episode${num}.tsx`,
      fdaPageSource({ num, prevNum, dateLabel: longDate(date), audioUrl, tracks }),
    );
    wireRoute(
      `const Episode${num} = lazy(() => import('@/pages/Episode${num}'));`,
      /const Episode\d+ = lazy\(\(\) => import\('@\/pages\/Episode\d+'\)\);/g,
      `        <Route path="/episode/${num}" element={<PageTransition><Episode${num} /></PageTransition>} />`,
      /^.*<Route path="\/episode\/\d+".*$/gm,
      `/episode/${num}`,
    );
    addSitemapUrl(`https://danceoneradio.com/episode/${num}`, 0.8);

    // Shows feed: register the dedicated page
    const showsPath = 'src/pages/Shows.tsx';
    let shows = read(showsPath);
    if (!new RegExp(`availableEpisodePages = \\[[^\\]]*\\b${num}\\b`).test(shows)) {
      shows = shows.replace(
        /const availableEpisodePages = \[([^\]]*)\]/,
        (_m, list) => `const availableEpisodePages = [${list.trim().replace(/,$/, '')}, ${num}]`,
      );
      queueWrite(showsPath, shows);
    }

    const sqlPath = `scripts/output/episode-${num}-tracks.sql`;
    queueWrite(sqlPath, fdaTracksSql(num, tracks));
    console.log(`Future Dance Anthems ${num} — ${longDate(date)} — ${tracks.length} tracks`);
    console.log(`Tracklist SQL written to ${sqlPath} (run it against the database to fill the tracklist).`);
  }

  for (const { file, content } of pending) {
    if (args.dryRun) {
      console.log(`[dry-run] would write ${file} (${content.length} bytes)`);
    } else {
      fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
      fs.writeFileSync(path.join(ROOT, file), content);
      console.log(`updated ${file}`);
    }
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
