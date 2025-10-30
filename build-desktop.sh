#!/bin/bash
# Build optimized desktop app

echo "Building optimized desktop app..."
npx vite build --config vite.config.desktop.ts

echo "Desktop build complete! Now building Electron app..."
cd desktop-app
npm run build:win
