import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import SAMLibraryManager from "@/components/admin/SAMLibraryManager";
import SAMBroadcasterSync from "@/components/admin/SAMBroadcasterSync";
import NewsletterSubscribers from "@/components/admin/NewsletterSubscribers";
import SubscriberGrowthChart from "@/components/admin/SubscriberGrowthChart";
import NewsletterCampaign from "@/components/admin/NewsletterCampaign";
import ManualSubscriberAdd from "@/components/admin/ManualSubscriberAdd";
import ListenerAnalytics from "@/components/admin/ListenerAnalytics";
import TrackPlayAnalytics from "@/components/admin/TrackPlayAnalytics";
import VisitorAnalytics from "@/components/admin/VisitorAnalytics";
import { PushNotificationComposer } from "@/components/admin/PushNotificationComposer";
import { PushDiagnostics } from "@/components/admin/PushDiagnostics";
import NotificationHistory from "@/components/admin/NotificationHistory";
import { PushSubscriberManager } from "@/components/admin/PushSubscriberManager";
import { Card } from "@/components/ui/card";

const Admin = () => {
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
            <SAMLibraryManager />
            <SAMBroadcasterSync />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Admin;
