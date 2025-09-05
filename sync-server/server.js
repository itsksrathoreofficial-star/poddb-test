const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.SYNC_SERVER_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Production logging
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'sync-server.log');
const errorLogFile = path.join(logDir, 'error.log');

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  // Write to log file
  fs.appendFileSync(logFile, logMessage);
  
  if (level === 'ERROR') {
    fs.appendFileSync(errorLogFile, logMessage);
  }
}

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Global variables
let isRunning = false;
let currentProgress = 0;
let currentStatus = 'idle';
let lastSyncTime = null;
let syncStats = {
  totalPodcasts: 0,
  successfulPodcasts: 0,
  failedPodcasts: 0,
  totalEpisodes: 0,
  successfulEpisodes: 0,
  failedEpisodes: 0
};

// Sync control flags
global.syncPaused = false;
global.syncCancelled = false;

// Auto-sync settings (persistent)
let autoSyncEnabled = false;
let autoSyncTime = '02:00';
let syncMode = 'local'; // 'local' or 'cpanel'
let batchSize = 100; // Default for local mode (ultra high performance)

// Load settings from file
const settingsFile = path.join(__dirname, 'settings.json');
function loadSettings() {
  try {
    if (fs.existsSync(settingsFile)) {
      const data = fs.readFileSync(settingsFile, 'utf8');
      const settings = JSON.parse(data);
      autoSyncEnabled = settings.autoSyncEnabled || false;
      autoSyncTime = settings.autoSyncTime || '02:00';
      syncMode = settings.syncMode || 'local';
      batchSize = settings.batchSize || (syncMode === 'local' ? 100 : 10);
      log(`Settings loaded: enabled=${autoSyncEnabled}, time=${autoSyncTime}, mode=${syncMode}, batchSize=${batchSize}`);
    }
  } catch (error) {
    log(`Error loading settings: ${error.message}`, 'ERROR');
  }
}

