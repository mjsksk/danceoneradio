import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, RefreshCw, Trash2, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PushSubscriber {
  id: string;
  endpoint: string;
  created_at: string;
}

export const PushSubscriberManager = () => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<PushSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, endpoint: string) => {
    setDeleting(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Use service role via edge function or direct delete with admin RLS
      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Removed", description: "Subscription removed" });
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const getBrowserFromEndpoint = (endpoint: string): string => {
    if (endpoint.includes("fcm.googleapis.com") || endpoint.includes("firebase")) return "Chrome/Edge";
    if (endpoint.includes("mozilla.com") || endpoint.includes("push.services.mozilla.com")) return "Firefox";
    if (endpoint.includes("apple.com") || endpoint.includes("push.apple.com")) return "Safari";
    if (endpoint.includes("wns.windows.com")) return "Edge (Legacy)";
    return "Unknown";
  };

  const browserCounts = subscribers.reduce<Record<string, number>>((acc, sub) => {
    const browser = getBrowserFromEndpoint(sub.endpoint);
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-neon" />
          <h2 className="text-2xl font-['Orbitron'] font-bold text-neon">
            Push Subscribers
          </h2>
          <Badge variant="secondary" className="font-['Rajdhani'] ml-2">
            {subscribers.length}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSubscribers}
          disabled={loading}
          className="font-['Rajdhani']"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-background/50 rounded-lg border border-border/50 text-center">
          <p className="text-2xl font-bold font-['Orbitron'] text-neon">{subscribers.length}</p>
          <p className="text-xs text-muted-foreground font-['Rajdhani']">Total</p>
        </div>
        {Object.entries(browserCounts).map(([browser, count]) => (
          <div key={browser} className="p-4 bg-background/50 rounded-lg border border-border/50 text-center">
            <p className="text-2xl font-bold font-['Orbitron'] text-primary">{count}</p>
            <p className="text-xs text-muted-foreground font-['Rajdhani']">{browser}</p>
          </div>
        ))}
      </div>

      {/* Subscriber List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-['Rajdhani']">Loading...</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-50" />
          <p className="text-muted-foreground font-['Rajdhani']">No subscribers yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {subscribers.map((sub) => {
            const browser = getBrowserFromEndpoint(sub.endpoint);
            const maskedEndpoint = sub.endpoint.slice(0, 40) + "…";

            return (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30 hover:border-border/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-['Rajdhani'] text-xs">
                      {browser}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-['Rajdhani']">
                      {format(new Date(sub.created_at), "PP")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                    {maskedEndpoint}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(sub.id, sub.endpoint)}
                  disabled={deleting === sub.id}
                  className="text-destructive hover:text-destructive/80 ml-2 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
