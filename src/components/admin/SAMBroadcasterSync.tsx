import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Database, Loader2, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ParsedTrack {
  track_order: number;
  artist: string;
  title: string;
  played_at: string | null;
  duration_seconds: number | null;
}

const SAMBroadcasterSync = () => {
  const [tracks, setTracks] = useState<ParsedTrack[]>([]);
  const [episodeNumber, setEpisodeNumber] = useState<string>('');
  const [inserting, setInserting] = useState(false);
  const [inserted, setInserted] = useState(false);
  const [existingCount, setExistingCount] = useState<number | null>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): ParsedTrack[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: ParsedTrack[] = [];
    let order = 1;

    // Detect if first line is a header
    const firstLine = lines[0]?.toLowerCase() || '';
    const startIndex = (firstLine.includes('artist') || firstLine.includes('title') || firstLine.includes('song')) ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Support tab, comma, and pipe separators
      const separator = line.includes('\t') ? '\t' : line.includes('|') ? '|' : ',';
      const parts = line.split(separator).map(p => p.trim().replace(/^["']|["']$/g, ''));

      if (parts.length >= 2) {
        const artist = parts[0];
        const title = parts[1];
        // Optional: duration in seconds (column 3), played_at timestamp (column 4)
        const durationRaw = parts[2]?.trim();
        const playedAtRaw = parts[3]?.trim();

        if (artist && title) {
          parsed.push({
            track_order: order++,
            artist,
            title,
            duration_seconds: durationRaw ? parseInt(durationRaw) || null : null,
            played_at: playedAtRaw || null,
          });
        }
      }
    }

    return parsed;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedTracks = parseCSV(text);
      setTracks(parsedTracks);
      setInserted(false);
      setExistingCount(null);

      toast({
        title: "CSV Parsed",
        description: `Found ${parsedTracks.length} tracks`,
      });
    };
    reader.readAsText(file);
  };

  const checkExisting = async (epNum: number) => {
    const { count } = await supabase
      .from('show_tracks')
      .select('*', { count: 'exact', head: true })
      .eq('episode_number', epNum);
    setExistingCount(count ?? 0);
    return count ?? 0;
  };

  const handleEpisodeChange = async (value: string) => {
    setEpisodeNumber(value);
    setInserted(false);
    const num = parseInt(value);
    if (num > 0) {
      await checkExisting(num);
    } else {
      setExistingCount(null);
    }
  };

  const handleClearExisting = async () => {
    const epNum = parseInt(episodeNumber);
    if (!epNum) return;

    const { error } = await supabase
      .from('show_tracks')
      .delete()
      .eq('episode_number', epNum);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setExistingCount(0);
    toast({ title: "Cleared", description: `Removed existing tracks for episode ${epNum}` });
  };

  const handleInsert = async () => {
    const epNum = parseInt(episodeNumber);
    if (!epNum || tracks.length === 0) {
      toast({ title: "Missing data", description: "Enter an episode number and upload a CSV", variant: "destructive" });
      return;
    }

    setInserting(true);

    const rows = tracks.map(t => ({
      episode_number: epNum,
      track_order: t.track_order,
      artist: t.artist,
      title: t.title,
      duration_seconds: t.duration_seconds,
      played_at: t.played_at,
    }));

    const { error } = await supabase
      .from('show_tracks')
      .insert(rows);

    setInserting(false);

    if (error) {
      toast({ title: "Insert failed", description: error.message, variant: "destructive" });
      return;
    }

    setInserted(true);
    setExistingCount((prev) => (prev ?? 0) + tracks.length);
    toast({
      title: "Tracks synced!",
      description: `${tracks.length} tracks inserted for Episode ${epNum}`,
    });
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h2 className="text-2xl font-['Orbitron'] font-bold mb-2 text-neon">
        SAM Broadcaster → Database Sync
      </h2>
      <p className="text-sm text-muted-foreground font-['Rajdhani'] mb-4">
        Upload a SAM Broadcaster track history CSV to insert tracks directly into the database.
        Tracks will appear automatically on the episode page with affiliate links.
      </p>

      <div className="space-y-4">
        {/* Episode number input */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-['Rajdhani'] font-semibold whitespace-nowrap">
            Episode Number:
          </label>
          <Input
            type="number"
            min={1}
            value={episodeNumber}
            onChange={(e) => handleEpisodeChange(e.target.value)}
            placeholder="e.g. 408"
            className="w-32"
          />
          {existingCount !== null && existingCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {existingCount} tracks already exist
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearExisting}
                className="text-destructive text-xs h-7 px-2"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
          {existingCount === 0 && episodeNumber && (
            <span className="text-xs text-primary">No existing tracks</span>
          )}
        </div>

        {/* File upload */}
        <label
          htmlFor="sam-csv-upload"
          className="flex items-center justify-center w-full p-6 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
        >
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-['Rajdhani'] text-muted-foreground">
              Upload SAM Broadcaster track history CSV
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Format: Artist, Title [, Duration (sec), Played At]
            </p>
          </div>
          <input
            id="sam-csv-upload"
            type="file"
            accept=".csv,.txt,.tsv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Preview */}
        {tracks.length > 0 && (
          <>
            <div className="bg-background/50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <h3 className="font-['Rajdhani'] font-semibold mb-2">
                Preview ({tracks.length} tracks):
              </h3>
              <div className="space-y-1 text-sm font-['Rajdhani']">
                {tracks.map((track) => (
                  <p key={track.track_order} className="text-muted-foreground">
                    <span className="text-foreground font-medium">{track.track_order}.</span>{' '}
                    {track.artist} – {track.title}
                    {track.duration_seconds && (
                      <span className="text-xs ml-2 text-muted-foreground/70">
                        ({Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, '0')})
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </div>

            {/* Insert button */}
            <Button
              onClick={handleInsert}
              disabled={!episodeNumber || inserting || inserted}
              className="w-full gap-2"
            >
              {inserting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Inserting…
                </>
              ) : inserted ? (
                <>
                  <Check className="w-4 h-4" />
                  Synced to Database
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Insert {tracks.length} Tracks into Episode {episodeNumber || '?'}
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default SAMBroadcasterSync;
