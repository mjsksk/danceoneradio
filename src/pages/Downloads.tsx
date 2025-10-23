import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import AdSenseUnit from '@/components/AdSenseUnit';
import SocialShare from '@/components/SocialShare';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Monitor, Check, Shield, Zap, Settings, Bell, Headphones, Github, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const Downloads = () => {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = (type: 'installer' | 'portable') => {
    setDownloadStarted(true);
    
    // Direct hosting from /downloads/ folder
    const downloadUrl = type === 'installer' 
      ? '/downloads/Dance-One-Radio-Setup-1.0.0.exe'
      : '/downloads/Dance-One-Radio-Portable-1.0.0.exe';
    
    // Direct download
    window.open(downloadUrl, '_blank');
    
    setTimeout(() => setDownloadStarted(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Download Dance One Radio Apps - Desktop & Mobile"
        description="Download Dance One Radio desktop apps for Windows, Mac, and Linux. Listen to live electronic dance music streams on your favorite device."
        keywords="dance one radio app, radio desktop app, music streaming app, electronic music app, Windows radio app"
      />
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <Badge variant="secondary" className="gap-2 mb-4">
                  <Monitor className="w-4 h-4" />
                  Windows Desktop App
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
                  Download Dance One Radio
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Experience the ultimate electronic music streaming with our feature-rich Windows desktop application
                </p>
              </div>
              
              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg"
                  onClick={() => handleDownload('installer')}
                  className="gap-2 text-lg px-8 py-6"
                  disabled={downloadStarted}
                >
                  {downloadStarted ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Starting Download...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Installer (Recommended)
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleDownload('portable')}
                  className="gap-2 text-lg px-8 py-6"
                  disabled={downloadStarted}
                >
                  <Download className="w-5 h-5" />
                  Portable Version
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mb-6">
                Version 1.0.0 • ~50 MB • Windows 10+ • Free Download
              </div>
              
              <div className="flex justify-center">
                <SocialShare 
                  url={window.location.href}
                  title="Download Dance One Radio Desktop App"
                  description="Download Dance One Radio desktop apps for Windows. Experience the ultimate electronic music streaming with our feature-rich application."
                  image={`${window.location.origin}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png`}
                />
              </div>
            </div>
          </div>
        </section>

        <AdSenseUnit key="downloads-ad" />

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose the Desktop App?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get enhanced features and better performance with our native Windows application
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-card p-6 rounded-lg border">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">System Tray Integration</h3>
                  <p className="text-muted-foreground">
                    Control playback directly from your system tray. Play, pause, and see current track without opening the app.
                  </p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Global Hotkeys</h3>
                  <p className="text-muted-foreground">
                    Use Ctrl+Shift+P to play/pause, Ctrl+M to minimize, and media keys for seamless control.
                  </p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Native Notifications</h3>
                  <p className="text-muted-foreground">
                    Get Windows notifications when tracks change, keeping you informed of what's playing.
                  </p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Headphones className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Enhanced Audio</h3>
                  <p className="text-muted-foreground">
                    Optimized audio processing with real-time frequency analysis and enhanced visualizations.
                  </p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Monitor className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Multiple Window Modes</h3>
                  <p className="text-muted-foreground">
                    Full-size interface or compact mini-player. Minimize to tray for background listening.
                  </p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Lightweight</h3>
                  <p className="text-muted-foreground">
                    Built with modern security practices. Small download size with powerful features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">System Requirements</h2>
                <p className="text-xl text-muted-foreground">
                  Make sure your system meets these requirements for the best experience
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card p-8 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Minimum Requirements
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Windows 10 (64-bit)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      4 GB RAM
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      100 MB free disk space
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Internet connection
                    </li>
                  </ul>
                </div>

                <div className="bg-card p-8 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Recommended
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Windows 11 (64-bit)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      8 GB RAM or more
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      SSD storage
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      High-speed internet
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Installation Guide */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Installation Guide</h2>
                <p className="text-xl text-muted-foreground">
                  Get up and running in just a few simple steps
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card p-8 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-6">Full Installer (Recommended)</h3>
                  <ol className="space-y-4 list-decimal list-inside">
                    <li>Download the installer file</li>
                    <li>Run the .exe file as administrator</li>
                    <li>Follow the installation wizard</li>
                    <li>Choose installation options (shortcuts, auto-start)</li>
                    <li>Launch Dance One Radio from Start Menu or Desktop</li>
                  </ol>
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm">
                      <strong>Note:</strong> The installer creates uninstaller, Start Menu shortcuts, and optionally a desktop shortcut.
                    </p>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-6">Portable Version</h3>
                  <ol className="space-y-4 list-decimal list-inside">
                    <li>Download the portable executable</li>
                    <li>Save it to your preferred location</li>
                    <li>Double-click to run (no installation required)</li>
                    <li>Optionally pin to taskbar for quick access</li>
                  </ol>
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm">
                      <strong>Perfect for:</strong> USB drives, temporary use, or when you don't have admin privileges.
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