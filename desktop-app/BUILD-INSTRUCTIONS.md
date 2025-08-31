# Build Instructions for Desktop App

## The Issue
The download buttons are working, but the actual executable files haven't been built yet. The desktop app structure was created but needs to be compiled into Windows executables.

## To Build the Desktop App:

### Prerequisites
1. Node.js 18 or later installed
2. Windows machine (for building Windows executables)

### Build Steps

1. **Navigate to desktop app folder:**
   ```bash
   cd desktop-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the React web app first (from root directory):**
   ```bash
   cd ..
   npm run build
   cd desktop-app
   ```

4. **Generate assets (copy your logo files):**
   - Copy your logo to `desktop-app/assets/icon.png` (256x256)
   - Convert to ICO: `desktop-app/assets/icon.ico`
   - Create tray icons: `desktop-app/assets/tray-icon.png` (16x16)

5. **Run the build script:**
   ```bash
   node build-script.js
   ```

6. **Copy built files to web directory:**
   ```bash
   cp dist/*.exe ../public/downloads/
   ```

### Expected Output
- `Dance-One-Radio-Setup-1.0.0.exe` (Full installer ~50MB)
- `Dance-One-Radio-Portable-1.0.0.exe` (Portable version ~45MB)

### Alternative: Use Placeholder During Development
For now, the download buttons will show an informative message when files aren't available instead of attempting to download non-existent files.

### Troubleshooting Build Issues
- Ensure all dependencies are installed
- Check that Node.js version is 18+
- Verify the React build completed successfully
- Make sure you have proper icons in the assets folder

Once built, the download buttons will work correctly and serve the actual Windows executables.