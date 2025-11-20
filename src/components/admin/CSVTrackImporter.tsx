import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Track {
  artist: string;
  title: string;
}

const CSVTrackImporter = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedTracks = parseCSV(text);
      setTracks(parsedTracks);
      
      toast({
        title: "CSV Imported",
        description: `Successfully imported ${parsedTracks.length} tracks`,
      });
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string): Track[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const tracks: Track[] = [];

    for (const line of lines) {
      // Support both comma and tab-separated values
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      
      if (parts.length >= 2) {
        const artist = parts[0].trim().replace(/^["']|["']$/g, '');
        const title = parts[1].trim().replace(/^["']|["']$/g, '');
        
        if (artist && title) {
          tracks.push({ artist, title });
        }
      }
    }

    return tracks;
  };

  const generateJSX = (): string => {
    if (tracks.length === 0) return '';

    return tracks
      .map((track, index) => 
        `                  <p key={${index + 1}}>${index + 1}. ${track.artist} - ${track.title}</p>`
      )
      .join('\n');
  };

  const copyToClipboard = async () => {
    const jsx = generateJSX();
    await navigator.clipboard.writeText(jsx);
    setCopied(true);
    
    toast({
      title: "Copied!",
      description: "Track listing JSX copied to clipboard",
    });

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h2 className="text-2xl font-['Orbitron'] font-bold mb-4 text-neon">
        CSV Track Importer
      </h2>
      
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="csv-upload" 
            className="flex items-center justify-center w-full p-6 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
          >
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-['Rajdhani'] text-muted-foreground">
                Click to upload CSV file
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Format: Artist, Title (one track per line)
              </p>
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {tracks.length > 0 && (
          <>
            <div className="bg-background/50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <h3 className="font-['Rajdhani'] font-semibold mb-2">
                Preview ({tracks.length} tracks):
              </h3>
              <div className="space-y-1 text-sm font-['Rajdhani']">
                {tracks.map((track, index) => (
                  <p key={index}>
                    {index + 1}. {track.artist} - {track.title}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-['Rajdhani'] font-semibold">
                  Generated JSX:
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy JSX
                    </>
                  )}
                </Button>
              </div>
              <pre className="text-xs overflow-x-auto bg-background/50 p-3 rounded max-h-48 overflow-y-auto">
                <code>{generateJSX()}</code>
              </pre>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-['Rajdhani']">
                <strong>Instructions:</strong>
              </p>
              <ol className="text-sm font-['Rajdhani'] mt-2 space-y-1 list-decimal list-inside">
                <li>Click "Copy JSX" above</li>
                <li>Open the episode file in your code editor</li>
                <li>Find the "Track Listing" section</li>
                <li>Replace the TODO comment with the copied JSX</li>
                <li>Save and refresh to see the tracks</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default CSVTrackImporter;
