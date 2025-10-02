@echo off
echo ========================================
echo    PodDB Sync Server Startup Script
echo ========================================
echo.

echo [1/3] Starting Sync Server...
start "PodDB Sync Server" cmd /k "cd sync-server && node server.js"
timeout /t 3 /nobreak >nul

echo [2/3] Waiting for sync server to initialize...
timeout /t 5 /nobreak >nul

echo [3/3] Testing sync server connection...
cd sync-server && npm run test

echo.
echo ========================================
echo    Sync Server Status
echo ========================================
echo.
echo If you see any errors above, please check:
echo 1. Node.js is installed
echo 2. Dependencies are installed (npm install)
echo 3. Environment variables are set (.env file)
echo 4. Port 3002 is available
echo.
echo Once sync server is running, start your Next.js app:
echo npm run dev
echo.
echo Admin panel will be available at:
echo http://localhost:3000/admin
echo.
pause
