import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/integrations/supabase/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const startDateStr = startDate.toISOString().split('T')[0];

    // First try to get data from podcast_daily_stats
    const { data: dailyStatsData, error: dailyStatsError } = await supabase
      .from('podcast_daily_stats')
      .select(`
        *,
        podcasts!inner(id, title, created_at, is_verified)
      `)
      .gte('date', startDateStr)
      .order('date', { ascending: true });

    // If daily stats exist, use them
    if (!dailyStatsError && dailyStatsData && dailyStatsData.length > 0) {
      const data = dailyStatsData;

      // Group by podcast and calculate weekly totals from daily data
      const podcastMap = new Map();
      
      // Group all data by podcast and calculate weekly totals
      data.forEach((item: any) => {
        const podcastId = item.podcast_id;
        
        if (!podcastMap.has(podcastId)) {
          podcastMap.set(podcastId, {
            id: podcastId,
            title: item.podcasts?.title || 'Unknown',
            is_verified: item.podcasts?.is_verified || false,
            total_views: 0, // Will be calculated from latest data
            total_likes: 0,
            total_comments: 0,
            total_watch_time: 0,
            total_episodes: 0,
            daily_views_gain: 0,
            daily_likes_gain: 0,
            daily_comments_gain: 0,
            daily_watch_time_gain: 0,
            new_episodes_count: 0,
            weekly_views: 0, // Sum of all daily views in week
            weekly_likes: 0,
            weekly_comments: 0,
            weekly_watch_time: 0,
            weekly_episodes: 0,
            last_updated: item.updated_at,
            latestData: item // Store latest data for total calculations
          });
        }
        
        const podcast = podcastMap.get(podcastId);
        
        // Add to weekly totals (sum of all daily data in the week)
        podcast.weekly_views += item.views || 0;
        podcast.weekly_likes += item.likes || 0;
        podcast.weekly_comments += item.comments || 0;
        podcast.weekly_watch_time += item.total_watch_time || 0;
        podcast.weekly_episodes += item.new_episodes || 0;
        
        // Update latest data for total calculations
        const itemDate = new Date(item.date);
        const latestDate = new Date(podcast.latestData.date);
        if (itemDate > latestDate) {
          podcast.latestData = item;
          podcast.last_updated = item.updated_at;
        }
      });
      
      // Set total values from latest data
      podcastMap.forEach((podcast) => {
        podcast.total_views = podcast.latestData.views || 0;
        podcast.total_likes = podcast.latestData.likes || 0;
        podcast.total_comments = podcast.latestData.comments || 0;
        podcast.total_watch_time = podcast.latestData.total_watch_time || 0;
        podcast.total_episodes = podcast.latestData.total_episodes || 0;
        podcast.new_episodes_count = podcast.latestData.new_episodes || 0;
        delete podcast.latestData; // Clean up
      });

      // Sort by weekly views gain and add rank
      const rankings = Array.from(podcastMap.values())
        .sort((a, b) => b.weekly_views - a.weekly_views)
        .map((podcast, index) => ({
          ...podcast,
          rank: index + 1
        }));

      return NextResponse.json(rankings);
    }

    // Fallback: Use podcasts table if daily stats are not available
    const { data: podcastsData, error: podcastsError } = await supabase
      .from('podcasts')
      .select(`
        id, title, created_at, is_verified, views, likes, comments, total_watch_time, total_episodes
      `)
      .gte('created_at', startDateStr)
      .order('views', { ascending: false });

    if (podcastsError) {
      console.error('Error fetching podcasts weekly data:', podcastsError);
      return NextResponse.json({ error: 'Failed to fetch weekly data' }, { status: 500 });
    }

    // Process podcasts data for weekly rankings (fallback)
    const rankings = podcastsData.map((podcast: any, index: number) => ({
      id: podcast.id,
      title: podcast.title || 'Unknown',
      is_verified: podcast.is_verified || false,
      total_views: podcast.views || 0,
      total_likes: podcast.likes || 0,
      total_comments: podcast.comments || 0,
      total_watch_time: podcast.total_watch_time || 0,
      total_episodes: podcast.total_episodes || 0,
      daily_views_gain: 0,
      daily_likes_gain: 0,
      daily_comments_gain: 0,
      daily_watch_time_gain: 0,
      new_episodes_count: 0,
      weekly_views: podcast.views || 0, // Use total views as weekly views in fallback
      weekly_likes: podcast.likes || 0,
      weekly_comments: podcast.comments || 0,
      weekly_watch_time: podcast.total_watch_time || 0,
      weekly_episodes: 0,
      last_updated: podcast.created_at,
      rank: index + 1
    }));

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Error in weekly rankings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
