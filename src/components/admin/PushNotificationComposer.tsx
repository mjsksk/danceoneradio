import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send, TestTube, Clock, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type ScheduleMode = "now" | "scheduled";

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  icon_url: string | null;
  scheduled_at: string;
  status: string;
  recipient_count: number;
  created_at: string;
  sent_at: string | null;
}

export const PushNotificationComposer = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  useEffect(() => {
    fetchScheduledNotifications();
  }, []);

  const fetchScheduledNotifications = async () => {
    setLoadingScheduled(true);
    try {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (!error && data) {
        setScheduledNotifications(data as ScheduledNotification[]);
      }
    } catch (error) {
      console.error("Error fetching scheduled notifications:", error);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Error", description: "Title and body are required", variant: "destructive" });
      return;
    }

    if (scheduleMode === "scheduled") {
      await handleSchedule();
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in");

      const response = await fetch(
        "https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/send-push-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYndsbnB5Y3JiaHhhaGp6dHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODQ3MzQsImV4cCI6MjA3MDM2MDczNH0.3N7hPJIiHokZvHZQSnQqZl1xu2POj4FrNyVPMQxF55U",
          },
          body: JSON.stringify({ message: { title, body, icon: icon || undefined } }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send notification");

      setSentCount(data.sentCount || 0);
      toast({ title: "Success", description: `Notification sent to ${data.sentCount} subscribers` });
      setTitle(""); setBody(""); setIcon("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast({ title: "Error", description: "Please select a date and time", variant: "destructive" });
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledAt <= new Date()) {
      toast({ title: "Error", description: "Scheduled time must be in the future", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in");

      const { error } = await supabase.from("scheduled_notifications").insert({
        title,
        body,
        icon_url: icon || null,
        scheduled_at: scheduledAt.toISOString(),
        created_by: session.user.id,
      });

      if (error) throw new Error(error.message);

      toast({ title: "Scheduled", description: `Notification scheduled for ${format(scheduledAt, "PPpp")}` });
      setTitle(""); setBody(""); setIcon(""); setScheduledDate(""); setScheduledTime("");
      setScheduleMode("now");
      fetchScheduledNotifications();
    } catch (error) {
      console.error("Error scheduling notification:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Error", description: "Title and body are required", variant: "destructive" });
      return;
    }

    setTestLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in");

      const { data: subscriptions, error: subError } = await supabase
        .from("push_subscriptions").select("endpoint").limit(1);

      if (subError || !subscriptions?.length) {
        throw new Error("No subscription found. Please enable notifications first.");
      }

      const response = await fetch(
        "https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/send-test-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYndsbnB5Y3JiaHhhaGp6dHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODQ3MzQsImV4cCI6MjA3MDM2MDczNH0.3N7hPJIiHokZvHZQSnQqZl1xu2POj4FrNyVPMQxF55U",
          },
          body: JSON.stringify({
            message: { title, body, icon: icon || undefined },
            endpoint: subscriptions[0].endpoint,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send test notification");

      toast({ title: "Success", description: "Test notification sent to you!" });
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send test notification",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleCancelScheduled = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_notifications")
        .update({ status: "cancelled" })
        .eq("id", id)
        .eq("status", "pending");

      if (error) throw new Error(error.message);

      toast({ title: "Cancelled", description: "Scheduled notification cancelled" });
      fetchScheduledNotifications();
    } catch (error) {
      console.error("Error cancelling notification:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel",
        variant: "destructive",
      });
    }
  };

  const pendingNotifications = scheduledNotifications.filter(n => n.status === "pending");
  const pastNotifications = scheduledNotifications.filter(n => n.status !== "pending");

  return (
    <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-6 h-6 text-neon" />
        <h2 className="text-2xl font-['Orbitron'] font-bold text-neon">
          Push Notifications
        </h2>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div>
          <Label htmlFor="notification-title" className="font-['Rajdhani']">Title</Label>
          <Input
            id="notification-title"
            placeholder="New Episode Released"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-['Rajdhani']"
          />
        </div>

        <div>
          <Label htmlFor="notification-body" className="font-['Rajdhani']">Message</Label>
          <Textarea
            id="notification-body"
            placeholder="Episode 404 is now available. Tune in now!"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="font-['Rajdhani']"
          />
        </div>

        <div>
          <Label htmlFor="notification-icon" className="font-['Rajdhani']">Icon URL (Optional)</Label>
          <Input
            id="notification-icon"
            placeholder="https://example.com/icon.png"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="font-['Rajdhani']"
          />
        </div>

        {/* Schedule Mode Toggle */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant={scheduleMode === "now" ? "default" : "outline"}
            size="sm"
            onClick={() => setScheduleMode("now")}
            className={scheduleMode === "now" ? "bg-neon text-black font-['Rajdhani']" : "font-['Rajdhani']"}
          >
            <Send className="w-4 h-4 mr-1" /> Send Now
          </Button>
          <Button
            type="button"
            variant={scheduleMode === "scheduled" ? "default" : "outline"}
            size="sm"
            onClick={() => setScheduleMode("scheduled")}
            className={scheduleMode === "scheduled" ? "bg-neon text-black font-['Rajdhani']" : "font-['Rajdhani']"}
          >
            <Clock className="w-4 h-4 mr-1" /> Schedule
          </Button>
        </div>

        {scheduleMode === "scheduled" && (
          <div className="flex gap-3 p-4 bg-background/50 rounded-lg border border-border/50">
            <div className="flex-1">
              <Label className="font-['Rajdhani']">Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="font-['Rajdhani']"
              />
            </div>
            <div className="flex-1">
              <Label className="font-['Rajdhani']">Time</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="font-['Rajdhani']"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSend}
            disabled={loading || !title.trim() || !body.trim()}
            className="bg-neon hover:bg-neon/90 text-black font-['Rajdhani']"
          >
            {scheduleMode === "scheduled" ? (
              <><Calendar className="w-4 h-4 mr-2" />{loading ? "Scheduling..." : "Schedule"}</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />{loading ? "Sending..." : "Send to All"}</>
            )}
          </Button>
          <Button
            onClick={handleSendTest}
            disabled={testLoading || !title.trim() || !body.trim()}
            variant="outline"
            className="font-['Rajdhani']"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {testLoading ? "Sending..." : "Send Test"}
          </Button>
        </div>

        {sentCount > 0 && (
          <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-primary font-['Rajdhani']">
              ✓ Notification sent to {sentCount} subscribers
            </p>
          </div>
        )}

        {/* Scheduled Notifications Queue */}
        {pendingNotifications.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-['Orbitron'] font-bold text-neon-purple flex items-center gap-2">
              <Clock className="w-5 h-5" /> Queued Notifications
            </h3>
            {pendingNotifications.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold font-['Rajdhani'] truncate">{notif.title}</p>
                  <p className="text-sm text-muted-foreground font-['Rajdhani'] truncate">{notif.body}</p>
                  <p className="text-xs text-muted-foreground font-['Rajdhani'] mt-1">
                    📅 {format(new Date(notif.scheduled_at), "PPpp")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancelScheduled(notif.id)}
                  className="text-destructive hover:text-destructive/80 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Past Scheduled Notifications */}
        {pastNotifications.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-['Rajdhani'] text-muted-foreground">History</h3>
            {pastNotifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className="flex items-center gap-2 p-2 bg-background/30 rounded text-sm font-['Rajdhani']">
                <span className={notif.status === "sent" ? "text-green-500" : notif.status === "cancelled" ? "text-muted-foreground" : "text-destructive"}>
                  {notif.status === "sent" ? "✓" : notif.status === "cancelled" ? "✕" : "✗"}
                </span>
                <span className="truncate flex-1">{notif.title}</span>
                <span className="text-muted-foreground text-xs">
                  {notif.status === "sent" ? `${notif.recipient_count} sent` : notif.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
