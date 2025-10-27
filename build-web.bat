@echo off
echo Building web app...
node_modules\.bin\vite build
if %errorlevel% neq 0 exit /b %errorlevel%
echo Web app built successfully!
