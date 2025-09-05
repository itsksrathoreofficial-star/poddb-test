@echo off
echo Starting PodDB Sync Server...

cd /d "%~dp0"

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo PM2 not found. Installing PM2...
    npm install -g pm2
)

REM Start the server
pm2 start ecosystem.config.js

REM Save PM2 configuration
pm2 save

echo PodDB Sync Server started successfully!
echo Server is running on port 3002
echo Use 'pm2 logs poddb-sync' to view logs
echo Use 'pm2 stop poddb-sync' to stop the server

pause
