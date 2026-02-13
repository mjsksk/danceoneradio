import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = "BPS3CPk3s9J0P14imK4VLnGrXwEmHxheiIr5-UnjuEdV-6SDW1_k_K2SiqKTn9dwy9CLRhNdajvLo1Wri5C9Q3M";

export const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      return;
    }

    const dismissed = localStorage.getItem("notification-prompt-dismissed");
    if (dismissed) return;

    checkSubscriptionStatus();

    const timer = setTimeout(() => {
      if (!isSubscribed) setShowPrompt(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [isSubscribed]);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager?.getSubscription();
      if (subscription) setIsSubscribed(true);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = subscription.toJSON();

      // Save via edge function (uses service role, no auth needed for insert)
      const response = await fetch(
        "https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/subscribe-push",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYndsbnB5Y3JiaHhhaGp6dHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODQ3MzQsImV4cCI6MjA3MDM2MDczNH0.3N7hPJIiHokZvHZQSnQqZl1xu2POj4FrNyVPMQxF55U",
          },
          body: JSON.stringify({ subscription: subJson }),
        }
      );

      if (response.ok) {
        setIsSubscribed(true);
        setShowPrompt(false);
        localStorage.setItem("notification-prompt-dismissed", "true");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("notification-prompt-dismissed", "true");
  };

  if (!showPrompt || isSubscribed) return null;

  return (
    <Card className="fixed bottom-20 right-4 w-80 p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-lg z-40">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">Stay Updated</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get notifications about new episodes and updates.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleSubscribe} size="sm" className="bg-primary hover:bg-primary/90">
              Enable
            </Button>
            <Button onClick={handleDismiss} size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
