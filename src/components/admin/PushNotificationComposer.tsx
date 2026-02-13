import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PushNotificationComposer = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: "Error",
        description: "Title and body are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in");
      }

      const response = await fetch(
        "https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/send-push-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYndsbnB5Y3JiaHhhaGp6dHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODQ3MzQsImV4cCI6MjA3MDM2MDczNH0.3N7hPJIiHokZvHZQSnQqZl1xu2POj4FrNyVPMQxF55U",
          },
          body: JSON.stringify({
            message: {
              title,
              body,
              icon: icon || undefined,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send notification");
      }

      setSentCount(data.sentCount || 0);
      toast({
        title: "Success",
        description: `Notification sent to ${data.sentCount} subscribers`,
      });

      // Clear form
      setTitle("");
      setBody("");
      setIcon("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: "Error",
        description: "Title and body are required",
        variant: "destructive",
      });
      return;
    }

    setTestLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in");
      }

      // Get the user's subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from("push_subscriptions")
        .select("endpoint")
        .limit(1);

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
            message: {
              title,
              body,
              icon: icon || undefined,
            },
            endpoint: subscriptions[0].endpoint,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send test notification");
      }

      toast({
        title: "Success",
        description: "Test notification sent to you!",
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send test notification",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

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
          <Label htmlFor="notification-title" className="font-['Rajdhani']">
            Title
          </Label>
          <Input
            id="notification-title"
            placeholder="New Episode Released"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-['Rajdhani']"
          />
        </div>

        <div>
          <Label htmlFor="notification-body" className="font-['Rajdhani']">
            Message
          </Label>
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
          <Label htmlFor="notification-icon" className="font-['Rajdhani']">
            Icon URL (Optional)
          </Label>
          <Input
            id="notification-icon"
            placeholder="https://example.com/icon.png"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="font-['Rajdhani']"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSend}
            disabled={loading || !title.trim() || !body.trim()}
            className="bg-neon hover:bg-neon/90 text-black font-['Rajdhani']"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send to All"}
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
      </div>
    </Card>
  );
};
