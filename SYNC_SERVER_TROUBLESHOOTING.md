# Sync Server Troubleshooting Guide

## Common Issues and Solutions

### 1. Server Won't Start from Admin Panel

**Problem**: Admin panel shows "Server offline" or connection errors when trying to start sync.

**Solutions**:

#### Check if Sync Server is Running
```bash
# Check if port 3002 is in use
netstat -an | findstr :3002

# Or check if Node.js process is running
tasklist | findstr node
```

#### Start Sync Server Manually
```bash
# Navigate to sync-server directory
cd sync-server

# Install dependencies (if not done)
npm install

# Start the server
node server.js
```

#### Use the Startup Script
```bash
# Run the batch file
cd sync-server && npm start
```

### 2. Environment Variables Missing

**Problem**: Sync server fails to start due to missing environment variables.

**Solution**:
1. Copy `sync-server/env-example.txt` to `sync-server/.env`
2. Fill in the required variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SYNC_SERVER_PORT=3002
   ```

### 3. Port Already in Use

**Problem**: Port 3002 is already in use by another process.

**Solution**:
```bash
# Find process using port 3002
netstat -ano | findstr :3002

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change the port in .env file
SYNC_SERVER_PORT=3003
```

### 4. Database Connection Issues

**Problem**: Sync server can't connect to Supabase.

**Solutions**:
- Verify Supabase URL and service role key in `.env`
- Check if Supabase is accessible from your network
- Ensure service role key has proper permissions

### 5. API Endpoints Not Working

**Problem**: Admin panel can't communicate with sync server.

**Solutions**:
- Ensure sync server is running on correct port
- Check if `SYNC_SERVER_URL` environment variable is set correctly
- Verify API endpoints are accessible:
  - `http://localhost:3002/status`
  - `http://localhost:3002/health`
  - `http://localhost:3002/api/status`

### 6. Memory Issues

**Problem**: Sync server crashes due to memory issues.

**Solutions**:
- Increase Node.js memory limit:
  ```bash
  node --max-old-space-size=4096 server.js
  ```
- Reduce batch size in sync settings
- Enable memory optimization in sync controls

### 7. Permission Issues

**Problem**: Sync server can't write to logs or access files.

**Solutions**:
- Run as administrator
- Check folder permissions
- Ensure write access to sync-server directory

## Testing the Sync Server

### 1. Test Server Health
```bash
# Run the test script
cd sync-server && npm run test
```

### 2. Manual API Testing
```bash
# Test health endpoint
curl http://localhost:3002/health

# Test status endpoint
curl http://localhost:3002/status

# Test sync start
curl -X POST http://localhost:3002/sync
```

### 3. Check Logs
```bash
# Check sync server logs
type sync-server\logs\sync-server.log

# Check error logs
type sync-server\logs\error.log
```

## Admin Panel Configuration

### Environment Variables for Next.js App
Add to your `.env.local` file:
```
SYNC_SERVER_URL=http://localhost:3002
```

### Verify API Routes
Ensure these files exist:
- `src/app/api/sync-status/route.ts`
- `src/app/api/sync-start/route.ts`
- `src/app/api/sync-pause/route.ts`
- `src/app/api/sync-resume/route.ts`
- `src/app/api/sync-cancel/route.ts`
- `src/app/api/sync-stop/route.ts`

## Common Error Messages

### "Sync server not responding"
- Check if sync server is running
- Verify port configuration
- Check network connectivity

### "Connection refused"
- Sync server is not running
- Wrong port number
- Firewall blocking connection

### "Timeout error"
- Sync server is overloaded
- Network issues
- Database connection problems

### "Authentication failed"
- Wrong Supabase credentials
- Service role key expired
- Insufficient permissions

## Performance Optimization

### For Large Datasets
1. Increase memory limit: `node --max-old-space-size=8192 server.js`
2. Reduce batch size in sync settings
3. Enable memory optimization
4. Use smaller chunk sizes

### For Slow Networks
1. Increase timeout values
2. Reduce concurrent operations
3. Add more delays between requests
4. Use retry logic

## Monitoring and Debugging

### Enable Debug Logging
Set in sync server environment:
```
DEBUG=true
LOG_LEVEL=DEBUG
```

### Monitor Resources
- Check CPU usage
- Monitor memory consumption
- Watch disk space
- Check network bandwidth

### Log Analysis
- Check error patterns
- Monitor success rates
- Track performance metrics
- Identify bottlenecks

## Quick Fixes

### Restart Everything
```bash
# Stop all Node.js processes
taskkill /F /IM node.exe

# Start sync server
cd sync-server
node server.js

# Start Next.js app (in another terminal)
npm run dev
```

### Reset Configuration
```bash
# Delete settings file
del sync-server\settings.json

# Restart sync server
node server.js
```

### Clear Logs
```bash
# Clear log files
del sync-server\logs\*.log

# Restart sync server
node server.js
```

## Getting Help

If you're still having issues:

1. Check the logs in `sync-server/logs/`
2. Run the test script: `cd sync-server && npm run test`
3. Verify all environment variables are set
4. Ensure all dependencies are installed
5. Check if ports are available
6. Verify database connectivity

## Success Indicators

When everything is working correctly, you should see:
- ✅ Sync server starts without errors
- ✅ Admin panel shows "Server Online"
- ✅ Status endpoint returns valid data
- ✅ Sync operations work without timeouts
- ✅ No memory or connection errors in logs
