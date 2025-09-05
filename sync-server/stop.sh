#!/bin/bash
# PodDB Sync Server Stop Script

cd "$(dirname "$0")"

echo "Stopping PodDB Sync Server..."
pm2 stop sync-server

echo "PodDB Sync Server stopped!"
