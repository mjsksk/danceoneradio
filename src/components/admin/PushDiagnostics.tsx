import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope } from "lucide-react";

export const PushDiagnostics = () => {
  const [results, setResults] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    const logs: string[] = [];

    // 1. Check notification permission
    if (!("Notification" in window)) {
      logs.push("❌ Notifications API not supported in this browser");
    } else {
      logs.push(`✅ Notification API available. Permission: ${Notification.permission}`);
      if (Notification.permission === "denied") {
        logs.push("❌ Notifications are DENIED. User must reset in browser settings.");
      } else if (Notification.permission === "default") {
        logs.push("⚠️ Notifications not yet granted. User needs to allow.");
      }
    }

    // 2. Check service worker
    if (!("serviceWorker" in navigator)) {
      logs.push("❌ Service Workers not supported");
    } else {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        logs.push("❌ No service worker registered");
      } else {
        logs.push(`✅ Service Worker registered. Scope: ${registration.scope}`);
        logs.push(`   Active: ${!!registration.active}, Waiting: ${!!registration.waiting}, Installing: ${!!registration.installing}`);
        
        // 3. Check push manager
        if (!(registration as any).pushManager) {
          logs.push("❌ PushManager not available");
        } else {
          logs.push("✅ PushManager available");
          
          const sub = await (registration as any).pushManager.getSubscription();
          if (!sub) {
            logs.push("⚠️ No push subscription found on this browser");
          } else {
            logs.push(`✅ Push subscription active`);
            logs.push(`   Endpoint: ${sub.endpoint.substring(0, 80)}...`);
            logs.push(`   Expires: ${sub.expirationTime || "never"}`);
          }
        }
      }
    }

    // 4. Try showing a local notification directly
    if (Notification.permission === "granted") {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.showNotification("🔔 Diagnostic Test", {
            body: "If you see this, notifications work on this browser!",
            tag: "diagnostic-test-" + Date.now(),
            requireInteraction: false,
          });
          logs.push("✅ Local test notification sent via showNotification()");
        } else {
          logs.push("❌ Cannot test - no service worker registration");
        }
      } catch (err: any) {
        logs.push(`❌ showNotification() failed: ${err.message}`);
      }
    } else {
      logs.push("⚠️ Skipping local notification test (permission not granted)");
    }

    setResults(logs);
    setRunning(false);
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <Stethoscope className="w-5 h-5 text-neon" />
        <h2 className="text-xl font-['Orbitron'] font-bold text-neon">
          Push Notification Diagnostics
        </h2>
      </div>
      
      <Button onClick={runDiagnostics} disabled={running} className="mb-4">
        {running ? "Running..." : "Run Diagnostics"}
      </Button>

      {results.length > 0 && (
        <div className="bg-background/80 rounded-lg p-4 font-mono text-sm space-y-1">
          {results.map((line, i) => (
            <div key={i} className={
              line.startsWith("❌") ? "text-red-400" :
              line.startsWith("⚠️") ? "text-yellow-400" :
              line.startsWith("✅") ? "text-green-400" :
              "text-muted-foreground ml-4"
            }>
              {line}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
