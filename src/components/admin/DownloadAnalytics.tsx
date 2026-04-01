import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DownloadStats {
  total_downloads: number;
  downloads_today: number;
  downloads_this_week: number;
  downloads_this_month: number;
}

const DownloadAnalytics = () => {
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_download_stats');
        if (!error && data && data.length > 0) {
          setStats(data[0] as DownloadStats);
        }
      } catch (err) {
        console.error('Failed to fetch download stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Download className="h-5 w-5 text-primary" />
            Windows Downloads
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Download className="h-5 w-5 text-primary" />
          Windows Downloads
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-background/50 p-4 text-center">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.total_downloads ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-lg border bg-background/50 p-4 text-center">
            <Clock className="h-5 w-5 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.downloads_today ?? 0}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div className="rounded-lg border bg-background/50 p-4 text-center">
            <Calendar className="h-5 w-5 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.downloads_this_week ?? 0}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          <div className="rounded-lg border bg-background/50 p-4 text-center">
            <Calendar className="h-5 w-5 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.downloads_this_month ?? 0}</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadAnalytics;
