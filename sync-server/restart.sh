 
 #!/bin/bash
# PodDB Sync Server Restart Script

cd "$(dirname "$0")"

echo "Restarting PodDB Sync Server..."
pm2 restart sync-server

echo "PodDB Sync Server restarted!"
