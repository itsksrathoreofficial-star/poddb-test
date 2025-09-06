// supabase/functions/fetch-youtube-data/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to create a response
const createResponse = (body: any, status: number) => {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
};

// YouTube API quota costs (units per call)
const QUOTA_COSTS = {
  playlistsList: 1,
  playlistItemsList: 1,
  videosList: 1
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Exponential backoff with jitter
function getRetryDelay(attempt: number): number {
  const delay = Math.min(RETRY_CONFIG.baseDelay * Math.pow(2, attempt), RETRY_CONFIG.maxDelay);
  const jitter = Math.random() * 0.1 * delay; // 10% jitter
  return delay + jitter;
}

// Retry wrapper for fetch operations
async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = RETRY_CONFIG.maxRetries): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful, return immediately
      if (response.ok) {
        return response;
      }
      
      // If it's a client error (4xx), don't retry
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      // For server errors (5xx) or network errors, retry
      if (attempt === maxRetries) {
        return response; // Return the last response if we've exhausted retries
      }
      
      // Wait before retrying
      const delay = getRetryDelay(attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      lastError = errorObj;
      
      if (attempt === maxRetries) {
        throw errorObj;
      }
      
      // Wait before retrying
      const delay = getRetryDelay(attempt);
      console.log(`Attempt ${attempt + 1} failed with error: ${errorObj.message}, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

// Get next available API key with quota
async function getAvailableApiKey(supabase: SupabaseClient) {
  try {
    const { data: apiKeys, error } = await supabase
        .from('youtube_api_keys')
        .select('id, api_key, quota_used, quota_limit')
        .eq('is_active', true)
        .order('quota_used', { ascending: true })
        .limit(1);

    if (error) {
      console.error('Query error fetching API key:', error);
      return null;
    }
    if (!apiKeys || apiKeys.length === 0) {
      console.error('No active API keys found.');
      return null;
    }

    const selectedKey = apiKeys[0];
    const quotaUsed = Number(selectedKey.quota_used) || 0;
    const quotaLimit = Number(selectedKey.quota_limit) || 10000;

    if (quotaUsed >= quotaLimit) {
      console.error(`Key ${selectedKey.id} has exhausted its quota.`);
      return null;
    }
    
    console.log(`Selected API key: ${selectedKey.id}, Quota: ${quotaUsed}/${quotaLimit}`);
    return {
      key: selectedKey.api_key.trim(),
      id: selectedKey.id,
      quota_used: quotaUsed,
      quota_limit: quotaLimit
    };
  } catch (error) {
    console.error('Error in getAvailableApiKey:', error);
    return null;
  }
}

// Update API key usage atomically
async function updateApiKeyUsage(supabase: SupabaseClient, keyId: string, quotaUnits: number) {
  if (quotaUnits <= 0) return;
  try {
    const { error } = await supabase.rpc('increment_quota_used', {
      key_id: keyId,
      increment_by: quotaUnits
    });
    if (error) {
      console.error(`Failed to update quota for key ${keyId}:`, error);
    } else {
        console.log(`Updated quota for key ${keyId}: +${quotaUnits} units.`);
    }
  } catch (error) {
    console.error('Critical error updating API key usage:', error);
  }
}

// Helper function to parse duration from YouTube format (PT4M13S) to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return (hours * 3600) + (minutes * 60) + seconds;
}

// Extract playlist ID from YouTube URL
function extractPlaylistId(url: string): string | null {
  const patterns = [
    /[?&]list=([^&#]*)/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Validate YouTube API response
function validateYouTubeResponse(data: any, endpoint: string): boolean {
  if (!data) {
    console.error(`${endpoint}: No data received`);
    return false;
  }
  
  if (data.error) {
    console.error(`${endpoint}: API Error:`, data.error);
    return false;
  }
  
  if (!data.items || !Array.isArray(data.items)) {
    console.error(`${endpoint}: Invalid items array`);
    return false;
  }
  
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Add a simple test endpoint
  if (req.method === 'GET') {
    return createResponse({ 
      message: 'Edge Function is working',
      timestamp: new Date().toISOString(),
      env: {
        hasUrl: !!Deno.env.get('SUPABASE_URL'),
        hasKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    }, 200);
  }

  // Add a test endpoint for checking API keys
  if (req.method === 'POST' && req.url.includes('test')) {
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseKey) {
        return createResponse({ 
          error: 'Missing environment variables',
          env: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }
        }, 500);
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Check if there are any API keys
      const { data: apiKeys, error } = await supabase
        .from('youtube_api_keys')
        .select('id, api_key, quota_used, quota_limit, is_active')
        .eq('is_active', true);
      
      if (error) {
        return createResponse({ error: 'Database error', details: error }, 500);
      }
      
      return createResponse({ 
        message: 'API keys check',
        apiKeysCount: apiKeys?.length || 0,
        apiKeys: apiKeys?.map(k => ({ 
          id: k.id, 
          quota_used: k.quota_used, 
          quota_limit: k.quota_limit,
          is_active: k.is_active 
        })) || []
      }, 200);
    } catch (error) {
      return createResponse({ error: 'Test failed', details: error }, 500);
    }
  }

  const startTime = Date.now();
  let apiKeyInfo: Awaited<ReturnType<typeof getAvailableApiKey>> | null = null;
  let totalQuotaUnits = 0;
  
  try {
    console.log('Edge Function started at:', new Date().toISOString());
    console.log('Request method:', req.method);
    
    // Validate request
    if (req.method !== 'POST') {
      return createResponse({ error: 'Method not allowed' }, 405);
    }

    const body = await req.json().catch(() => ({}));
    const { playlistUrl } = body;
    
    console.log('Received playlist URL:', playlistUrl);
    
    if (!playlistUrl) {
      return createResponse({ error: 'Playlist URL is required' }, 400);
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return createResponse({ error: 'Invalid YouTube playlist URL' }, 400);
    }

    console.log('Extracted playlist ID:', playlistId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey 
      });
      return createResponse({ error: 'Server configuration error' }, 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created successfully');

    // Get API key
    apiKeyInfo = await getAvailableApiKey(supabase);
    if (!apiKeyInfo) {
      console.error('No available API key found');
      return createResponse({ error: 'No available YouTube API keys with quota.' }, 503);
    }
    
    const YOUTUBE_API_KEY = apiKeyInfo.key;
    console.log('Using API key:', apiKeyInfo.id);

    // Check quota before proceeding
    const estimatedQuota = 1 + Math.ceil(1000 / 50) * 2;
    if (apiKeyInfo.quota_used + estimatedQuota >= apiKeyInfo.quota_limit) {
        console.error('Insufficient quota:', apiKeyInfo.quota_used + estimatedQuota, '>=', apiKeyInfo.quota_limit);
        return createResponse({ error: 'Insufficient API quota available. Try again later or add a new key.' }, 429);
    }
    
    console.log(`Starting fetch for playlist: ${playlistId}`);
    
    // Fetch playlist details with retry
    const playlistResponse = await fetchWithRetry(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${YOUTUBE_API_KEY}`,
      {}
    );
    totalQuotaUnits += QUOTA_COSTS.playlistsList;
    
    if (!playlistResponse.ok) {
      const errorText = await playlistResponse.text();
      console.error('Playlist API error:', errorText);
      throw new Error(`YouTube API Error (Playlists): ${playlistResponse.status} ${playlistResponse.statusText}`);
    }
    
    const playlistData = await playlistResponse.json();
    if (!validateYouTubeResponse(playlistData, 'Playlists')) {
      throw new Error('Invalid playlist data received from YouTube API');
    }
    
    if (!playlistData.items || playlistData.items.length === 0) {
      return createResponse({ error: 'Playlist not found or is private/unlisted.' }, 404);
    }
    
    const playlist = playlistData.items[0];
    const allVideos: any[] = [];
    let nextPageToken: string | null = null;
    
    // Fetch all playlist items with retry
    do {
      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      const itemsResponse = await fetchWithRetry(itemsUrl, {});
      totalQuotaUnits += QUOTA_COSTS.playlistItemsList;
      
      if (!itemsResponse.ok) {
        const errorText = await itemsResponse.text();
        console.error('PlaylistItems API error:', errorText);
        throw new Error(`YouTube API Error (PlaylistItems): ${itemsResponse.status} ${itemsResponse.statusText}`);
      }
      
      const itemsData = await itemsResponse.json();
      if (!validateYouTubeResponse(itemsData, 'PlaylistItems')) {
        throw new Error('Invalid playlist items data received from YouTube API');
      }
      
      const validVideos = (itemsData.items || []).filter((item: any) => 
        item.snippet?.title !== 'Private video' && 
        item.snippet?.title !== 'Deleted video' && 
        item.snippet?.resourceId?.videoId
      );
      allVideos.push(...validVideos);
      nextPageToken = itemsData.nextPageToken || null;
      
      // Add small delay to avoid rate limiting
      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (nextPageToken);

    if (allVideos.length === 0) {
      return createResponse({ error: 'No valid videos found in playlist.' }, 400);
    }

    console.log(`Found ${allVideos.length} valid videos in playlist`);

    // Fetch video details in batches
    const episodes: any[] = [];
    for (let i = 0; i < allVideos.length; i += 50) {
      const batch = allVideos.slice(i, i + 50);
      const videoIds = batch.map((video: any) => video.snippet.resourceId.videoId).join(',');
      
      const videosResponse = await fetchWithRetry(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
        {}
      );
      totalQuotaUnits += QUOTA_COSTS.videosList;
      
      if (!videosResponse.ok) {
        const errorText = await videosResponse.text();
        console.error('Videos API error:', errorText);
        throw new Error(`YouTube API Error (Videos): ${videosResponse.status} ${videosResponse.statusText}`);
      }
      
      const videosData = await videosResponse.json();
      if (!validateYouTubeResponse(videosData, 'Videos')) {
        console.warn(`Skipping batch ${i}-${i + 50} due to invalid data`);
        continue;
      }
      
      const batchEpisodes = videosData.items
        .filter((video: any) => parseDuration(video.contentDetails?.duration || 'PT0S') >= 300)
        .map((video: any, index: number) => ({
          title: video.snippet?.title || 'Untitled',
          description: video.snippet?.description || '',
          duration: parseDuration(video.contentDetails?.duration || 'PT0S'),
          youtube_url: `https://www.youtube.com/watch?v=${video.id}`,
          youtube_video_id: video.id,
          thumbnail_url: video.snippet?.thumbnails?.maxres?.url || video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || '',
          published_at: video.snippet?.publishedAt || new Date().toISOString(),
          views: parseInt(video.statistics?.viewCount || '0'),
          likes: parseInt(video.statistics?.likeCount || '0'),
          comments: parseInt(video.statistics?.commentCount || '0'),
          episode_number: i + index + 1,
          tags: video.snippet?.tags || [],
        }));
      episodes.push(...batchEpisodes);
      
      // Add small delay between batches to avoid rate limiting
      if (i + 50 < allVideos.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    if (episodes.length === 0) {
      return createResponse({ error: 'No episodes longer than 5 minutes found.' }, 400);
    }

    // Calculate totals
    const totalDuration = episodes.reduce((sum, ep) => sum + ep.duration, 0);
    const averageDuration = Math.round(totalDuration / episodes.length);
    const totalViews = episodes.reduce((sum, ep) => sum + ep.views, 0);
    const totalLikes = episodes.reduce((sum, ep) => sum + ep.likes, 0);
    const totalComments = episodes.reduce((sum, ep) => sum + ep.comments, 0);
    const sortedEpisodes = episodes.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());

    const result = {
      title: playlist.snippet?.title || 'Untitled Playlist',
      description: playlist.snippet?.description || '',
      cover_image_url: playlist.snippet?.thumbnails?.maxres?.url || playlist.snippet?.thumbnails?.high?.url || playlist.snippet?.thumbnails?.medium?.url || '',
      youtube_playlist_url: playlistUrl,
      youtube_playlist_id: playlistId,
      total_episodes: episodes.length,
      total_views: totalViews,
      total_likes: totalLikes,
      total_comments: totalComments,
      average_duration: averageDuration,
      first_episode_date: sortedEpisodes[0]?.published_at || null,
      last_episode_date: sortedEpisodes[sortedEpisodes.length - 1]?.published_at || null,
      episodes: sortedEpisodes,
      language: 'en',
      categories: [],
      platform_links: {},
      social_links: {},
      sync_duration_ms: Date.now() - startTime,
      processed_at: new Date().toISOString()
    };

    // Update API key usage
    if (apiKeyInfo) {
        await updateApiKeyUsage(supabase, apiKeyInfo.id, totalQuotaUnits);
    }
    
    console.log(`Successfully processed playlist ${playlistId} with ${episodes.length} episodes in ${Date.now() - startTime}ms`);
    return createResponse(result, 200);

  } catch (error) {
    console.error('Critical error in fetch-youtube-data:', error);
    
    // Update API key usage even on error
    if (apiKeyInfo) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        await updateApiKeyUsage(supabaseClient, apiKeyInfo.id, totalQuotaUnits);
      } catch (quotaError) {
        console.error('Failed to update quota on error:', quotaError);
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = {
      error: errorMessage,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      quota_units_used: totalQuotaUnits,
      api_key_id: apiKeyInfo?.id || null
    };
    
    return createResponse(errorDetails, 500);
  }
});
