# Dance One Radio Desktop App

A Windows desktop application for Dance One Radio built with Electron and React.

## 🚀 Quick Start

1. **Prerequisites**:
   - Node.js 18 or later
   - npm or yarn package manager

2. **Setup**:
   ```bash
   # Install desktop app dependencies
   cd desktop-app
   npm install
   
   # Build the React web app first
   cd ..
   npm run build
   
   # Return to desktop app and build
   cd desktop-app
   npm run build:win
   ```

3. **Development**:
   ```bash
   # Start the web app in development mode
   npm run dev  # In root directory
   
   # Start the desktop app in development mode (in another terminal)
   cd desktop-app
   npm run dev
   ```

## 📦 Building for Distribution

1. **Generate Assets**:
   - Copy your logo to `desktop-app/assets/icon.png` (256x256)
   - Convert to ICO format and save as `desktop-app/assets/icon.ico`
   - Create tray icons: `tray-icon.png` (16x16) and `tray-icon@2x.png` (32x32)

2. **Build**:
   ```bash
   cd desktop-app
   node build-script.js
   ```

3. **Output**:
   - `dist/Dance One Radio-Setup-1.0.0.exe` - Full installer
   - `dist/Dance One Radio-Portable-1.0.0.exe` - Portable version

## ✨ Features

### Core Features
- 🎵 Live radio streaming with enhanced audio quality
- 🔧 System tray integration with play/pause controls
- ⌨️ Global hotkeys (Ctrl+Shift+P for play/pause, Ctrl+M to minimize)
- 🎵 Media key support (Play/Pause, Next, Previous)
- 🔔 Native Windows notifications for track changes
- 📱 Multiple window modes (full-size, compact)
- 🎨 Real-time audio visualizer with frequency analysis

### Desktop-Specific Enhancements
- **System Tray**: Click to show/hide, double-click to restore
- **Always Available**: Runs in background, quick access via tray
- **Windows Integration**: Shows in taskbar media controls and lock screen
- **Auto-Update**: Built-in update mechanism (when configured)
- **Performance**: Optimized for long-running sessions

### Keyboard Shortcuts
- `Ctrl+Shift+P` - Play/Pause toggle
- `Ctrl+M` - Minimize to system tray
- `Media Keys` - Native media key support
- `Double-click tray icon` - Restore window

## 🔧 Configuration

### Auto-Launch (Optional)
The installer can be configured to start the app with Windows. Users can enable this during installation or later via Windows settings.

### Window Modes
- **Full Mode**: Complete interface with all features
- **Mini Mode**: Compact player for desktop overlay
- **Tray Mode**: Hidden to system tray, accessible via right-click menu

## 📁 Project Structure

```
desktop-app/
├── main.js              # Electron main process
├── preload.js           # Security bridge between main and renderer
├── package.json         # Desktop app configuration
├── build-script.js      # Automated build script
├── installer-config.nsh # NSIS installer customization
└── assets/              # App icons and resources
    ├── icon.png         # Main app icon (256x256)
    ├── icon.ico         # Windows icon
    ├── tray-icon.png    # System tray icon (16x16)
    └── tray-icon@2x.png # High DPI tray icon (32x32)
```

## 🔒 Security

- **Context Isolation**: Renderer and main processes are isolated
- **No Node Integration**: Renderer process has no direct Node.js access
- **Secure Preload**: Controlled API exposure via contextBridge
- **CSP Compliant**: Works with Content Security Policy headers

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**:
   - Ensure React app is built first: `npm run build`
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall

2. **Icons Missing**:
   - Check `desktop-app/assets/` folder
   - Icons must be proper sizes (see assets/README.md)
   - ICO file required for Windows

3. **Audio Issues**:
   - Desktop app uses same stream URLs as web version
   - Check Windows audio permissions
   - Verify stream URLs are accessible

4. **Tray Not Working**:
   - Ensure tray icons exist and are correct size
   - Check Windows notification area settings
   - Verify system tray is enabled

### Debug Mode

```bash
# Run in development with DevTools
cd desktop-app
npm run dev
```

## 📱 Distribution

1. **Upload to Website**:
   - Add download section to your website
   - Provide both installer and portable versions
   - Include system requirements and screenshots

2. **Code Signing** (Optional):
   - Purchase code signing certificate
   - Configure electron-builder with certificate
   - Reduces Windows security warnings

3. **Auto-Updates** (Optional):
   - Set up GitHub releases or update server
   - Configure update endpoint in package.json
   - Test update mechanism thoroughly

## 🎯 Next Steps

1. **Test Thoroughly**:
   - Test on different Windows versions
   - Verify all features work as expected
   - Test installer and uninstaller

2. **Customize**:
   - Update app metadata in package.json
   - Customize installer messages in installer-config.nsh
   - Add your branding to all assets

3. **Deploy**:
   - Upload installers to your website
   - Create download page with instructions
   - Announce to your audience

## 📞 Support

For issues specific to the desktop app, check:
1. Console logs (F12 in development mode)
2. Windows Event Viewer for system-level issues
3. Electron documentation for advanced configuration

The desktop app maintains feature parity with your web version while adding desktop-specific enhancements for the best user experience.