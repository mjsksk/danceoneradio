# Desktop App Assets

This folder contains assets needed for the desktop application:

## Required Files:
- `icon.png` - Main app icon (256x256 or larger PNG)
- `icon.ico` - Windows icon file (generated from PNG)
- `tray-icon.png` - System tray icon (16x16 or 32x32 PNG)
- `tray-icon@2x.png` - High DPI tray icon (32x32 or 64x64 PNG)

## How to Generate Icons:

1. **Main Icon (icon.png)**:
   - Use your existing logo: `/public/lovable-uploads/dance-one-logo.png`
   - Resize to 256x256 pixels
   - Save as PNG with transparency

2. **Windows Icon (icon.ico)**:
   - Convert the PNG to ICO format using online tools or ImageMagick
   - Include multiple sizes: 16x16, 32x32, 48x48, 256x256

3. **Tray Icons**:
   - Create simplified version of your logo for small display
   - Should be monochromatic or minimal color
   - Save as 16x16 and 32x32 PNG files

## Installation:
1. Copy your generated icons to this folder
2. Update the paths in main.js and package.json if needed
3. Run `npm run build` to package the app with the new icons