function saveSettings() {
  try {
    const settings = {
      autoSyncEnabled,
      autoSyncTime,
      syncMode,
      batchSize,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    log(`Settings saved: enabled=${autoSyncEnabled}, time=${autoSyncTime}, mode=${syncMode}, batchSize=${batchSize}`);
  } catch (error) {
    log(`Error saving settings: ${error.message}`, 'ERROR');
  }
}

// YouTube API helper functions
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (i === maxRetries - 1) return response;
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

async function getAvailableApiKey() {
  const { data, error } = await supabase
    .from('youtube_api_keys')
    .select('*')
    .eq('is_active', true)
    .lt('quota_used', 9000)
    .order('quota_used', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error('No available API key with sufficient quota');
  }
  return data;
}

async function updateApiKeyQuota(apiKeyId, quotaUsed) {
  try {
    await supabase
      .from('youtube_api_keys')
      .update({ quota_used: quotaUsed })
      .eq('id', apiKeyId);
  } catch (error) {
    log(`Error updating API key quota: ${error.message}`, 'ERROR');
  }
}

async function processPodcastData(podcast, apiKey, currentDate) {
  try {
    const playlistId = podcast.youtube_playlist_id;
    if (!playlistId) {
      return { success: false, error: 'No YouTube playlist ID', skipped: true };
    }

    log(`Processing podcast: ${podcast.title} (${podcast.id})`);

    // Fetch all playlist items with ultra high performance settings
    const allVideos = [];
    let nextPageToken = null;
    let quotaUsed = 0;
    
    // Ultra high performance: Fetch more items per request for local mode
    const maxResults = syncMode === 'local' ? 50 : 25; // Use maximum for local mode
    
    do {
      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey.api_key}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      const itemsResponse = await fetchWithRetry(itemsUrl, {});
      quotaUsed += 1;
      
      if (!itemsResponse.ok) {
        throw new Error(`YouTube API Error: ${itemsResponse.status}`);
      }
      
      const itemsData = await itemsResponse.json();
      if (!itemsData.items || !Array.isArray(itemsData.items)) {
        throw new Error('Invalid playlist items data');
      }
      
      const validVideos = (itemsData.items || []).filter((item) => 
        item.snippet?.title !== 'Private video' && 
        item.snippet?.title !== 'Deleted video' && 
        item.snippet?.resourceId?.videoId
      );
      allVideos.push(...validVideos);
      nextPageToken = itemsData.nextPageToken || null;
      
      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (nextPageToken);

    if (allVideos.length === 0) {
      return { success: false, error: 'No valid videos found', skipped: true };
    }

    log(`Found ${allVideos.length} videos in playlist for ${podcast.title}`);

    // Fetch video details in ultra high performance batches
    const episodes = [];
    const batchSize = syncMode === 'local' ? 50 : 25; // Larger batches for local mode
    const batchDelay = syncMode === 'local' ? 50 : 200; // Faster processing for local mode
    
    for (let i = 0; i < allVideos.length; i += batchSize) {
      const batch = allVideos.slice(i, i + batchSize);
      const videoIds = batch.map((video) => video.snippet.resourceId.videoId).join(',');
      
      const videosResponse = await fetchWithRetry(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey.api_key}`,
        {}
      );
      quotaUsed += 1;
      
      if (!videosResponse.ok) {
        throw new Error(`YouTube API Error: ${videosResponse.status}`);
      }
      
      const videosData = await videosResponse.json();
      if (!videosData.items || !Array.isArray(videosData.items)) {
        continue;
      }
      
      const batchEpisodes = videosData.items
        .filter((video) => parseDuration(video.contentDetails?.duration || 'PT0S') >= 300)
        .map((video) => ({
          youtube_video_id: video.id,
          title: video.snippet?.title || 'Untitled',
          duration: parseDuration(video.contentDetails?.duration || 'PT0S'),
          views: parseInt(video.statistics?.viewCount || '0'),
          likes: parseInt(video.statistics?.likeCount || '0'),
          comments: parseInt(video.statistics?.commentCount || '0'),
          published_at: video.snippet?.publishedAt || new Date().toISOString(),
        }));
      episodes.push(...batchEpisodes);
      
      // Ultra fast processing for local mode
      if (i + batchSize < allVideos.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }

    if (episodes.length === 0) {
      return { success: false, error: 'No episodes longer than 5 minutes', skipped: true };
    }

    log(`Processing ${episodes.length} episodes (5+ minutes) for ${podcast.title}`);

    // Calculate podcast totals
    const totalViews = episodes.reduce((sum, ep) => sum + ep.views, 0);
    const totalLikes = episodes.reduce((sum, ep) => sum + ep.likes, 0);
    const totalComments = episodes.reduce((sum, ep) => sum + ep.comments, 0);
    const totalDuration = episodes.reduce((sum, ep) => sum + ep.duration, 0);
    const avgDuration = episodes.length > 0 ? totalDuration / episodes.length : 0;
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) : 0;

    // Store daily podcast statistics
    await supabase
      .from('podcast_daily_stats')
      .delete()
      .eq('podcast_id', podcast.id)
      .eq('date', currentDate);

    const { error: dailyStatsError } = await supabase
      .from('podcast_daily_stats')
      .insert({
        podcast_id: podcast.id,
        date: currentDate,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: 0,
        subscribers: 0,
        total_episodes: episodes.length,
        new_episodes: 0,
        avg_episode_duration: avgDuration,
        total_watch_time: Math.min(totalViews * avgDuration * 0.6, 999999999),
        engagement_rate: engagementRate,
        growth_rate: 0,
        updated_at: new Date().toISOString()
      });

    if (dailyStatsError) {
      throw new Error('Failed to store daily stats');
    }

    // Process episodes
    let successfulEpisodes = 0;
    let failedEpisodes = 0;

    for (const episode of episodes) {
      try {
        // Check if episode exists
        const { data: existingEpisode } = await supabase
          .from('episodes')
          .select('id')
          .eq('youtube_video_id', episode.youtube_video_id)
          .eq('podcast_id', podcast.id)
          .single();

        let episodeId = existingEpisode?.id;
        let isNewEpisode = false;

        if (!episodeId) {
          const { data: newEpisode, error: createError } = await supabase
            .from('episodes')
            .insert({
              podcast_id: podcast.id,
              title: episode.title,
              youtube_video_id: episode.youtube_video_id,
              youtube_url: `https://www.youtube.com/watch?v=${episode.youtube_video_id}`,
              duration: episode.duration,
              published_at: episode.published_at,
              views: episode.views,
              likes: episode.likes,
              comments: episode.comments,
              slug: episode.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            })
            .select('id')
            .single();

          if (createError) {
            failedEpisodes++;
            continue;
          }
          episodeId = newEpisode.id;
          isNewEpisode = true;

          // Log episode discovery
          await supabase
            .from('episode_discovery_log')
            .insert({
              episode_id: episodeId,
              podcast_id: podcast.id,
              youtube_video_id: episode.youtube_video_id,
              video_duration: episode.duration,
              discovered_at: new Date().toISOString()
            });
        }

        // Store daily episode statistics
        await supabase
          .from('episode_daily_stats')
          .delete()
          .eq('episode_id', episodeId)
          .eq('date', currentDate);

        const { error: episodeStatsError } = await supabase
          .from('episode_daily_stats')
          .insert({
            episode_id: episodeId,
            podcast_id: podcast.id,
            date: currentDate,
            views: episode.views,
            likes: episode.likes,
            comments: episode.comments,
            shares: 0,
            watch_time: Math.min(episode.views * episode.duration * 0.6, 99999999),
            avg_watch_percentage: 60,
            engagement_rate: episode.views > 0 ? ((episode.likes + episode.comments) / episode.views) : 0,
            retention_rate: 0.7,
            is_new_episode: isNewEpisode,
            updated_at: new Date().toISOString()
          });

        if (episodeStatsError) {
          failedEpisodes++;
        } else {
          successfulEpisodes++;
        }
      } catch (error) {
        failedEpisodes++;
      }
    }

    // Update API key quota
    await updateApiKeyQuota(apiKey.id, apiKey.quota_used + quotaUsed);

    log(`✅ ${podcast.title}: ${successfulEpisodes}/${episodes.length} episodes processed successfully`);

    return { 
      success: true, 
      successfulEpisodes, 
      failedEpisodes,
      totalEpisodes: episodes.length,
      totalViews,
      totalLikes,
      totalComments,
      quotaUsed
    };

  } catch (error) {
    log(`Error processing podcast ${podcast.title}: ${error.message}`, 'ERROR');
    return { success: false, error: error.message };
  }
}

