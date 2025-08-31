const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building Dance One Radio Desktop App...\n');

// Step 1: Build the React app
console.log('📦 Building React application...');
try {
  execSync('npm run build', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  console.log('✅ React build completed\n');
} catch (error) {
  console.error('❌ React build failed:', error.message);
  process.exit(1);
}

// Step 2: Check for required assets
console.log('🎨 Checking desktop assets...');
const assetsDir = path.join(__dirname, 'assets');
const requiredAssets = ['icon.png', 'icon.ico', 'tray-icon.png'];

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const missingAssets = requiredAssets.filter(asset => 
  !fs.existsSync(path.join(assetsDir, asset))
);

if (missingAssets.length > 0) {
  console.log('⚠️  Missing assets (using placeholders):');
  missingAssets.forEach(asset => console.log(`   - ${asset}`));
  
  // Create placeholder icons
  const placeholderContent = 'placeholder';
  missingAssets.forEach(asset => {
    fs.writeFileSync(path.join(assetsDir, asset), placeholderContent);
  });
}

console.log('✅ Assets check completed\n');

// Step 3: Install desktop dependencies
console.log('📥 Installing desktop dependencies...');
try {
  execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Dependency installation failed:', error.message);
  process.exit(1);
}

// Step 4: Build the desktop app
console.log('🔨 Building desktop application...');
try {
  execSync('npm run build:win', { cwd: __dirname, stdio: 'inherit' });
  console.log('✅ Desktop app build completed\n');
} catch (error) {
  console.error('❌ Desktop app build failed:', error.message);
  process.exit(1);
}

console.log('🎉 Build completed successfully!');
console.log('📁 Output directory: desktop-app/dist/');
console.log('🚀 Installer: Dance One Radio-Setup-1.0.0.exe');
console.log('💼 Portable: Dance One Radio-Portable-1.0.0.exe\n');

// Step 5: Generate installation instructions
const instructions = `
# Dance One Radio Desktop App

## Installation Files Generated:

1. **Installer**: \`Dance One Radio-Setup-1.0.0.exe\`
   - Full installer with uninstaller
   - Creates Start Menu shortcuts
   - Creates Desktop shortcut
   - Recommended for most users

2. **Portable**: \`Dance One Radio-Portable-1.0.0.exe\`
   - No installation required
   - Run directly from any location
   - Perfect for USB drives or temporary use

## Features:

- 🎵 Full radio streaming with enhanced audio quality
- 🔧 System tray integration with play/pause controls
- ⌨️ Global hotkeys and media key support
- 🔔 Native Windows notifications for track changes
- 🎨 Windows 11 media session integration
- 📱 Compact and full-size window modes
- 🚀 Auto-launch on Windows startup (optional)

## System Requirements:

- Windows 10 or later (64-bit recommended)
- 4 GB RAM minimum
- 100 MB free disk space
- Internet connection for streaming

## Keyboard Shortcuts:

- **Ctrl+Shift+P**: Play/Pause
- **Ctrl+M**: Minimize to tray
- **Media Keys**: Play/Pause, Next, Previous (when supported)

## Distribution:

Upload the generated installer files to your website's download section.
Users can choose between the full installer or portable version.
`;

fs.writeFileSync(path.join(__dirname, 'dist', 'README.md'), instructions);
console.log('📝 Installation instructions saved to dist/README.md');