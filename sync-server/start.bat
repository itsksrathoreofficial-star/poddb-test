@echo off
echo Starting PodDB Sync Server...
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Checking environment configuration...
if not exist .env (
    if exist env-example.txt (
        echo Creating .env file from template...
        copy env-example.txt .env
        echo Please edit .env file with your configuration
    ) else (
        echo Warning: No .env file found. Please create one with your configuration.
    )
)

echo.
echo Starting sync server...
node server.js

pause
