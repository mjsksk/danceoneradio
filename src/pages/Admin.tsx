import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import CSVTrackImporter from "@/components/admin/CSVTrackImporter";
import SAMBroadcasterSync from "@/components/admin/SAMBroadcasterSync";
import NewsletterSubscribers from "@/components/admin/NewsletterSubscribers";
import SubscriberGrowthChart from "@/components/admin/SubscriberGrowthChart";
import NewsletterCampaign from "@/components/admin/NewsletterCampaign";
import ManualSubscriberAdd from "@/components/admin/ManualSubscriberAdd";
import ListenerAnalytics from "@/components/admin/ListenerAnalytics";
import VisitorAnalytics from "@/components/admin/VisitorAnalytics";
import { PushNotificationComposer } from "@/components/admin/PushNotificationComposer";
import { PushDiagnostics } from "@/components/admin/PushDiagnostics";
import NotificationHistory from "@/components/admin/NotificationHistory";
import { PushSubscriberManager } from "@/components/admin/PushSubscriberManager";
import { Card } from "@/components/ui/card";

const Admin = () => {
  // Hide Google AdSense auto-ads on the admin page
  useEffect(() => {
    document.body.setAttribute('data-no-ads', 'true');
    return () => {
      document.body.removeAttribute('data-no-ads');
    };
  }, []);

  return (
    <>
      <SEO 
        title="Admin Tools - Dance One Radio"
        description="Administrative tools for managing Dance One Radio content"
      />
      
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        <Navigation />
        
        <main className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
              <h1 className="text-4xl font-['Orbitron'] font-bold mb-6 text-neon">
                Admin Tools
              </h1>
              <p className="text-muted-foreground font-['Rajdhani'] mb-8">
                Tools for managing podcast episodes, newsletter subscribers, and content
              </p>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-['Orbitron'] font-bold mb-4 text-neon-purple">
                    Episode Management
                  </h2>
                  <div className="bg-background/50 rounded-lg p-4 space-y-2 font-['Rajdhani']">
                    <p className="font-semibold">Quick Guide:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Run <code className="bg-background/50 px-2 py-1 rounded">npm run generate-episode</code> to create a new episode page</li>
                      <li>Use the CSV Track Importer below to add track listings</li>
                      <li>Review the generated page and test</li>
                      <li>Deploy your changes</li>
                    </ol>
                    <p className="text-xs text-muted-foreground mt-4">
                      See <code>EPISODE-AUTOMATION.md</code> for full documentation
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <PushDiagnostics />

            <PushNotificationComposer />

            <NotificationHistory />

            <PushSubscriberManager />

            <VisitorAnalytics />

            <ListenerAnalytics />

            <SubscriberGrowthChart />

            <NewsletterCampaign />

            <ManualSubscriberAdd />

            <NewsletterSubscribers />

            <SAMBroadcasterSync />

            <CSVTrackImporter />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Admin;
