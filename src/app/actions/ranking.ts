// "use server"; // Disabled for static export

import { supabase } from '@/integrations/supabase/client';

export interface RankingData {
  id: string;
  title: string;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_watch_time: number;
  total_episodes: number;
  daily_views_gain: number;
  daily_likes_gain: number;
  daily_comments_gain: number;
  daily_watch_time_gain: number;
  new_episodes_count: number;
  rank: number;
  previous_rank?: number;
  rank_change?: number;
}

export interface WeeklyRankingData extends RankingData {
  weekly_views: number;
  weekly_likes: number;
  weekly_comments: number;
  weekly_watch_time: number;
  weekly_episodes: number;
}

export interface MonthlyRankingData extends RankingData {
  monthly_views: number;
  monthly_likes: number;
  monthly_comments: number;
  monthly_watch_time: number;
  monthly_episodes: number;
}

// Get overall rankings (based on total views)
export async function getOverallRankings(): Promise<RankingData[]> {
  try {
    const { data, error } = await supabase
      .from('podcast_daily_stats')
      .select(`
        *,
        podcasts!inner(id, title, created_at)
      `)
      .order('date', { ascending: false })
      .order('views', { ascending: false });

    if (error) {
      console.error('Error fetching overall rankings:', error);
      return [];
    }

    // Group by podcast and get latest data only (most recent date)
    const podcastMap = new Map();
    const latestData = new Map();
    
    // Get only the latest data for each podcast
    data.forEach((item: any) => {
      const podcastId = item.podcast_id;
      const itemDate = new Date(item.date);
      
      if (!latestData.has(podcastId) || itemDate > new Date(latestData.get(podcastId).date)) {
        latestData.set(podcastId, item);
      }
    });
    
    // Process only the latest data for each podcast
    latestData.forEach((item: any) => {
      const podcastId = item.podcast_id;
      podcastMap.set(podcastId, {
        id: podcastId,
        title: item.podcasts?.title || 'Unknown',
        total_views: item.views || 0, // Latest daily views
        total_likes: item.likes || 0, // Latest daily likes
        total_comments: item.comments || 0, // Latest daily comments
        total_watch_time: item.total_watch_time || 0, // Latest daily watch time
        total_episodes: item.total_episodes || 0, // Latest daily episodes
        daily_views_gain: 0, // Will be calculated properly
        daily_likes_gain: 0,
        daily_comments_gain: 0,
        daily_watch_time_gain: 0,
        new_episodes_count: item.new_episodes || 0,
        last_updated: item.updated_at
      });
    });

    // Sort by total views and add rank
    const rankings = Array.from(podcastMap.values())
      .sort((a, b) => b.total_views - a.total_views)
      .map((podcast, index) => ({
        ...podcast,
        rank: index + 1
      }));

    return rankings;
  } catch (error) {
    console.error('Error in getOverallRankings:', error);
    return [];
  }
}

// Get weekly rankings (based on weekly views gain)
export async function getWeeklyRankings(): Promise<WeeklyRankingData[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('podcast_daily_stats')
      .select(`
        *,
        podcasts!inner(id, title, created_at)
      `)
      .gte('date', startDateStr)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching weekly rankings:', error);
      return [];
    }

    // Group by podcast and calculate weekly totals from daily data
    const podcastMap = new Map();
    const latestData = new Map();
    
    // Get only the latest data for each podcast
    data.forEach((item: any) => {
      const podcastId = item.podcast_id;
      const itemDate = new Date(item.date);
      
      if (!latestData.has(podcastId) || itemDate > new Date(latestData.get(podcastId).date)) {
        latestData.set(podcastId, item);
      }
    });
    
    // Process only the latest data for each podcast
    latestData.forEach((item: any) => {
      const podcastId = item.podcast_id;
      podcastMap.set(podcastId, {
        id: podcastId,
        title: item.podcasts?.title || 'Unknown',
        total_views: item.views || 0, // Latest daily views
        total_likes: item.likes || 0, // Latest daily likes
        total_comments: item.comments || 0, // Latest daily comments
        total_watch_time: item.total_watch_time || 0, // Latest daily watch time
        total_episodes: item.total_episodes || 0, // Latest daily episodes
        daily_views_gain: 0,
        daily_likes_gain: 0,
        daily_comments_gain: 0,
        daily_watch_time_gain: 0,
        new_episodes_count: item.new_episodes || 0,
        weekly_views: item.views || 0, // Latest daily views (not cumulative)
        weekly_likes: item.likes || 0,
        weekly_comments: item.comments || 0,
        weekly_watch_time: item.total_watch_time || 0,
        weekly_episodes: item.new_episodes || 0,
        last_updated: item.updated_at
      });
    });

    // Sort by weekly views gain and add rank
    const rankings = Array.from(podcastMap.values())
      .sort((a, b) => b.weekly_views - a.weekly_views)
      .map((podcast, index) => ({
        ...podcast,
        rank: index + 1
      }));

    return rankings;
  } catch (error) {
    console.error('Error in getWeeklyRankings:', error);
    return [];
  }
}

