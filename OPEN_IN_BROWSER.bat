@echo off
setlocal
cd /d "%~dp0"
title Zine Maker
set PORT=5178

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js/npm is not installed or not on PATH.
  echo Install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

if not exist "package.json" (
  echo ERROR: package.json not found in this folder.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies - first run...
  call npm install
  if errorlevel 1 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo ==========================================
echo   Zine Maker
echo ==========================================
echo.
echo Opening http://localhost:%PORT%/
echo Press Ctrl+C to stop the server.
echo.

call npm run dev -- --host 127.0.0.1 --port %PORT% --strictPort --open
if errorlevel 1 (
  echo.
  echo Dev server failed. Is port %PORT% already in use?
  pause
)
endlocal