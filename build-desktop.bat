@echo off
setlocal

echo Building desktop renderer...
call npm run desktop:build
if errorlevel 1 exit /b 1

echo Packaging Windows app...
call npx tauri build --bundles nsis
if errorlevel 1 exit /b 1

echo Done. Installer build is in src-tauri\target\release\bundle\nsis
