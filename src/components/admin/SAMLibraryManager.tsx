import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, Search, RefreshCw, HardDrive, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';

function normalize(input: string): string {
  let s = input.toLowerCase().trim();
  s = s.replace(/\.(mp3|wav|flac|aac|ogg|m4a|wma)$/i, '');
  s = s.replace(/[\(\[](radio edit|original mix|extended mix|club mix|remix|vocal mix|dub mix|instrumental|clean|dirty|explicit|feat\.?[^)\]]*|ft\.?[^)\]]*)[\)\]]/gi, '');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/[^a-z0-9\s]/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

interface LibraryTrack {
  id: string;
  artist: string;
  title: string;
  filename: string;
  created_at: string;
}

export default function SAMLibraryManager() {
  const [tracks, setTracks] = useState<LibraryTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [matching, setMatching] = useState(false);

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sam_library')
        .select('id, artist, title, filename, created_at')
        .order('artist', { ascending: true });

      if (search) {
        query = query.or(`artist.ilike.%${search}%,title.ilike.%${search}%,filename.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(500);
      if (error) throw error;
      setTracks((data as LibraryTrack[]) || []);
    } catch (err) {
      console.error('Library fetch error:', err);
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchLibrary(); }, [fetchLibrary]);

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        const rows: Array<{
          artist: string;
          title: string;
          filename: string;
          normalized_artist: string;
          normalized_title: string;
        }> = [];

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Skip header-like lines
          if (/^(artist|filename|track|#)/i.test(trimmed)) continue;

          const tabs = trimmed.split('\t');
          let artist = '', title = '', filename = '';

          if (tabs.length >= 3) {
            artist = tabs[0].trim();
            title = tabs[1].trim();
            filename = tabs[2].trim();
          } else if (tabs.length === 2) {
            artist = tabs[0].trim();
            title = tabs[1].trim();
            filename = `${artist} - ${title}.mp3`;
          } else {
            // Single value — treat as filename, parse artist-title
            filename = trimmed;
            const nameOnly = filename.replace(/\.(mp3|wav|flac|aac|ogg|m4a|wma)$/i, '');
            // Strip directory path
            const baseName = nameOnly.replace(/^.*[\\/]/, '');
            const dashIdx = baseName.indexOf(' - ');
            if (dashIdx > 0) {
              artist = baseName.substring(0, dashIdx).trim();
              title = baseName.substring(dashIdx + 3).trim();
            } else {
              artist = baseName;
              title = baseName;
            }
          }

          if (!artist || !title || !filename) continue;

          // Send minimal fields — DB trigger handles all normalization & key generation
          rows.push({
            artist,
            title,
            filename: filename.trim(),
            normalized_artist: artist.toLowerCase().trim(),
            normalized_title: title.toLowerCase().trim(),
          });
        }

        if (rows.length === 0) {
          toast.error('No valid tracks found. Use one filename per line, e.g.: Artist - Title.mp3');
          return;
        }

        const batchSize = 100;
        let imported = 0;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const { error } = await supabase.from('sam_library').upsert(batch, {
            onConflict: 'filename',
          });
          if (error) {
            console.error('Upsert error:', error);
          } else {
            imported += batch.length;
          }
        }

        toast.success(`Imported ${imported} tracks to SAM library. Triggers will auto-generate matching keys.`);
        fetchLibrary();
      } catch (err) {
        console.error('Import error:', err);
        toast.error('Failed to import');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const runMatching = async () => {
    setMatching(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/match-song-requests`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      const result = await resp.json();
      if (!resp.ok) {
        toast.error(result.error || 'Matching failed');
        return;
      }

      const auto = result.results?.filter((r: any) => r.match_method === 'auto-matched').length || 0;
      const review = result.results?.filter((r: any) => r.match_method === 'needs-review').length || 0;
      const noMatch = result.results?.filter((r: any) => r.match_method === 'no-match').length || 0;

      toast.success(`Matched ${result.matched} requests: ${auto} auto, ${review} review, ${noMatch} no-match`);
    } catch (err) {
      console.error('Match error:', err);
      toast.error('Matching failed');
    } finally {
      setMatching(false);
    }
  };

  const deleteTrack = async (id: string) => {
    try {
      const { error } = await supabase.from('sam_library').delete().eq('id', id);
      if (error) throw error;
      setTracks(prev => prev.filter(t => t.id !== id));
      toast.success('Track removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 font-['Orbitron'] text-xl">
            <HardDrive className="w-5 h-5 text-primary" />
            SAM Library
            <Badge variant="secondary">{tracks.length} tracks</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={runMatching}
              disabled={matching}
              className="gap-1"
            >
              <Zap className="w-4 h-4" />
              {matching ? 'Matching...' : 'Run Matching'}
            </Button>
            <label>
              <Button variant="outline" size="sm" asChild disabled={importing}>
                <span className="cursor-pointer gap-1">
                  <Upload className="w-4 h-4" />
                  {importing ? 'Importing...' : 'Import CSV'}
                </span>
              </Button>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleCSVImport}
                className="hidden"
              />
            </label>
            <Button variant="outline" size="sm" onClick={fetchLibrary}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search library..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <p className="text-xs font-['Rajdhani'] text-muted-foreground">
            <strong>CSV Format:</strong> One track per line. Supports: <code>filename.mp3</code>, 
            <code>Artist - Title.mp3</code>, or tab-separated <code>Artist{'\t'}Title{'\t'}filename.mp3</code>.
            Filenames should be relative to <code>C:\D1Files\Dance Music</code>.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Library is empty. Import tracks via CSV.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artist</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-sm">{t.artist}</TableCell>
                    <TableCell className="text-sm">{t.title}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{t.filename}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => deleteTrack(t.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
