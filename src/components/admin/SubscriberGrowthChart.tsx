import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Calendar, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval, parseISO } from 'date-fns';

interface ChartDataPoint {
  date: string;
  displayDate: string;
  count: number;
  cumulative: number;
}

type TimeRange = '7d' | '30d' | '90d';

const SubscriberGrowthChart = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [periodGrowth, setPeriodGrowth] = useState(0);
  const [growthPercentage, setGrowthPercentage] = useState(0);

  const getDaysForRange = (range: TimeRange): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
    }
  };

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const days = getDaysForRange(timeRange);
      const startDate = startOfDay(subDays(new Date(), days));
      
      // Fetch subscribers via server-side RPC (no PII exposed)
      const { data: subscribers, error } = await supabase
        .rpc('get_subscriber_growth', { start_date: startDate.toISOString() });

      if (error) {
        console.error('Error fetching subscriber data:', error);
        return;
      }

      // Fetch total active count via RPC
      const { data: total } = await supabase
        .rpc('get_subscriber_count');

      setTotalSubscribers(total || 0);

      // Generate all dates in range
      const dateRange = eachDayOfInterval({
        start: startDate,
        end: new Date()
      });

      // Count subscribers per day
      const dailyCounts: Record<string, number> = {};
      dateRange.forEach(date => {
        dailyCounts[format(date, 'yyyy-MM-dd')] = 0;
      });

      subscribers?.forEach(sub => {
        const dateKey = format(parseISO(sub.subscribed_at), 'yyyy-MM-dd');
        if (dailyCounts[dateKey] !== undefined) {
          dailyCounts[dateKey]++;
        }
      });

      // Build chart data with cumulative count
      // Get base count (subscribers before the start date)
      const { count: baseCount } = await supabase
        .from('newsletter_subscribers')
        .select('id', { count: 'exact', head: true })
        .lt('subscribed_at', startDate.toISOString())
        .eq('is_active', true);

      let cumulative = baseCount || 0;
      const data: ChartDataPoint[] = dateRange.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const count = dailyCounts[dateKey];
        cumulative += count;
        
        return {
          date: dateKey,
          displayDate: format(date, timeRange === '7d' ? 'EEE' : 'MMM d'),
          count,
          cumulative
        };
      });

      setChartData(data);

      // Calculate growth metrics
      const periodNewSubs = subscribers?.length || 0;
      setPeriodGrowth(periodNewSubs);

      const startCumulative = data[0]?.cumulative - (data[0]?.count || 0);
      if (startCumulative > 0) {
        setGrowthPercentage(Math.round((periodNewSubs / startCumulative) * 100));
      } else {
        setGrowthPercentage(periodNewSubs > 0 ? 100 : 0);
      }

    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-['Rajdhani'] text-muted-foreground mb-1">{label}</p>
          <p className="text-sm font-['Rajdhani']">
            <span className="text-primary font-semibold">+{payload[0].payload.count}</span> new
          </p>
          <p className="text-sm font-['Rajdhani']">
            <span className="text-accent font-semibold">{payload[0].payload.cumulative}</span> total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-['Orbitron'] font-bold text-neon-purple">
            Subscriber Growth
          </h2>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="font-['Rajdhani']"
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-background/50 rounded-lg p-4 border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm font-['Rajdhani']">Total Subscribers</span>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-['Orbitron'] font-bold text-foreground">
              {totalSubscribers.toLocaleString()}
            </p>
          )}
        </div>

        <div className="bg-background/50 rounded-lg p-4 border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-['Rajdhani']">New This Period</span>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-2xl font-['Orbitron'] font-bold text-primary">
                +{periodGrowth}
              </p>
            </div>
          )}
        </div>

        <div className="bg-background/50 rounded-lg p-4 border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-['Rajdhani']">Growth Rate</span>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-2xl font-['Orbitron'] font-bold text-foreground">
                {growthPercentage}%
              </p>
              {growthPercentage > 0 ? (
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="space-y-2 w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground font-['Rajdhani']">
            No subscriber data available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="displayDate" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                fontFamily="Rajdhani"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                fontFamily="Rajdhani"
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCumulative)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default SubscriberGrowthChart;