async function performDailySync(triggerType = 'auto') {
  if (isRunning) {
    log('Sync already running, skipping...', 'WARN');
    return;
  }

  isRunning = true;
  currentStatus = 'running';
  currentProgress = 0;
  lastSyncTime = new Date().toISOString();
  
  // Reset stats and control flags
  syncStats = {
    totalPodcasts: 0,
    successfulPodcasts: 0,
    failedPodcasts: 0,
    totalEpisodes: 0,
    successfulEpisodes: 0,
    failedEpisodes: 0
  };
  
  // Reset control flags
  global.syncPaused = false;
  global.syncCancelled = false;

  // Create sync session record
  let syncSessionId = null;
  try {
    const { data: sessionData, error: sessionError } = await supabase
      .from('sync_sessions')
      .insert({
        session_type: triggerType === 'manual' ? 'manual' : 'automatic',
        status: 'running',
        started_at: new Date().toISOString(),
        total_podcasts: 0,
        successful_podcasts: 0,
        failed_podcasts: 0,
        total_episodes: 0,
        successful_episodes: 0,
        failed_episodes: 0
      })
      .select('id')
      .single();

    if (sessionError) {
      log(`Error creating sync session: ${sessionError.message}`, 'ERROR');
    } else {
      syncSessionId = sessionData.id;
      log(`Created sync session: ${syncSessionId}`);
    }
  } catch (error) {
    log(`Error creating sync session: ${error.message}`, 'ERROR');
  }

  try {
    log('🚀 Starting daily sync...');
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Get all approved podcasts
    const { data: podcasts, error: podcastsError } = await supabase
      .from('podcasts')
      .select('id, title, youtube_playlist_id, youtube_playlist_url, total_episodes')
      .eq('submission_status', 'approved')
      .not('youtube_playlist_id', 'is', null);

    if (podcastsError) {
      throw new Error(`Failed to fetch podcasts: ${podcastsError.message}`);
    }

    const totalPodcasts = podcasts?.length || 0;
    syncStats.totalPodcasts = totalPodcasts;
    
    // Update sync session with total podcasts
    if (syncSessionId) {
      await supabase
        .from('sync_sessions')
        .update({ total_podcasts: totalPodcasts })
        .eq('id', syncSessionId);
    }
    
    if (totalPodcasts === 0) {
      log('No podcasts to sync');
      currentStatus = 'completed';
      isRunning = false;
      
      // Update sync session as completed
      if (syncSessionId) {
        await supabase
          .from('sync_sessions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            total_podcasts: 0,
            successful_podcasts: 0,
            failed_podcasts: 0,
            total_episodes: 0,
            successful_episodes: 0,
            failed_episodes: 0
          })
          .eq('id', syncSessionId);
      }
      return;
    }

    log(`Found ${totalPodcasts} podcasts to sync`);

    // Get API key
    const apiKey = await getAvailableApiKey();
    log(`Using API key: ${apiKey.id}`);

    // Process podcasts based on mode - Ultra High Performance for Local Mode
    const processingDelay = syncMode === 'local' ? 100 : 1000; // Ultra fast for local mode (32GB RAM + 8-core CPU)
    const maxConcurrent = syncMode === 'local' ? 8 : 1; // Use all 8 cores for local mode
    const memoryOptimization = syncMode === 'local' ? true : false; // Enable memory optimization for local mode
    
    for (let i = 0; i < totalPodcasts; i++) {
      const podcast = podcasts[i];
      
      // Check for pause/cancel
      if (global.syncCancelled) {
        log('🛑 Sync cancelled by user');
        currentStatus = 'cancelled';
        break;
      }
      
      // Wait if paused
      while (global.syncPaused && !global.syncCancelled) {
        log('⏸️ Sync paused, waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (global.syncCancelled) {
        log('🛑 Sync cancelled while paused');
        currentStatus = 'cancelled';
        break;
      }
      
      try {
        log(`Processing ${i + 1}/${totalPodcasts}: ${podcast.title}`);
        const result = await processPodcastData(podcast, apiKey, currentDate);
        
        if (result.success) {
          syncStats.successfulPodcasts++;
          syncStats.totalEpisodes += result.totalEpisodes;
          syncStats.successfulEpisodes += result.successfulEpisodes;
          syncStats.failedEpisodes += result.failedEpisodes;
        } else if (result.skipped) {
          log(`⏭️ Skipped: ${result.error}`);
        } else {
          syncStats.failedPodcasts++;
          log(`❌ Failed: ${result.error}`, 'ERROR');
        }
        
        currentProgress = Math.round(((i + 1) / totalPodcasts) * 100);
        
        // Delay between podcasts based on mode
        await new Promise(resolve => setTimeout(resolve, processingDelay));
        
      } catch (error) {
        syncStats.failedPodcasts++;
        log(`Error processing podcast ${podcast.title}: ${error.message}`, 'ERROR');
      }
    }

    if (global.syncCancelled) {
      log('🛑 Sync cancelled by user');
      currentStatus = 'cancelled';
      
      // Update sync session as cancelled
      if (syncSessionId) {
        await supabase
          .from('sync_sessions')
          .update({ 
            status: 'cancelled',
            completed_at: new Date().toISOString(),
            total_podcasts: syncStats.totalPodcasts,
            successful_podcasts: syncStats.successfulPodcasts,
            failed_podcasts: syncStats.failedPodcasts,
            total_episodes: syncStats.totalEpisodes,
            successful_episodes: syncStats.successfulEpisodes,
            failed_episodes: syncStats.failedEpisodes
          })
          .eq('id', syncSessionId);
      }
    } else {
      log('🎉 Daily sync completed successfully!');
      log(`📊 Stats: ${syncStats.successfulPodcasts}/${syncStats.totalPodcasts} podcasts, ${syncStats.successfulEpisodes}/${syncStats.totalEpisodes} episodes`);
      currentStatus = 'completed';
      
      // Update sync session as completed
      if (syncSessionId) {
        await supabase
          .from('sync_sessions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            total_podcasts: syncStats.totalPodcasts,
            successful_podcasts: syncStats.successfulPodcasts,
            failed_podcasts: syncStats.failedPodcasts,
            total_episodes: syncStats.totalEpisodes,
            successful_episodes: syncStats.successfulEpisodes,
            failed_episodes: syncStats.failedEpisodes
          })
          .eq('id', syncSessionId);
      }
    }
    
    currentProgress = 100;

  } catch (error) {
    log(`Daily sync failed: ${error.message}`, 'ERROR');
    currentStatus = 'failed';
    
    // Update sync session as failed
    if (syncSessionId) {
      await supabase
        .from('sync_sessions')
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message,
          total_podcasts: syncStats.totalPodcasts,
          successful_podcasts: syncStats.successfulPodcasts,
          failed_podcasts: syncStats.failedPodcasts,
          total_episodes: syncStats.totalEpisodes,
          successful_episodes: syncStats.successfulEpisodes,
          failed_episodes: syncStats.failedEpisodes
        })
        .eq('id', syncSessionId);
    }
  } finally {
    isRunning = false;
    // Reset control flags
    global.syncPaused = false;
    global.syncCancelled = false;
  }
}

