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
import { Globe, Users, UserCheck, MapPin, Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountryAnalytics {
  country: string;
  country_code: string;
  total_visits: number;
  unique_visitors: number;
  returning_visitors: number;
}

interface VisitorSummary {
  total_visits: number;
  unique_visitors: number;
  returning_visitors: number;
  top_country: string | null;
}

type PresetRange = "all" | "7d" | "30d" | "90d" | "custom";

const VisitorAnalytics = () => {
  const [analytics, setAnalytics] = useState<CountryAnalytics[]>([]);
  const [summary, setSummary] = useState<VisitorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<PresetRange>("all");
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
      const [analyticsRes, summaryRes] = await Promise.all([
        supabase.rpc("get_visitor_analytics", { start_date: start, end_date: end } as any),
        supabase.rpc("get_visitor_summary", { start_date: start, end_date: end } as any),
      ]);

      if (analyticsRes.data) setAnalytics(analyticsRes.data as any);
      if (summaryRes.data && (summaryRes.data as any[]).length > 0)
        setSummary((summaryRes.data as any[])[0]);
      else setSummary(null);
    } catch (error) {
      console.error("Error fetching visitor analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [preset, startDate, endDate]);

  const maxVisits = analytics.length > 0 ? Math.max(...analytics.map((a) => a.total_visits)) : 1;

  const summaryCards = [
    { label: "Total Visits", value: summary?.total_visits ?? 0, icon: Globe },
    { label: "Unique Visitors", value: summary?.unique_visitors ?? 0, icon: Users },
    { label: "Returning Visitors", value: summary?.returning_visitors ?? 0, icon: UserCheck },
    { label: "Top Country", value: summary?.top_country ?? "–", icon: MapPin },
  ];

  return (
    <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-['Orbitron'] font-bold text-neon-purple">
          Visitor Analytics
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
                <div className="text-2xl font-['Orbitron'] font-bold text-foreground">
                  {card.value}
                </div>
                <div className="text-xs font-['Rajdhani'] text-muted-foreground">{card.label}</div>
              </div>
            ))}
          </div>

          {analytics.length === 0 ? (
            <p className="text-muted-foreground font-['Rajdhani'] text-center py-4">No visitor data for this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-['Rajdhani']">Country</TableHead>
                  <TableHead className="font-['Rajdhani'] text-center">Visits</TableHead>
                  <TableHead className="font-['Rajdhani'] text-center">Unique</TableHead>
                  <TableHead className="font-['Rajdhani'] text-center">Returning</TableHead>
                  <TableHead className="font-['Rajdhani'] hidden sm:table-cell">Distribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map((row) => (
                  <TableRow key={row.country_code}>
                    <TableCell className="font-['Rajdhani'] font-semibold">
                      {row.country_code !== "??" && (
                        <span className="mr-2">{getFlagEmoji(row.country_code)}</span>
                      )}
                      {row.country}
                    </TableCell>
                    <TableCell className="text-center font-['Rajdhani']">{row.total_visits}</TableCell>
                    <TableCell className="text-center font-['Rajdhani']">{row.unique_visitors}</TableCell>
                    <TableCell className="text-center font-['Rajdhani']">{row.returning_visitors}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(row.total_visits / maxVisits) * 100}%` }}
                        />
                      </div>
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

function getFlagEmoji(countryCode: string): string {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "";
  }
}

export default VisitorAnalytics;
