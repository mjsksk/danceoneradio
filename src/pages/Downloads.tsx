import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import SocialShare from '@/components/SocialShare';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Monitor,
  Check,
  Shield,
  Settings,
  Bell,
  Headphones,
  Clock,
  Sparkles,
  Smartphone,
  TabletSmartphone,
} from 'lucide-react';
import appStoreBadge from '@/assets/app-store-badge-new.svg';
import googlePlayBadge from '@/assets/google-play-badge-new.svg';

const Downloads = () => {
  const appVersion = '1.0.24';
  const windowsDownloadUrl = `https://github.com/mjsksk/danceoneradio/releases/download/v${appVersion}/dance-one-radio-setup-${appVersion}-x64.exe`;
  const macDownloadUrl = `/downloads/dance-one-radio-${appVersion}-macos-arm64.dmg`;

  const handleDownload = (platform: string, url: string) => {
    supabase
      .from('app_downloads')
      .insert({ platform, version: appVersion })
      .then(() => {});

    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Dance One Radio Apps - Desktop & Mobile"
        description="Download Dance One Radio apps for Windows, macOS, iOS, and Android. Listen to live electronic dance music streams on your favorite device."
        keywords="dance one radio app, radio desktop app, macOS radio app, Windows radio app, music streaming app, electronic music app, iOS radio app, Android radio app"
      />
      <Navigation />

      <main className="pt-16">
        <section className="bg-gradient-to-br from-background via-background to-primary/5 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6">
                <Badge className="mb-4 gap-2 border-primary/30 bg-primary/20 text-primary hover:bg-primary/30">
                  <Sparkles className="h-4 w-4" />
                  Available on All Platforms
                </Badge>
                <h1 className="mb-6 text-4xl font-bold gradient-text md:text-6xl">
                  Dance One Radio Apps
                </h1>
                <p className="mb-8 text-xl text-muted-foreground">
                  Get the ultimate listening experience on any device - desktop, phone, or tablet.
                </p>
              </div>

              <div className="flex justify-center">
                <SocialShare
                  url={window.location.href}
                  title="Dance One Radio Apps"
                  description="Download Dance One Radio apps for Windows, macOS, iOS, and Android. Experience the ultimate electronic music streaming."
                  image={`${window.location.origin}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png`}
                />
              </div>
            </div>
          </div>
        </section>

        <GoogleAds key="downloads-ad" slot={AD_SLOTS.SIDEBAR} />

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <Smartphone className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold md:text-4xl">Mobile Apps</h2>
              </div>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                Take Dance One Radio with you wherever you go
              </p>
            </div>

            <div className="mx-auto mb-12 grid max-w-3xl gap-8 md:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 text-center">
                <div className="relative z-10">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                    <Smartphone className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">iOS App</h3>
                  <p className="mb-6 text-muted-foreground">
                    Stream Dance One Radio on your iPhone or iPad with native iOS controls and CarPlay support.
                  </p>
                  <a
                    href="https://apps.apple.com/app/dance-one-radio/id6740014889"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={appStoreBadge}
                      alt="Download on the App Store"
                      className="mx-auto h-14 transition-opacity hover:opacity-80"
                      loading="lazy"
                     decoding="async"/>
                  </a>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 text-center">
                <div className="relative z-10">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                    <TabletSmartphone className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Android App</h3>
                  <p className="mb-6 text-muted-foreground">
                    Enjoy Dance One Radio on any Android device with background playback and notification controls.
                  </p>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.danceoneradio.app"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={googlePlayBadge}
                      alt="Get it on Google Play"
                      className="mx-auto h-14 transition-opacity hover:opacity-80"
                      loading="lazy"
                     decoding="async"/>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <Monitor className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold md:text-4xl">Desktop App</h2>
              </div>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                The full-featured experience for your Windows PC or Mac
              </p>
            </div>

            <div className="mx-auto mb-8 grid max-w-4xl gap-8 md:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 text-center">
                <div className="relative z-10">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                    <Download className="h-8 w-8 text-primary" />
                  </div>

                  <h3 className="mb-2 text-xl font-semibold">Windows Desktop</h3>
                  <p className="mb-6 text-muted-foreground">
                    Download and install in minutes. Enjoy uninterrupted electronic music streaming right from your desktop.
                  </p>

                  <Button
                    size="lg"
                    onClick={() => handleDownload('windows', windowsDownloadUrl)}
                    className="gap-2 px-8 py-6 text-lg"
                  >
                    <Download className="h-5 w-5" />
                    Download for Windows
                  </Button>

                  <div className="mt-4 text-sm text-muted-foreground">
                    Version {appVersion} • Windows 10+ (64-bit) • Free
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 text-center">
                <div className="relative z-10">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                    <Monitor className="h-8 w-8 text-primary" />
                  </div>

                  <h3 className="mb-2 text-xl font-semibold">macOS Desktop</h3>
                  <p className="mb-6 text-muted-foreground">
                    Download the Apple Silicon Mac build for a lightweight native player with menu bar controls and live stream playback.
                  </p>

                  <Button
                    size="lg"
                    onClick={() => handleDownload('macos-arm64', macDownloadUrl)}
                    className="gap-2 px-8 py-6 text-lg"
                  >
                    <Download className="h-5 w-5" />
                    Download for Mac
                  </Button>

                  <div className="mt-4 text-sm text-muted-foreground">
                    Version {appVersion} • macOS 13+ • Apple Silicon
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto mb-12 max-w-3xl rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">
              <strong>macOS note:</strong> The current Mac build is an Apple Silicon DMG and is not code signed yet, so macOS may ask you to confirm opening it the first time.
            </div>

            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Menu Bar & Tray Controls</h3>
                <p className="text-muted-foreground">
                  Control playback directly from the Windows tray or macOS menu bar without keeping the full player open.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Auto-Launch on Startup</h3>
                <p className="text-muted-foreground">
                  Optionally start Dance One Radio automatically when your desktop boots up for instant access.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Native Notifications</h3>
                <p className="text-muted-foreground">
                  Get native desktop notifications when tracks change, keeping you informed about what&apos;s playing.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Enhanced Audio</h3>
                <p className="text-muted-foreground">
                  Optimized audio processing with real-time frequency analysis and enhanced visualizations.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Multiple Window Modes</h3>
                <p className="text-muted-foreground">
                  Full-size interface or compact mini-player. Hide to the menu bar or tray for background listening.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Secure & Lightweight</h3>
                <p className="text-muted-foreground">
                  Built with modern security practices. Small download size with powerful features.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">System Requirements</h2>
                <p className="text-xl text-muted-foreground">
                  Desktop app requirements for the best experience
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-8">
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                    <Check className="h-5 w-5 text-primary" />
                    Minimum Requirements
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Windows 10 (64-bit) or macOS 13+
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      4 GB RAM
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      100 MB free disk space
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Internet connection
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-card p-8">
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                    <Check className="h-5 w-5 text-primary" />
                    Recommended
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Windows 11 (64-bit) or macOS 14+
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      8 GB RAM or more
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      SSD storage
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      High-speed internet
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">Installation Guide</h2>
                <p className="text-xl text-muted-foreground">
                  Get up and running in just a few simple steps
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-8">
                  <h3 className="mb-6 text-xl font-semibold">Windows</h3>
                  <ol className="list-inside list-decimal space-y-4 text-left">
                    <li>Download the installer (.exe) file</li>
                    <li>Double-click the installer and follow the setup wizard</li>
                    <li>Launch Dance One Radio from your Start Menu or Desktop shortcut</li>
                    <li>Enjoy uninterrupted electronic music streaming!</li>
                  </ol>
                  <div className="mt-6 rounded-lg bg-primary/10 p-4">
                    <p className="text-sm">
                      <strong>Tip:</strong> The installer creates Start Menu and Desktop shortcuts automatically. You can also enable auto-launch on Windows startup from the app settings.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-8">
                  <h3 className="mb-6 text-xl font-semibold">macOS</h3>
                  <ol className="list-inside list-decimal space-y-4 text-left">
                    <li>Download the Mac disk image (.dmg)</li>
                    <li>Open the DMG and drag Dance One Radio into Applications</li>
                    <li>Launch the app from Applications</li>
                    <li>If macOS warns you, right-click the app and choose Open the first time</li>
                  </ol>
                  <div className="mt-6 rounded-lg bg-primary/10 p-4">
                    <p className="text-sm">
                      <strong>Tip:</strong> This Mac build currently targets Apple Silicon and is not notarized yet, so the first launch may need manual confirmation in macOS.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Downloads;
