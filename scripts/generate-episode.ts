#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';

interface Episode {
  number: number;
  title: string;
  date: string;
  duration: string;
  audioUrl: string;
  description: string;
}

const RSS_FEED_URL = 'https://www.blubrry.com/feeds/futureDanceAnthems.xml';

async function fetchRSSFeed(): Promise<string> {
  console.log('Fetching RSS feed...');
  const response = await fetch(RSS_FEED_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
  }
  return await response.text();
}

function parseEpisodeFromRSS(rssContent: string): Episode | null {
  // Extract the most recent episode from RSS feed
  const episodeMatch = rssContent.match(/<item>([\s\S]*?)<\/item>/);
  if (!episodeMatch) return null;

  const item = episodeMatch[1];
  
  // Extract episode number from title (e.g., "Anthems of the week 396")
  const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
  const title = titleMatch ? titleMatch[1] : '';
  const numberMatch = title.match(/(\d+)/);
  const episodeNumber = numberMatch ? parseInt(numberMatch[1]) : 0;

  // Extract description
  const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
  const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';

  // Extract audio URL
  const audioMatch = item.match(/<enclosure url="([^"]+)"/);
  const audioUrl = audioMatch ? audioMatch[1] : '';

  // Extract duration
  const durationMatch = item.match(/<itunes:duration>(\d+)<\/itunes:duration>/);
  const durationSeconds = durationMatch ? parseInt(durationMatch[1]) : 0;
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Extract publish date
  const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
  const pubDate = dateMatch ? new Date(dateMatch[1]) : new Date();
  const date = pubDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return {
    number: episodeNumber,
    title,
    date,
    duration,
    audioUrl,
    description
  };
}

function episodeExists(episodeNumber: number): boolean {
  const filePath = path.join(process.cwd(), 'src', 'pages', `Episode${episodeNumber}.tsx`);
  return fs.existsSync(filePath);
}

function generateEpisodeFile(episode: Episode): string {
  return `import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Apple } from "lucide-react";
import SocialShare from "@/components/SocialShare";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { useListeningProgress } from "@/hooks/useListeningProgress";
import GoogleAds from "@/components/GoogleAds";

const Episode${episode.number} = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const episodeData = {
    number: ${episode.number},
    title: "${episode.title}",
    audioUrl: "${episode.audioUrl}",
    duration: "${episode.duration}"
  };

  const { progress, handleTimeUpdate, handleLoadedMetadata } = useListeningProgress(
    episodeData,
    user
  );

  return (
    <>
      <SEO 
        title="Anthems of the week ${episode.number} - Future Dance Anthems with Mario | Dance One Radio"
        description="${episode.description}"
        image="/lovable-uploads/mario-show.jpg"
        url={\`https://danceoneradio.com/episode/${episode.number}\`}
        type="music.radio_station"
        keywords="dance music podcast, EDM podcast, electronic music, trance music, house music, episode ${episode.number}, Future Dance Anthems"
      />
      
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        <Navigation />
        
        <main className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/shows')}
            className="mb-6 text-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Shows
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-border/50 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-['Orbitron'] font-bold mb-2 text-neon">
                    Episode ${episode.number}
                  </h1>
                  <p className="text-muted-foreground font-['Rajdhani']">
                    ${episode.date} • ${episode.duration}
                  </p>
                </div>
                <SocialShare 
                  url={\`https://danceoneradio.com/episode/${episode.number}\`}
                  title="${episode.title}"
                />
              </div>

              <div className="mb-8">
                <audio
                  controls
                  className="w-full"
                  src="${episode.audioUrl}"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  ref={(audio) => {
                    if (audio && progress > 0) {
                      audio.currentTime = progress;
                    }
                  }}
                  onPause={() => {
                    if (!user) {
                      setShowLoginPrompt(true);
                    }
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
                {progress > 0 && user && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Resume from {Math.floor(progress / 60)}:{String(Math.floor(progress % 60)).padStart(2, '0')}
                  </p>
                )}
              </div>

              <div className="mb-8">
                <a 
                  href="https://podcasts.apple.com/us/podcast/future-dance-anthems-with-mario/id1439656478"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-['Rajdhani']"
                >
                  <Apple className="w-5 h-5" />
                  Listen on Apple Podcasts
                </a>
              </div>

              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-['Orbitron'] font-bold mb-4 text-neon-purple">
                  Track Listing
                </h2>
                <div className="space-y-2 font-['Rajdhani']">
                  {/* TODO: Add track listing here after CSV import */}
                  <p className="text-muted-foreground italic">
                    Track listing will be added after CSV import
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <GoogleAds slot="episode-bottom" format="horizontal" />
            </div>
          </div>
        </main>

        <LoginPrompt 
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
        />

        <Footer />
      </div>
    </>
  );
};

export default Episode${episode.number};
`;
}

