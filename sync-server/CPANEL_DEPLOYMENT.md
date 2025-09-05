# cPanel Deployment Guide

## Prerequisites

1. **Node.js Support**: Your cPanel hosting must support Node.js (most modern hosts do)
2. **SSH Access**: You need SSH access to your cPanel account
3. **Domain/Subdomain**: A domain or subdomain for the sync server

## Step 1: Upload Files

### Via cPanel File Manager:
1. Login to your cPanel
2. Go to **File Manager**
3. Navigate to your domain's public_html folder
4. Create a new folder called `sync-server`
5. Upload all files from the `sync-server` folder to this directory

### Via FTP/SFTP:
```bash
# Upload all files to your domain/sync-server/ directory
scp -r sync-server/* user@poddb.pro:public_html/sync-server/
```

## Step 2: Setup Environment

1. **Edit .env file** in cPanel File Manager:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
   SYNC_SERVER_PORT=3002
   ```

2. **Set proper permissions**:
   ```bash
   chmod 755 sync-server/
   chmod 644 sync-server/.env
   chmod 755 sync-server/start.sh
   chmod 755 sync-server/stop.sh
   chmod 755 sync-server/restart.sh
   ```

## Step 3: Install Dependencies

### Via SSH:
```bash
cd public_html/sync-server
npm install --production
```

### Via cPanel Terminal:
1. Go to **Terminal** in cPanel
2. Navigate to your sync-server directory
3. Run: `npm install --production`

## Step 4: Install PM2

```bash
npm install -g pm2
```

## Step 5: Start the Server

```bash
# Start with PM2
./start.sh

# Or manually
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 6: Configure Auto-Start

```bash
# Setup PM2 to start on server reboot
pm2 startup
pm2 save
```

## Step 7: Test the Server

1. **Check if server is running**:
   ```bash
   pm2 status
   ```

2. **Test the endpoints**:
   ```bash
   curl http://poddb.pro:3002/health
   curl http://poddb.pro:3002/status
   ```

3. **View logs**:
   ```bash
   pm2 logs sync-server
   ```

## Step 8: Configure Firewall (if needed)

If your server has a firewall, allow port 3002:
```bash
# For UFW (Ubuntu)
sudo ufw allow 3002

# For iptables
sudo iptables -A INPUT -p tcp --dport 3002 -j ACCEPT
```

## Step 9: Update Admin Panel

Update your main application's environment variables:
```env
SYNC_SERVER_URL=http://poddb.pro:3002
```

## Troubleshooting

### Server Won't Start
```bash
# Check logs
pm2 logs sync-server

# Check if port is in use
netstat -tulpn | grep 3002

# Restart server
pm2 restart sync-server
```

### Permission Issues
```bash
# Fix permissions
chmod -R 755 sync-server/
chown -R user:user sync-server/
```

### Node.js Not Found
```bash
# Check Node.js version
node --version

# If not installed, contact your hosting provider
```

### PM2 Not Found
```bash
# Install PM2 globally
npm install -g pm2

# Or use npx
npx pm2 start ecosystem.config.js
```

## Production Checklist

- [ ] ✅ Server files uploaded to cPanel
- [ ] ✅ .env file configured with correct Supabase credentials
- [ ] ✅ Dependencies installed (`npm install --production`)
- [ ] ✅ PM2 installed globally
- [ ] ✅ Server started with PM2
- [ ] ✅ PM2 configured for auto-start
- [ ] ✅ Firewall configured (if needed)
- [ ] ✅ Admin panel updated with server URL
- [ ] ✅ Server responding to health checks
- [ ] ✅ Auto-sync settings configured

## Monitoring

### Check Server Status
```bash
pm2 status
pm2 logs sync-server --lines 50
```

### Restart Server
```bash
pm2 restart sync-server
```

### Stop Server
```bash
pm2 stop sync-server
```

### Update Server
```bash
# Stop server
pm2 stop sync-server

# Upload new files
# Install new dependencies (if any)
npm install --production

# Start server
pm2 start sync-server
```

## Security Notes

1. **Firewall**: Only allow port 3002 from your main application
2. **Environment Variables**: Keep your .env file secure
3. **Logs**: Regularly check logs for any issues
4. **Updates**: Keep dependencies updated

## Support

If you encounter any issues:

1. Check the logs: `pm2 logs sync-server`
2. Verify environment variables in .env
3. Ensure all dependencies are installed
4. Check if port 3002 is accessible
5. Verify Supabase credentials are correct

Your sync server should now be running in production and automatically syncing data daily!
