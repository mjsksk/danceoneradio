import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Monitor, Smartphone, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DesktopDownloadSection = () => {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = (type: 'installer' | 'portable') => {
    setDownloadStarted(true);
    
    const downloadUrl = type === 'installer' 
      ? 'https://github.com/mjsksk/danceoneradio/releases/download/v1.0.6/dance-one-radio-setup-1.0.6-x64.exe'
      : 'https://github.com/mjsksk/danceoneradio/releases/download/v1.0.6/dance-one-radio-setup-1.0.6-x64.exe';
    
    window.open(downloadUrl, '_blank');
    
    setTimeout(() => setDownloadStarted(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Desktop App</span>
          <span className="sm:hidden">Download</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Download Dance One Radio Desktop App
          </DialogTitle>
          <DialogDescription>
            Get the best listening experience with our Windows desktop application featuring enhanced audio quality, system tray controls, and global hotkeys.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Important Notice */}
          <Alert>
            <Download className="w-4 h-4" />
            <AlertDescription>
              <strong>Ready to Install:</strong> Download the installer and double-click to install with a simple Windows wizard.
            </AlertDescription>
          </Alert>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>System tray integration with play/pause controls</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Auto-launch on Windows startup (optional)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Native Windows notifications for track changes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Enhanced audio quality and visualization</span>
            </div>
          </div>

          {/* System Requirements */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">System Requirements</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Windows 10 or later (64-bit recommended)</li>
              <li>• 4 GB RAM minimum</li>
              <li>• 100 MB free disk space</li>
              <li>• Internet connection for streaming</li>
            </ul>
          </div>

          {/* Download Options */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => handleDownload('installer')}
                className="flex-1 gap-2"
                disabled={downloadStarted}
              >
                {downloadStarted ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Starting Download...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Full Installer (Recommended)
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleDownload('portable')}
                className="flex-1 gap-2"
                disabled={downloadStarted}
              >
                <Download className="w-4 h-4" />
                Portable Version
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              <strong>Full Installer:</strong> Creates shortcuts, includes uninstaller<br />
              <strong>Portable:</strong> No installation required, run from anywhere
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Version 1.0.6</span>
              <Badge variant="secondary" className="gap-1">
                <Smartphone className="w-3 h-3" />
                Windows Only
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const QuickDownloadButton = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleQuickDownload = () => {
    setIsDownloading(true);
    
    const downloadUrl = 'https://github.com/mjsksk/danceoneradio/releases/download/v1.0.6/dance-one-radio-setup-1.0.6-x64.exe';
    window.open(downloadUrl, '_blank');
    
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <Button 
      onClick={handleQuickDownload}
      className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download Desktop App
        </>
      )}
    </Button>
  );
};