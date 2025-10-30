@echo off
echo Building desktop app...

REM Build the desktop bundle
call npx vite build --outDir desktop-app/dist --emptyOutDir

REM Build electron app
cd desktop-app
call npm run build:win

echo Done!