function updateAppRouting(episodeNumber: number): void {
  const appPath = path.join(process.cwd(), 'src', 'App.tsx');
  let appContent = fs.readFileSync(appPath, 'utf-8');

  // Add import
  const importStatement = `import Episode${episodeNumber} from "./pages/Episode${episodeNumber}";`;
  const lastImportMatch = appContent.match(/import Episode\d+ from "\.\/pages\/Episode\d+";/g);
  
  if (lastImportMatch) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    appContent = appContent.replace(lastImport, `${lastImport}\n${importStatement}`);
  } else {
    // Insert after other page imports
    const indexImport = 'import Index from "./pages/Index";';
    appContent = appContent.replace(indexImport, `${indexImport}\n${importStatement}`);
  }

  // Add route
  const routeStatement = `            <Route path="/episode/${episodeNumber}" element={<Episode${episodeNumber} />} />`;
  const lastRouteMatch = appContent.match(/\s+<Route path="\/episode\/\d+" element={<Episode\d+ \/>} \/>/g);
  
  if (lastRouteMatch) {
    const lastRoute = lastRouteMatch[lastRouteMatch.length - 1];
    appContent = appContent.replace(lastRoute, `${lastRoute}\n${routeStatement}`);
  }

  fs.writeFileSync(appPath, appContent, 'utf-8');
  console.log('✓ Updated App.tsx routing');
}

function updatePrerenderConfig(episode: Episode): void {
  const prerenderPath = path.join(process.cwd(), 'scripts', 'generate-prerender.ts');
  let prerenderContent = fs.readFileSync(prerenderPath, 'utf-8');

  // Find the routes array and add new episode
  const newRoute = `  {
    path: '/episode/${episode.number}',
    title: 'Anthems of the week ${episode.number} - Future Dance Anthems with Mario | Dance One Radio',
    description: '${episode.description}',
    image: '/lovable-uploads/mario-show.jpg'
  },`;

  // Find the last episode route
  const lastEpisodeMatch = prerenderContent.match(/\s+{\s+path: '\/episode\/\d+',[\s\S]*?image: '[^']+'\s+},/g);
  
  if (lastEpisodeMatch) {
    const lastEpisode = lastEpisodeMatch[lastEpisodeMatch.length - 1];
    prerenderContent = prerenderContent.replace(lastEpisode, `${lastEpisode}\n${newRoute}`);
  }

  fs.writeFileSync(prerenderPath, prerenderContent, 'utf-8');
  console.log('✓ Updated prerender configuration');
}

async function main() {
  try {
    console.log('🚀 Starting automated episode generation...\n');

    // Fetch and parse RSS feed
    const rssContent = await fetchRSSFeed();
    const episode = parseEpisodeFromRSS(rssContent);

    if (!episode) {
      console.error('❌ Could not parse episode data from RSS feed');
      process.exit(1);
    }

    console.log(`\n📻 Found Episode ${episode.number}: ${episode.title}`);
    console.log(`   Date: ${episode.date}`);
    console.log(`   Duration: ${episode.duration}`);
    console.log(`   Audio: ${episode.audioUrl.substring(0, 50)}...`);

    // Check if episode already exists
    if (episodeExists(episode.number)) {
      console.log(`\n⚠️  Episode ${episode.number} already exists. Skipping generation.`);
      process.exit(0);
    }

    // Generate episode file
    console.log('\n📝 Generating episode file...');
    const episodeContent = generateEpisodeFile(episode);
    const episodePath = path.join(process.cwd(), 'src', 'pages', `Episode${episode.number}.tsx`);
    fs.writeFileSync(episodePath, episodeContent, 'utf-8');
    console.log(`✓ Created ${episodePath}`);

    // Update routing
    console.log('\n🔄 Updating routing configuration...');
    updateAppRouting(episode.number);

    // Update prerender config
    console.log('\n🔧 Updating prerender configuration...');
    updatePrerenderConfig(episode);

    console.log('\n✅ Episode generation complete!');
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Review the generated file: src/pages/Episode${episode.number}.tsx`);
    console.log(`   2. Import track listing CSV to add tracks`);
    console.log(`   3. Test the episode page at /episode/${episode.number}`);
    console.log(`   4. Commit and deploy the changes\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