// Get monthly rankings (based on monthly views gain)
export async function getMonthlyRankings(): Promise<MonthlyRankingData[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('podcast_daily_stats')
      .select(`
        *,
        podcasts!inner(id, title, created_at)
      `)
      .gte('date', startDateStr)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching monthly rankings:', error);
      return [];
    }

    // Group by podcast and calculate monthly totals from daily data
    const podcastMap = new Map();
    const latestData = new Map();
    
    // Get only the latest data for each podcast
    data.forEach((item: any) => {
      const podcastId = item.podcast_id;
      const itemDate = new Date(item.date);
      
      if (!latestData.has(podcastId) || itemDate > new Date(latestData.get(podcastId).date)) {
        latestData.set(podcastId, item);
      }
    });
    
    // Process only the latest data for each podcast
    latestData.forEach((item: any) => {
      const podcastId = item.podcast_id;
      podcastMap.set(podcastId, {
        id: podcastId,
        title: item.podcasts?.title || 'Unknown',
        total_views: item.views || 0, // Latest daily views
        total_likes: item.likes || 0, // Latest daily likes
        total_comments: item.comments || 0, // Latest daily comments
        total_watch_time: item.total_watch_time || 0, // Latest daily watch time
        total_episodes: item.total_episodes || 0, // Latest daily episodes
        daily_views_gain: 0,
        daily_likes_gain: 0,
        daily_comments_gain: 0,
        daily_watch_time_gain: 0,
        new_episodes_count: item.new_episodes || 0,
        monthly_views: item.views || 0, // Latest daily views (not cumulative)
        monthly_likes: item.likes || 0,
        monthly_comments: item.comments || 0,
        monthly_watch_time: item.total_watch_time || 0,
        monthly_episodes: item.new_episodes || 0,
        last_updated: item.updated_at
      });
    });

    // Sort by monthly views gain and add rank
    const rankings = Array.from(podcastMap.values())
      .sort((a, b) => b.monthly_views - a.monthly_views)
      .map((podcast, index) => ({
        ...podcast,
        rank: index + 1
      }));

    return rankings;
  } catch (error) {
    console.error('Error in getMonthlyRankings:', error);
    return [];
  }
}

// Get ranking history for a specific podcast
export async function getPodcastRankingHistory(podcastId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') {
  try {
    let startDate = new Date();
    switch (period) {
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('podcast_analytics_summary')
      .select('*')
      .eq('podcast_id', podcastId)
      .gte('date', startDateStr)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching podcast ranking history:', error);
      return [];
    }

    return data.map((item: any) => ({
      date: item.date,
      total_views: item.total_views || 0,
      daily_views_gain: item.daily_views_gain || 0,
      total_likes: item.total_likes || 0,
      daily_likes_gain: item.daily_likes_gain || 0,
      total_comments: item.total_comments || 0,
      daily_comments_gain: item.daily_comments_gain || 0,
      total_watch_time: item.total_watch_time || 0,
      daily_watch_time_gain: item.daily_watch_time_gain || 0,
      new_episodes_count: item.new_episodes_count || 0
    }));
  } catch (error) {
    console.error('Error in getPodcastRankingHistory:', error);
    return [];
  }
}

// Get episode rankings for a specific podcast
export async function getEpisodeRankings(podcastId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') {
  try {
    let startDate = new Date();
    switch (period) {
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('episode_daily_stats')
      .select(`
        *,
        episodes!inner(id, title, published_at)
      `)
      .eq('podcast_id', podcastId)
      .gte('date', startDateStr)
      .order('date', { ascending: false })
      .order('views', { ascending: false });

    if (error) {
      console.error('Error fetching episode rankings:', error);
      return [];
    }

    // Group by episode and get latest data only (most recent date)
    const episodeMap = new Map();
    const latestData = new Map();
    
    // Get only the latest data for each episode
    data.forEach((item: any) => {
      const episodeId = item.episode_id;
      const itemDate = new Date(item.date);
      
      if (!latestData.has(episodeId) || itemDate > new Date(latestData.get(episodeId).date)) {
        latestData.set(episodeId, item);
      }
    });
    
    // Process only the latest data for each episode
    latestData.forEach((item: any) => {
      const episodeId = item.episode_id;
      episodeMap.set(episodeId, {
        id: episodeId,
        title: item.episodes?.title || 'Unknown',
        views: item.views || 0, // Latest daily views
        likes: item.likes || 0, // Latest daily likes
        comments: item.comments || 0, // Latest daily comments
        watch_time: item.watch_time || 0, // Latest daily watch time
        daily_views_gain: 0, // Will be calculated properly
        daily_likes_gain: 0,
        daily_comments_gain: 0,
        daily_watch_time_gain: 0,
        is_new_episode: item.is_new_episode || false,
        published_at: item.episodes?.published_at || item.created_at,
        last_updated: item.updated_at
      });
    });

    // Sort by views and add rank
    const rankings = Array.from(episodeMap.values())
      .sort((a, b) => b.views - a.views)
      .map((episode, index) => ({
        ...episode,
        rank: index + 1
      }));

    return rankings;
  } catch (error) {
    console.error('Error in getEpisodeRankings:', error);
    return [];
  }
}