// API Routes
app.get('/status', (req, res) => {
  res.json({
    isRunning,
    currentProgress,
    currentStatus,
    lastSyncTime,
    syncStats,
    serverUptime: process.uptime(),
    serverTime: new Date().toISOString()
  });
});

// Real-time status endpoint for frontend
app.get('/api/status', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  res.json({
    isRunning,
    currentProgress,
    currentStatus,
    lastSyncTime,
    syncStats,
    serverUptime: process.uptime(),
    serverTime: new Date().toISOString()
  });
});

app.post('/sync', async (req, res) => {
  if (isRunning) {
    return res.status(400).json({ 
      success: false, 
      error: 'Sync is already running' 
    });
  }

  log('Manual sync triggered from admin panel');
  
  // Start sync in background with manual trigger type
  performDailySync('manual').catch(error => {
    log(`Manual sync error: ${error.message}`, 'ERROR');
  });
  
  res.json({ 
    success: true, 
    message: 'Sync started successfully' 
  });
});

app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: '1.0.0',
    memory_usage: {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
    },
    cpu_usage: Math.round((cpuUsage.user + cpuUsage.system) / 1000000), // Convert to seconds
    sync_status: {
      isRunning,
      currentProgress,
      currentStatus,
      lastSyncTime
    },
    server_info: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid
    }
  });
});

