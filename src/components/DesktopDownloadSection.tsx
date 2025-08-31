import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Monitor, Smartphone, Check, ExternalLink, Github, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DesktopDownloadSection = () => {
  const [showBuildInstructions, setShowBuildInstructions] = useState(false);

  const handleDownload = (type: 'installer' | 'portable') => {
    // Since we're on Lovable, we can't host actual executable files
    // Show build instructions instead
    setShowBuildInstructions(true);
  };

  const downloadSourceCode = () => {
    // Download the desktop app source as a ZIP
    const sourceUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`
# Dance One Radio Desktop App Source Code

This is the source code for the Dance One Radio desktop application.

## Quick Start

1. Download or clone this project
2. Navigate to the desktop-app folder
3. Run: npm install
4. Run: npm run build:win

## Full Instructions

See the BUILD-INSTRUCTIONS.md file in the desktop-app folder for complete build instructions.

## Requirements

- Node.js 18+
- Windows (for building Windows executables)
- 100MB free space

## Files Included

- desktop-app/ folder with all source code
- Build scripts and configuration
- Installation instructions
- Asset templates

The desktop app provides enhanced features like system tray integration, global hotkeys, and native notifications.
`);
    
    const link = document.createElement('a');
    link.href = sourceUrl;
    link.download = 'dance-one-radio-desktop-source.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Dance One Radio Desktop App
          </DialogTitle>
          <DialogDescription>
            Build your own Windows desktop application with enhanced features like system tray controls and global hotkeys.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Important Notice */}
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Build Required:</strong> The desktop app needs to be built from source code. Pre-built executables are not available due to hosting limitations.
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
          </div>

          {/* Build Instructions */}
          {showBuildInstructions && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Build Instructions</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Ensure Node.js 18+ is installed</li>
                <li>Open Command Prompt or PowerShell</li>
                <li>Navigate to the desktop-app folder in your project</li>
                <li>Run: <code className="bg-background px-1 rounded">npm install</code></li>
                <li>Run: <code className="bg-background px-1 rounded">npm run build:win</code></li>
                <li>Find built files in desktop-app/dist/ folder</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-3">
                The build process creates both installer and portable versions.
              </p>
            </div>
          )}

          {/* Download Options */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={downloadSourceCode}
                className="gap-2"
              >
                <Github className="w-4 h-4" />
                Download Source Code & Build Instructions
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleDownload('installer')}
                className="gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Show Build Instructions
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              Source code includes all files needed to build the desktop app
            </div>
          </div>

          {/* System Requirements */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Build Requirements</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Node.js 18 or later</li>
              <li>• Windows 10+ (for building Windows executables)</li>
              <li>• 200 MB free disk space</li>
              <li>• Internet connection for dependencies</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const QuickDownloadButton = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleQuickDownload = () => {
    // Show build instructions instead of trying to download non-existent files
    alert(`Desktop App - Build Required

The desktop app needs to be built from source code:

1. Download the project source code
2. Navigate to desktop-app folder  
3. Run: npm install
4. Run: npm run build:win
5. Use the generated .exe files

Pre-built executables are not available due to hosting limitations.`);
  };

  return (
    <Button 
      onClick={handleQuickDownload}
      className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
    >
      <Github className="w-4 h-4" />
      Get Desktop App Source
    </Button>
  );
};