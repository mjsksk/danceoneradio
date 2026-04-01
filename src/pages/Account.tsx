import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Clock, Music, LogOut, Trash2, Bell, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Admin components
import CSVTrackImporter from '@/components/admin/CSVTrackImporter';
import NewsletterSubscribers from '@/components/admin/NewsletterSubscribers';
import SubscriberGrowthChart from '@/components/admin/SubscriberGrowthChart';
import NewsletterCampaign from '@/components/admin/NewsletterCampaign';
import ManualSubscriberAdd from '@/components/admin/ManualSubscriberAdd';
import ListenerAnalytics from '@/components/admin/ListenerAnalytics';
import VisitorAnalytics from '@/components/admin/VisitorAnalytics';
import { PushNotificationComposer } from '@/components/admin/PushNotificationComposer';
import { PushDiagnostics } from '@/components/admin/PushDiagnostics';
import NotificationHistory from '@/components/admin/NotificationHistory';
import { PushSubscriberManager } from '@/components/admin/PushSubscriberManager';
import DownloadAnalytics from '@/components/admin/DownloadAnalytics';

interface EpisodeProgress {
  id: string;
  episode_number: number;
  episode_title: string;
  playback_position: number;
  duration: number;
  completed: boolean;
  last_listened_at: string;
}

export default function Account() {
  const { user, profile, signOut, updatePassword, updateProfile } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [listeningHistory, setListeningHistory] = useState<EpisodeProgress[]>([]);
  const [stats, setStats] = useState({ totalEpisodes: 0, totalHours: 0 });
  const [trackNotifications, setTrackNotifications] = useState(
    localStorage.getItem('track-change-notifications') !== 'false'
  );

  // Hide Google AdSense auto-ads when admin tab is active
  useEffect(() => {
    if (isAdmin) {
      document.body.setAttribute('data-no-ads', 'true');
      return () => {
        document.body.removeAttribute('data-no-ads');
      };
    }
  }, [isAdmin]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchListeningHistory();
    }
  }, [user]);

  const fetchListeningHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('episode_listening_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('last_listened_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching history:', error);
        return;
      }

      setListeningHistory(data || []);

      const totalMinutes = (data || []).reduce((acc, ep) => acc + ep.playback_position / 60, 0);
      setStats({
        totalEpisodes: data?.length || 0,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    await updateProfile({ display_name: displayName });
    setIsUpdatingProfile(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    setIsUpdatingPassword(true);
    await updatePassword(newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsUpdatingPassword(false);
  };

  const handleTrackNotificationToggle = (checked: boolean) => {
    setTrackNotifications(checked);
    localStorage.setItem('track-change-notifications', checked ? 'true' : 'false');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const accountContent = (
    <div className="space-y-6">
      {/* Listening Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Episodes Started</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEpisodes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Listened</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" />
            </div>
            <Button type="submit" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
            </div>
            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Listening History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Listening History</CardTitle>
          <CardDescription>Your recently played episodes</CardDescription>
        </CardHeader>
        <CardContent>
          {listeningHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No listening history yet</p>
          ) : (
            <div className="space-y-4">
              {listeningHistory.map((episode) => (
                <div key={episode.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{episode.episode_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(episode.last_listened_at)} · {formatTime(episode.playback_position)} / {formatTime(episode.duration)}
                    </p>
                  </div>
                  {episode.completed && (
                    <span className="text-xs text-primary">Completed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Control which notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Track Change Notifications</p>
              <p className="text-xs text-muted-foreground">
                Show a notification when the currently playing song changes on the live radio stream
              </p>
            </div>
            <Switch
              checked={trackNotifications}
              onCheckedChange={handleTrackNotificationToggle}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Account Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground">
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  const adminContent = (
    <div className="space-y-8">
      <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
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
      </Card>

      <PushDiagnostics />
      <PushNotificationComposer />
      <NotificationHistory />
      <PushSubscriberManager />
      <VisitorAnalytics />
      <DownloadAnalytics />
      <ListenerAnalytics />
      <SubscriberGrowthChart />
      <NewsletterCampaign />
      <ManualSubscriberAdd />
      <NewsletterSubscribers />
      <CSVTrackImporter />
    </div>
  );

  return (
    <>
      <SEO 
        title="Account Settings - Dance One Radio"
        description="Manage your Dance One Radio account settings and listening history."
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            {isAdmin ? (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-foreground">Account</h1>
                  <p className="text-muted-foreground">Manage your profile and admin tools</p>
                </div>
                <Tabs defaultValue="account" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="admin" className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Admin Tools
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    {accountContent}
                  </TabsContent>
                  <TabsContent value="admin">
                    {adminContent}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
                  <p className="text-muted-foreground">Manage your profile and listening preferences</p>
                </div>
                {accountContent}
              </>
            )}
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
}
