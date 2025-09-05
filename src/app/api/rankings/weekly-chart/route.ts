import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get weekly data from podcast_daily_stats
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('podcast_daily_stats')
      .select(`
        *,
        podcasts!inner(id, title, created_at, is_verified, cover_image_url, categories, language, location, slug)
      `)
      .gte('date', weekAgo)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching weekly chart data:', error);
      return NextResponse.json({ error: 'Failed to fetch weekly data' }, { status: 500 });
    }

    // Group data by podcast_id
    const podcastMap = new Map();
    
    data.forEach((item: any) => {
      const podcastId = item.podcast_id;
      
      if (!podcastMap.has(podcastId)) {
        podcastMap.set(podcastId, {
          id: podcastId,
          slug: item.podcasts?.slug || '',
          title: item.podcasts?.title || 'Unknown',
          is_verified: item.podcasts?.is_verified || false,
          cover_image_url: item.podcasts?.cover_image_url || '/placeholder.svg',
          categories: item.podcasts?.categories || [],
          language: item.podcasts?.language || '',
          location: item.podcasts?.location || '',
          total_views: 0,
          total_likes: 0,
          total_comments: 0,
          total_watch_time: 0,
          total_episodes: 0,
          weekly_views: 0,
          weekly_likes: 0,
          weekly_comments: 0,
          weekly_watch_time: 0,
          weekly_episodes: 0,
          dailyData: []
        });
      }
      
      const podcast = podcastMap.get(podcastId);
      podcast.dailyData.push(item);
    });

    // Calculate weekly gains for each podcast
    const weeklyRankings = Array.from(podcastMap.values()).map(podcast => {
      // Sort daily data by date
      podcast.dailyData.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      if (podcast.dailyData.length === 0) {
        return {
          ...podcast,
          weekly_views: 0,
          weekly_likes: 0,
          weekly_comments: 0,
          weekly_watch_time: 0,
          weekly_episodes: 0,
          total_views: 0,
          total_likes: 0,
          total_comments: 0,
          total_watch_time: 0,
          total_episodes: 0
        };
      }

      const firstDay = podcast.dailyData[0];
      const lastDay = podcast.dailyData[podcast.dailyData.length - 1];

      // Calculate weekly gains (difference between last and first day)
      const weeklyViews = Math.max(0, (lastDay.views || 0) - (firstDay.views || 0));
      const weeklyLikes = Math.max(0, (lastDay.likes || 0) - (firstDay.likes || 0));
      const weeklyComments = Math.max(0, (lastDay.comments || 0) - (firstDay.comments || 0));
      const weeklyWatchTime = Math.max(0, (lastDay.total_watch_time || 0) - (firstDay.total_watch_time || 0));
      const weeklyEpisodes = Math.max(0, (lastDay.total_episodes || 0) - (firstDay.total_episodes || 0));

      return {
        ...podcast,
        weekly_views: weeklyViews,
        weekly_likes: weeklyLikes,
        weekly_comments: weeklyComments,
        weekly_watch_time: weeklyWatchTime,
        weekly_episodes: weeklyEpisodes,
        total_views: lastDay.views || 0,
        total_likes: lastDay.likes || 0,
        total_comments: lastDay.comments || 0,
        total_watch_time: lastDay.total_watch_time || 0,
        total_episodes: lastDay.total_episodes || 0
      };
    });

    // Sort by weekly views (descending)
    weeklyRankings.sort((a, b) => b.weekly_views - a.weekly_views);

    return NextResponse.json(weeklyRankings);
  } catch (error) {
    console.error('Error in weekly chart rankings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
