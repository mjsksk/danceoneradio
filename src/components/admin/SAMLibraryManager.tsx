import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HardDrive, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SAMLibraryManager() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [matchedCount, setMatchedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, matchedRes] = await Promise.all([
        supabase
          .from('song_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'approved')
          .is('sam_filename', null)
          .is('sam_imported_at', null),
        supabase
          .from('song_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'approved')
          .not('sam_filename', 'is', null),
      ]);
      setPendingCount(pendingRes.count ?? 0);
      setMatchedCount(matchedRes.count ?? 0);
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const copyScript = async () => {
    const url = `${window.location.origin}/downloads/sam-local-resolver.py`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Download URL copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 font-['Orbitron'] text-xl">
            <HardDrive className="w-5 h-5 text-primary" />
            SAM Local Resolver
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status badges */}
        <div className="flex gap-3 flex-wrap">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {pendingCount ?? '…'} awaiting match
          </Badge>
          <Badge variant="default" className="text-sm px-3 py-1">
            {matchedCount ?? '…'} matched
          </Badge>
        </div>

        {/* Architecture explanation */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
          <p className="text-sm font-['Rajdhani'] font-semibold text-foreground">
            How it works
          </p>
          <ol className="text-xs font-['Rajdhani'] text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Approved requests are stored in Supabase</li>
            <li>The local resolver (Python script on SAM PC) polls for unmatched requests</li>
            <li>It queries the <strong>live SAM MariaDB</strong> (samdb) for the best match</li>
            <li>Match results are reported back — <code>sam_filename</code> is populated</li>
            <li><code>sam-next-request</code> returns the matched file for SAM to queue</li>
          </ol>
          <p className="text-xs font-['Rajdhani'] text-muted-foreground mt-2">
            No CSV import needed — matching runs against the live SAM database.
          </p>
        </div>

        {/* Setup instructions */}
        <div className="bg-muted/50 border border-border/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-['Rajdhani'] font-semibold text-foreground">
            Setup on SAM PC
          </p>
          <div className="text-xs font-['Rajdhani'] text-muted-foreground space-y-1">
            <p>1. Install Python 3 and required packages:</p>
            <code className="block bg-background/80 rounded px-2 py-1 mt-1">
              pip install requests mysql-connector-python
            </code>
            <p className="mt-2">2. Download the resolver script:</p>
            <div className="flex items-center gap-2 mt-1">
              <code className="bg-background/80 rounded px-2 py-1 text-xs flex-1 truncate">
                sam-local-resolver.py
              </code>
              <Button variant="outline" size="sm" onClick={copyScript} className="h-7 gap-1">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy URL'}
              </Button>
            </div>
            <p className="mt-2">3. Set environment variables:</p>
            <code className="block bg-background/80 rounded px-2 py-1 mt-1 whitespace-pre">
{`set SAM_API_TOKEN=your_token_here
set SAM_DB_USER=root
set SAM_DB_PASS=your_db_password
set SAM_MUSIC_ROOT=C:\\D1Files\\Dance Music`}
            </code>
            <p className="mt-2">4. Run continuously:</p>
            <code className="block bg-background/80 rounded px-2 py-1 mt-1">
              python sam-local-resolver.py --loop
            </code>
          </div>
        </div>

        {/* Pending requests warning */}
        {pendingCount !== null && pendingCount > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <p className="text-sm font-['Rajdhani'] text-destructive font-semibold">
              ⚠ {pendingCount} approved request{pendingCount > 1 ? 's' : ''} awaiting local matching
            </p>
            <p className="text-xs font-['Rajdhani'] text-muted-foreground mt-1">
              Ensure the local SAM resolver is running on the SAM PC to match these requests.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
