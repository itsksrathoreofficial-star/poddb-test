#!/bin/bash
# PodDB Sync Server Startup Script

cd "$(dirname "$0")"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2..."
    npm install -g pm2
fi

# Start the server with PM2
echo "Starting PodDB Sync Server..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup (if not already done)
pm2 startup

echo "PodDB Sync Server started successfully!"
echo "Server is running on port 3002"
echo "Use 'pm2 logs sync-server' to view logs"
echo "Use 'pm2 stop sync-server' to stop the server"
