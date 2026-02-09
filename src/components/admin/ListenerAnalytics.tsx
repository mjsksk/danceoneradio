import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Clock, Music, CheckCircle, Loader2 } from "lucide-react";

interface EpisodeAnalytics {
  episode_number: number;
  episode_title: string;
  unique_listeners: number;
  total_time_played: number;
  avg_progress: number;
  completions: number;
  last_activity: string;
}

interface ListenerSummary {
  total_unique_listeners: number;
  total_listening_hours: number;
  total_episodes_played: number;
  total_completions: number;
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

const ListenerAnalytics = () => {
  const [analytics, setAnalytics] = useState<EpisodeAnalytics[]>([]);
  const [summary, setSummary] = useState<ListenerSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, summaryRes] = await Promise.all([
          supabase.rpc("get_listener_analytics"),
          supabase.rpc("get_listener_summary"),
        ]);

        if (analyticsRes.data) setAnalytics(analyticsRes.data);
        if (summaryRes.data && summaryRes.data.length > 0)
          setSummary(summaryRes.data[0]);
      } catch (error) {
        console.error("Error fetching listener analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 font-['Rajdhani'] text-muted-foreground">
            Loading analytics...
          </span>
        </div>
      </Card>
    );
  }

  const summaryCards = [
    {
      label: "Unique Listeners",
      value: summary?.total_unique_listeners ?? 0,
      icon: Users,
    },
    {
      label: "Total Hours Listened",
      value: summary?.total_listening_hours ?? 0,
      icon: Clock,
    },
    {
      label: "Episodes Played",
      value: summary?.total_episodes_played ?? 0,
      icon: Music,
    },
    {
      label: "Completions",
      value: summary?.total_completions ?? 0,
      icon: CheckCircle,
    },
  ];

  return (
    <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
      <h2 className="text-2xl font-['Orbitron'] font-bold mb-6 text-neon-purple">
        Listener Analytics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-background/50 rounded-lg p-4 text-center"
          >
            <card.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-['Orbitron'] font-bold text-foreground">
              {card.value}
            </div>
            <div className="text-xs font-['Rajdhani'] text-muted-foreground">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {analytics.length === 0 ? (
        <p className="text-muted-foreground font-['Rajdhani'] text-center py-4">
          No listening data yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-['Rajdhani']">Episode</TableHead>
              <TableHead className="font-['Rajdhani']">Title</TableHead>
              <TableHead className="font-['Rajdhani'] text-center">
                Listeners
              </TableHead>
              <TableHead className="font-['Rajdhani'] text-center">
                Time Played
              </TableHead>
              <TableHead className="font-['Rajdhani'] text-center">
                Avg Progress
              </TableHead>
              <TableHead className="font-['Rajdhani'] text-center">
                Completions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analytics.map((ep) => (
              <TableRow key={ep.episode_number}>
                <TableCell className="font-['Orbitron'] font-bold">
                  #{ep.episode_number}
                </TableCell>
                <TableCell className="font-['Rajdhani']">
                  {ep.episode_title}
                </TableCell>
                <TableCell className="text-center font-['Rajdhani']">
                  {ep.unique_listeners}
                </TableCell>
                <TableCell className="text-center font-['Rajdhani']">
                  {formatTime(Number(ep.total_time_played))}
                </TableCell>
                <TableCell className="text-center font-['Rajdhani']">
                  {Number(ep.avg_progress).toFixed(1)}%
                </TableCell>
                <TableCell className="text-center font-['Rajdhani']">
                  {ep.completions}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};

export default ListenerAnalytics;
