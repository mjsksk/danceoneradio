import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";

export const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    // Check if user has already dismissed this
    const dismissed = localStorage.getItem("notification-prompt-dismissed");
    if (dismissed) {
      return;
    }

    // Check if already subscribed
    checkSubscriptionStatus();

    // Show prompt after 10 seconds
    const timer = setTimeout(() => {
      if (!isSubscribed) {
        setShowPrompt(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isSubscribed]);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY ||
          "BPS3CPk3s9J0P14imK4VLnGrXwEmHxheiIr5-UnjuEdV-6SDW1_k_K2SiqKTn9dwy9CLRhNdajvLo1Wri5C9Q3M"
        ),
      });

      // Send subscription to server
      await fetch(
        "https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/subscribe-push",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuthToken()}`,
          },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        }
      );

      setIsSubscribed(true);
      setShowPrompt(false);
      localStorage.setItem("notification-prompt-dismissed", "true");
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("notification-prompt-dismissed", "true");
  };

  if (!showPrompt || isSubscribed) {
    return null;
  }

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
            <Button
              onClick={handleSubscribe}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              Enable
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
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
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getAuthToken() {
  // This would get the current user's auth token
  // For now, return empty string (would be implemented with AuthContext)
  return "";
}
