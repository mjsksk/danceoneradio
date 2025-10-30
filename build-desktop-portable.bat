@echo off
echo ========================================
echo Building Dance One Radio Desktop App
echo ========================================
echo.

echo Step 1: Building React web app...
call npm run build
if errorlevel 1 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)
echo.

echo Step 2: Copying build to desktop-app folder...
if exist desktop-app\dist rmdir /s /q desktop-app\dist
xcopy /E /I /Y dist desktop-app\dist
echo Build copied successfully!
echo.

echo Step 3: Building Electron portable app...
cd desktop-app
call build-simple.bat
if errorlevel 1 (
    echo ERROR: Electron build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Your portable .exe file is ready at:
echo desktop-app\dist\DanceOneRadio.exe
echo.
echo Upload this file to Supabase Storage at:
echo https://supabase.com/dashboard/project/upbwlnpycrbhxahjztrf/storage/buckets
echo Bucket: Software
echo Filename: DanceOneRadio-1.0.0.exe
echo.
pause
