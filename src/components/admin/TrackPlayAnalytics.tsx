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
import { PlayCircle, Users, Globe, Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackPlayRow {
  title: string;
  artist: string;
  total_plays: number;
  unique_listeners: number;
  last_played: string;
}

interface TrackPlaySummary {
  total_plays: number;
  unique_listeners: number;
  top_country: string;
}

type PresetRange = "all" | "7d" | "30d" | "90d" | "custom";

const TrackPlayAnalytics = () => {
  const [rows, setRows] = useState<TrackPlayRow[]>([]);
  const [summary, setSummary] = useState<TrackPlaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<PresetRange>("30d");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const getDateRange = (): { start: string | null; end: string | null } => {
    if (preset === "all") return { start: null, end: null };
    if (preset === "7d") return { start: subDays(new Date(), 7).toISOString(), end: new Date().toISOString() };
    if (preset === "30d") return { start: subDays(new Date(), 30).toISOString(), end: new Date().toISOString() };
    if (preset === "90d") return { start: subMonths(new Date(), 3).toISOString(), end: new Date().toISOString() };
    return {
      start: startDate ? startOfDay(startDate).toISOString() : null,
      end: endDate ? endOfDay(endDate).toISOString() : null,
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const [rowsRes, summaryRes] = await Promise.all([
        supabase.rpc("get_track_play_analytics", { start_date: start, end_date: end }),
        supabase.rpc("get_track_play_summary", { start_date: start, end_date: end }),
      ]);

      if (rowsRes.data) setRows(rowsRes.data as TrackPlayRow[]);
      if (summaryRes.data && summaryRes.data.length > 0) setSummary(summaryRes.data[0] as TrackPlaySummary);
      else setSummary(null);
    } catch (e) {
      console.error("Error fetching track play analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [preset, startDate, endDate]);

  const summaryCards = [
    { label: "Total Plays", value: summary?.total_plays ?? 0, icon: PlayCircle },
    { label: "Unique Listeners", value: summary?.unique_listeners ?? 0, icon: Users },
    { label: "Top Country", value: summary?.top_country ?? "—", icon: Globe },
  ];

  return (
    <Card id="track-preview-plays" className="p-8 bg-card/50 backdrop-blur-sm border-2 border-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-['Orbitron'] font-bold text-neon-purple">
          Track Preview Plays
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
          <span className="ml-2 font-['Rajdhani'] text-muted-foreground">Loading...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-background/50 rounded-lg p-4 text-center">
                <card.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-['Orbitron'] font-bold text-foreground">{card.value}</div>
                <div className="text-xs font-['Rajdhani'] text-muted-foreground">{card.label}</div>
              </div>
            ))}
          </div>

          {rows.length === 0 ? (
            <p className="text-muted-foreground font-['Rajdhani'] text-center py-4">
              No track preview plays in this period.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-['Rajdhani']">Track</TableHead>
                  <TableHead className="font-['Rajdhani']">Artist</TableHead>
                  <TableHead className="font-['Rajdhani'] text-center">Plays</TableHead>
                  <TableHead className="font-['Rajdhani'] text-center">Unique Listeners</TableHead>
                  <TableHead className="font-['Rajdhani'] text-right">Last Played</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={`${r.title}-${r.artist}-${i}`}>
                    <TableCell className="font-['Rajdhani'] font-semibold">{r.title}</TableCell>
                    <TableCell className="font-['Rajdhani']">{r.artist}</TableCell>
                    <TableCell className="text-center font-['Rajdhani']">{r.total_plays}</TableCell>
                    <TableCell className="text-center font-['Rajdhani']">{r.unique_listeners}</TableCell>
                    <TableCell className="text-right font-['Rajdhani'] text-muted-foreground">
                      {format(new Date(r.last_played), "MMM d, yyyy HH:mm")}
                    </TableCell>
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

export default TrackPlayAnalytics;
