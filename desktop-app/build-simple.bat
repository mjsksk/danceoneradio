@echo off
echo Cleaning old builds...
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build

echo Building portable app (no icons)...
npx electron-builder --win ^
  --x64 ^
  --config.appId=com.danceoneradio.app ^
  --config.productName=DanceOneRadio ^
  --config.win.target=portable ^
  --config.directories.output=dist ^
  --config.files[0]=main.js ^
  --config.files[1]=preload.js ^
  --config.files[2]=dist/**/*

echo Done! Check dist folder for the .exe
