import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Bell, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PushNotification {
  id: string;
  title: string;
  body: string;
  recipient_count: number;
  sent_at: string;
  image_url: string | null;
}

const NotificationHistory = () => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();
  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("push_notifications")
      .select("id, title, body, recipient_count, sent_at, image_url")
      .order("sent_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      const { error } = await supabase
        .from("push_notifications")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      setNotifications([]);
      toast({ title: "Notification history cleared" });
    } catch (error: any) {
      toast({ title: "Failed to clear history", description: error.message, variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-['Orbitron'] font-bold text-neon-purple">
            Notification History
          </h2>
          <Badge variant="secondary">{notifications.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={clearing}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear notification history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {notifications.length} notification records. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-muted-foreground font-['Rajdhani'] text-center py-8">
          No notifications sent yet.
        </p>
      ) : (
        <div className="rounded-md border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-['Orbitron'] text-xs">Title</TableHead>
                <TableHead className="font-['Orbitron'] text-xs">Message</TableHead>
                <TableHead className="font-['Orbitron'] text-xs text-center">Recipients</TableHead>
                <TableHead className="font-['Orbitron'] text-xs">Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-['Rajdhani'] font-semibold max-w-[200px] truncate">
                    {n.title}
                  </TableCell>
                  <TableCell className="font-['Rajdhani'] text-muted-foreground max-w-[300px] truncate">
                    {n.body}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{n.recipient_count}</Badge>
                  </TableCell>
                  <TableCell className="font-['Rajdhani'] text-muted-foreground whitespace-nowrap">
                    {format(new Date(n.sent_at), "MMM d, yyyy h:mm a")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default NotificationHistory;
