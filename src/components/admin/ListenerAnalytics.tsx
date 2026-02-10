import { useState, useEffect } from "react";
import { format, subDays, subMonths, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Clock, Music, CheckCircle, Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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

type PresetRange = "all" | "7d" | "30d" | "90d" | "custom";

const ListenerAnalytics = () => {
  const [analytics, setAnalytics] = useState<EpisodeAnalytics[]>([]);
  const [summary, setSummary] = useState<ListenerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<PresetRange>("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const getDateRange = (): { start: string | null; end: string | null } => {
    if (preset === "all") return { start: null, end: null };
    if (preset === "7d") return { start: subDays(new Date(), 7).toISOString(), end: new Date().toISOString() };
    if (preset === "30d") return { start: subDays(new Date(), 30).toISOString(), end: new Date().toISOString() };
    if (preset === "90d") return { start: subMonths(new Date(), 3).toISOString(), end: new Date().toISOString() };
    // custom
    return {
      start: startDate ? startOfDay(startDate).toISOString() : null,
      end: endDate ? endOfDay(endDate).toISOString() : null,
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const [analyticsRes, summaryRes] = await Promise.all([
        supabase.rpc("get_listener_analytics", { start_date: start, end_date: end }),
        supabase.rpc("get_listener_summary", { start_date: start, end_date: end }),
      ]);

      if (analyticsRes.data) setAnalytics(analyticsRes.data);
      if (summaryRes.data && summaryRes.data.length > 0)
        setSummary(summaryRes.data[0]);
      else setSummary(null);
    } catch (error) {
      console.error("Error fetching listener analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [preset, startDate, endDate]);

  const summaryCards = [
    { label: "Unique Listeners", value: summary?.total_unique_listeners ?? 0, icon: Users },
    { label: "Total Hours Listened", value: summary?.total_listening_hours ?? 0, icon: Clock },
    { label: "Episodes Played", value: summary?.total_episodes_played ?? 0, icon: Music },
    { label: "Completions", value: summary?.total_completions ?? 0, icon: CheckCircle },
  ];

  return (
    <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-['Orbitron'] font-bold text-neon-purple">
          Listener Analytics
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={preset} onValueChange={(v) => setPreset(v as PresetRange)}>
            <SelectTrigger className="w-[140px] font-['Rajdhani']">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {preset === "custom" && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[130px] justify-start text-left font-['Rajdhani'] text-xs", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground font-['Rajdhani']">–</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[130px] justify-start text-left font-['Rajdhani'] text-xs", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 font-['Rajdhani'] text-muted-foreground">Loading analytics...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-background/50 rounded-lg p-4 text-center">
                <card.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-['Orbitron'] font-bold text-foreground">{card.value}</div>
                <div className="text-xs font-['Rajdhani'] text-muted-foreground">{card.label}</div>
              </div>
            ))}
          </div>

          {analytics.length === 0 ? (
            <p className="text-muted-foreground font-['Rajdhani'] text-center py-4">No listening data for this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-['Rajdhani']">Episode</TableHead>
                  <TableHead className="font-['Rajdhani']">Title</TableHead>
                  <TableHead className="font-['Rajdhani'] text-center">Listeners</TableHead>
                  <TableHead className="font-['Rajdhani'] text-center">Time Played</TableHead>
                  <TableHead className="font-['Rajdhani'] text-center">Avg Progress</TableHead>
                  <TableHead className="font-['Rajdhani'] text-center">Completions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map((ep) => (
                  <TableRow key={ep.episode_number}>
                    <TableCell className="font-['Orbitron'] font-bold">#{ep.episode_number}</TableCell>
                    <TableCell className="font-['Rajdhani']">{ep.episode_title}</TableCell>
                    <TableCell className="text-center font-['Rajdhani']">{ep.unique_listeners}</TableCell>
                    <TableCell className="text-center font-['Rajdhani']">{formatTime(Number(ep.total_time_played))}</TableCell>
                    <TableCell className="text-center font-['Rajdhani']">{Number(ep.avg_progress).toFixed(1)}%</TableCell>
                    <TableCell className="text-center font-['Rajdhani']">{ep.completions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </Card>
  );
};

export default ListenerAnalytics;
