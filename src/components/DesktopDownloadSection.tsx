import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Monitor, Smartphone, Check, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const DesktopDownloadSection = () => {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = async (type: 'installer' | 'portable') => {
    setDownloadStarted(true);
    
    // Check if files exist before attempting download
    const downloadUrl = type === 'installer' 
      ? '/downloads/Dance-One-Radio-Setup-1.0.0.exe'
      : '/downloads/Dance-One-Radio-Portable-1.0.0.exe';
    
    try {
      // Check if file exists
      const response = await fetch(downloadUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        // File doesn't exist - show build instructions
        alert(`The ${type === 'installer' ? 'installer' : 'portable'} file is not yet available. Please follow these steps to build the desktop app:

1. Ensure you have Node.js installed
2. Navigate to the desktop-app folder
3. Run: npm install
4. Run: node build-script.js
5. Copy the generated files from desktop-app/dist/ to public/downloads/

The desktop app structure has been created but needs to be built first.`);
        setDownloadStarted(false);
        return;
      }
      
      // File exists - proceed with download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = type === 'installer' 
        ? 'Dance-One-Radio-Setup-1.0.0.exe'
        : 'Dance-One-Radio-Portable-1.0.0.exe';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. The desktop app files may not be available yet. Please contact support or try building the app locally.');
    }
    
    setTimeout(() => setDownloadStarted(false), 3000);
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
          {/* Features */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>System tray integration with play/pause controls</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Global hotkeys (Ctrl+Shift+P, Media keys)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Native Windows notifications for track changes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Enhanced audio quality and visualization</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Auto-launch on Windows startup (optional)</span>
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
              <span className="text-muted-foreground">Version 1.0.0 • ~50 MB</span>
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

  const handleQuickDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Check if installer file exists
      const response = await fetch('/downloads/Dance-One-Radio-Setup-1.0.0.exe', { method: 'HEAD' });
      
      if (!response.ok) {
        alert(`Desktop app not yet available for download. 

The app structure has been created but needs to be built first. Please contact the site administrator or follow the build instructions in the desktop-app folder.`);
        setIsDownloading(false);
        return;
      }
      
      // File exists - proceed with download
      const link = document.createElement('a');
      link.href = '/downloads/Dance-One-Radio-Setup-1.0.0.exe';
      link.download = 'Dance-One-Radio-Setup-1.0.0.exe';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again or contact support.');
    }
    
    setTimeout(() => setIsDownloading(false), 3000);
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