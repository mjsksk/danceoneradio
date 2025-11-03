@echo off
echo Cleaning old builds...
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build

echo Building portable app without custom icon...
npx electron-builder --win portable --x64

echo Done! Check dist folder for the .exe
