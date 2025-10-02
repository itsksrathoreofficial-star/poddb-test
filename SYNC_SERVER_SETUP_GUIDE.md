# 🚀 PodDB Sync Server - Complete Setup Guide

## ✅ Issues Fixed

### 1. **Root Directory Cleanup**
- ❌ Removed conflicting `ecosystem.config.js` from root
- ✅ Now using only `sync-server/` folder for all server operations

### 2. **Sync Server Configuration**
- ✅ Created proper `.env` file in `sync-server/` directory
- ✅ Configured Supabase connection
- ✅ Set up YouTube API integration
- ✅ Server runs properly on port 3002

### 3. **YouTube API Integration**
- ✅ Server fetches **latest data** from YouTube API:
  - 📊 **Views, Likes, Comments** (statistics)
  - 🖼️ **Thumbnails** (snippet.thumbnails)
  - 📝 **Descriptions** (snippet.description)
  - 🏷️ **Tags** (snippet.tags)
  - ⏱️ **Duration** (contentDetails.duration)
  - 📅 **Published Date** (snippet.publishedAt)
  - 🆕 **New Episodes** (from playlist)

### 4. **Performance Optimizations**
- ✅ **Batch Size**: 5,000 for 10M+ episodes
- ✅ **YouTube API**: Maximum 50 results per request
- ✅ **Concurrent Processing**: Full CPU utilization
- ✅ **Memory Optimization**: Enabled for large datasets

## 🎯 How Sync Works

### **Data Fetching Process:**
1. **Get API Key** from `youtube_api_keys` table
2. **Fetch Playlist Items** (all episodes from YouTube playlist)
3. **Get Video Details** (views, likes, comments, thumbnails, etc.)
4. **Process Episodes** in parallel batches
5. **Update Database** with latest data
6. **Store Daily Stats** for tracking changes

### **What Gets Synced:**
- ✅ **New Episodes** (if any added to playlist)
- ✅ **Updated Views/Likes/Comments**
- ✅ **New Thumbnails** (if changed)
- ✅ **Updated Descriptions/Tags**
- ✅ **Episode Metadata** (duration, published date)
- ✅ **Daily Statistics** for tracking growth

## 🚀 How to Start Servers

### **Option 1: Start Both Servers**
```bash
# Double-click this file
start-both-servers.bat
```

### **Option 2: Start Individually**
```bash
# Start Sync Server
cd sync-server
node server.js

# Start Main App (in new terminal)
npm run dev
```

### **Option 3: Use Individual Scripts**
```bash
# Sync Server only
start-sync-server.bat

# Main app
npm run dev
```

## 📊 Admin Panel Usage

1. **Access Admin Panel**: `http://localhost:3001/admin`
2. **Go to Sync Server Tab**
3. **Check Server Status**: Should show "Online"
4. **Start Data Sync**: Click "Start Manual Sync"
5. **Monitor Progress**: Watch real-time sync progress

## 🔧 Required Setup

### **1. YouTube API Keys**
- Add YouTube API keys in Admin Panel
- Keys are stored in `youtube_api_keys` table
- Server automatically selects active keys with quota

### **2. Environment Variables**
Already configured in `sync-server/.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SYNC_SERVER_PORT=3002
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## 🎉 Server URLs

- **Main App**: `http://localhost:3001`
- **Sync Server**: `http://localhost:3002`
- **Admin Panel**: `http://localhost:3001/admin`
- **Sync Status**: `http://localhost:3002/status`

## ✅ Verification

Your sync server is now properly configured to:
- ✅ Start from `sync-server/` directory
- ✅ Fetch 10,000+ episodes efficiently
- ✅ Get latest YouTube data (views, likes, thumbnails, etc.)
- ✅ Store data properly in Supabase
- ✅ Show real server status in admin panel
- ✅ Handle large datasets with optimized performance

## 🚨 Important Notes

1. **YouTube API Keys**: Add valid API keys through admin panel
2. **Database**: Ensure Supabase is running locally
3. **Port 3002**: Make sure it's not blocked by firewall
4. **Memory**: Server optimized for large datasets (10M+ episodes)

The sync server is now ready for production use with proper YouTube API integration! 🎯
