# Downloads Directory

This directory contains desktop installers that are served directly from the website.

## Current Files

1. `dance-one-radio-<version>-macos-arm64.dmg` - macOS Apple Silicon desktop installer
2. Windows installers can continue to be hosted from GitHub Releases or copied into this folder if you want fully local hosting

## How to Generate the macOS DMG

1. Build the desktop app using the build script:
   ```bash
   npm run build:desktop:mac
   ```

2. The generated files will be in:
   - `src-tauri/target/release/bundle/macos/`
   - `src-tauri/target/release/bundle/dmg/`

3. Copy the DMG into this directory when you want the website to host it directly:
   ```bash
   cp src-tauri/target/release/bundle/dmg/dance-one-radio-<version>-macos-arm64.dmg public/downloads/
   ```

## File Sizes (Approximate)
- macOS Apple Silicon DMG: ~6 MB

## Distribution
These files will be served directly from your website when users click the download buttons.

## Security
The current macOS build is unsigned. For the smoothest public release, code signing and notarization should be added before broad distribution.

## Updates
When releasing new versions:
1. Update the version in `src-tauri/tauri.conf.json`
2. Rebuild using `npm run build:desktop:mac`
3. Replace the DMG in this directory
4. Update version references in the download components if the public filename changes
