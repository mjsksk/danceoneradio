# Downloads Directory

This directory should contain the desktop application installers for distribution.

## Required Files:

1. **Dance-One-Radio-Setup-1.0.0.exe** - Full installer with uninstaller and shortcuts
2. **Dance-One-Radio-Portable-1.0.0.exe** - Portable version that runs without installation

## How to Generate These Files:

1. Build the desktop app using the build script:
   ```bash
   cd desktop-app
   node build-script.js
   ```

2. The generated files will be in `desktop-app/dist/`

3. Copy the installer files to this `public/downloads/` directory:
   ```bash
   cp desktop-app/dist/*.exe public/downloads/
   ```

## File Sizes (Approximate):
- Full Installer: ~50-60 MB
- Portable Version: ~45-55 MB

## Distribution:
These files will be served directly from your website when users click the download buttons.

## Security:
Consider code signing the executables to reduce Windows security warnings during installation.

## Updates:
When releasing new versions:
1. Update version numbers in desktop-app/package.json
2. Rebuild using the build script
3. Replace files in this directory
4. Update version references in the download components