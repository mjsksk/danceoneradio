@echo off
REM Build optimized desktop app

echo Building optimized desktop app...
call npx vite build --config vite.config.desktop.ts

echo Desktop build complete! Now building Electron app...
cd desktop-app
call npm run build:win
