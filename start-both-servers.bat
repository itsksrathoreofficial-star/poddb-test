@echo off
echo ================================================
echo   PodDB - Starting Both Servers (Fixed Version)
echo ================================================

echo.
echo [1/2] Starting Sync Server...
echo   - Using working logic from temp folder
echo   - Port: 3002
start "PodDB Sync Server" cmd /k "cd sync-server && node server.js"

echo.
echo Waiting for sync server to start...
timeout /t 5 /nobreak >nul

echo.
echo [2/2] Starting Main Application...
echo   - Port: 3000 or 3001 (auto-detect)
start "PodDB Main App" cmd /k "npm run dev"

echo.
echo ================================================
echo   Servers Starting...
echo ================================================
echo - Sync Server: http://localhost:3002/status
echo - Main App: http://localhost:3000 or http://localhost:3001
echo - Admin Panel: http://localhost:3001/admin
echo.
echo ✅ Fixed Issues:
echo   - Daily gain API errors resolved
echo   - Podcast ID validation added
echo   - Working sync server logic implemented
echo   - Proper data synchronization enabled
echo.
echo Press any key to close this window...
pause >nul