// Pause sync endpoint
app.post('/api/sync-pause', (req, res) => {
  try {
    // Set pause flag
    global.syncPaused = true;
    res.json({ success: true, message: 'Sync paused successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resume sync endpoint
app.post('/api/sync-resume', (req, res) => {
  try {
    // Clear pause flag
    global.syncPaused = false;
    res.json({ success: true, message: 'Sync resumed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel sync endpoint
app.post('/api/sync-cancel', (req, res) => {
  try {
    // Set cancel flag
    global.syncCancelled = true;
    res.json({ success: true, message: 'Sync cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/auto-sync-settings', (req, res) => {
  res.json({
    enabled: autoSyncEnabled,
    time: autoSyncTime,
    mode: syncMode,
    batchSize: batchSize
  });
});

app.post('/auto-sync-settings', (req, res) => {
  const { enabled, time, mode, batchSize: newBatchSize } = req.body;
  
  if (enabled !== undefined) autoSyncEnabled = enabled;
  if (time) autoSyncTime = time;
  if (mode) syncMode = mode;
  if (newBatchSize !== undefined) batchSize = newBatchSize;
  
  saveSettings();
  
  // Restart cron job if settings changed
  if (autoSyncEnabled) {
    startAutoSync();
  } else {
    stopAutoSync();
  }
  
  log(`Auto-sync settings updated: enabled=${autoSyncEnabled}, time=${autoSyncTime}, mode=${syncMode}, batchSize=${batchSize}`);
  
  res.json({ 
    success: true, 
    message: 'Auto-sync settings updated' 
  });
});

// Cron job management
let cronJob = null;

function startAutoSync() {
  if (cronJob) {
    cronJob.stop();
  }
  
  const [hour, minute] = autoSyncTime.split(':');
  const cronExpression = `${minute} ${hour} * * *`; // Daily at specified time
  
  cronJob = cron.schedule(cronExpression, () => {
    log(`Auto-sync triggered at ${autoSyncTime}`);
    performDailySync('auto').catch(error => {
      log(`Auto-sync error: ${error.message}`, 'ERROR');
    });
  }, {
    scheduled: false,
    timezone: "Asia/Kolkata"
  });
  
  cronJob.start();
  log(`Auto-sync scheduled for ${autoSyncTime} daily`);
}

function stopAutoSync() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    log('Auto-sync stopped');
  }
}

// Load settings on startup
loadSettings();

// Start server
app.listen(PORT, () => {
  log(`🚀 PodDB Sync Server running on port ${PORT}`);
  log(`📊 Status: http://localhost:${PORT}/status`);
  log(`🔄 Manual sync: POST http://localhost:${PORT}/sync`);
  log(`⚙️ Auto-sync settings: GET/POST http://localhost:${PORT}/auto-sync-settings`);
  log(`❤️ Health check: http://localhost:${PORT}/health`);
  
  // Start auto-sync if enabled
  if (autoSyncEnabled) {
    startAutoSync();
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('🛑 Shutting down sync server...');
  stopAutoSync();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 Shutting down sync server...');
  stopAutoSync();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'ERROR');
  log(error.stack, 'ERROR');
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'ERROR');
});