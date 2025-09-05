import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get monthly data from podcast_daily_stats
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('podcast_daily_stats')
      .select(`
        *,
        podcasts!inner(id, title, created_at, is_verified, cover_image_url, categories, language, location, slug)
      `)
      .gte('date', monthAgo)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching monthly chart data:', error);
      return NextResponse.json({ error: 'Failed to fetch monthly data' }, { status: 500 });
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
          monthly_views: 0,
          monthly_likes: 0,
          monthly_comments: 0,
          monthly_watch_time: 0,
          monthly_episodes: 0,
          dailyData: []
        });
      }
      
      const podcast = podcastMap.get(podcastId);
      podcast.dailyData.push(item);
    });

    // Calculate monthly gains for each podcast
    const monthlyRankings = Array.from(podcastMap.values()).map(podcast => {
      // Sort daily data by date
      podcast.dailyData.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      if (podcast.dailyData.length === 0) {
        return {
          ...podcast,
          monthly_views: 0,
          monthly_likes: 0,
          monthly_comments: 0,
          monthly_watch_time: 0,
          monthly_episodes: 0,
          total_views: 0,
          total_likes: 0,
          total_comments: 0,
          total_watch_time: 0,
          total_episodes: 0
        };
      }

      const firstDay = podcast.dailyData[0];
      const lastDay = podcast.dailyData[podcast.dailyData.length - 1];

      // Calculate monthly gains (difference between last and first day)
      const monthlyViews = Math.max(0, (lastDay.views || 0) - (firstDay.views || 0));
      const monthlyLikes = Math.max(0, (lastDay.likes || 0) - (firstDay.likes || 0));
      const monthlyComments = Math.max(0, (lastDay.comments || 0) - (firstDay.comments || 0));
      const monthlyWatchTime = Math.max(0, (lastDay.total_watch_time || 0) - (firstDay.total_watch_time || 0));
      const monthlyEpisodes = Math.max(0, (lastDay.total_episodes || 0) - (firstDay.total_episodes || 0));

      return {
        ...podcast,
        monthly_views: monthlyViews,
        monthly_likes: monthlyLikes,
        monthly_comments: monthlyComments,
        monthly_watch_time: monthlyWatchTime,
        monthly_episodes: monthlyEpisodes,
        total_views: lastDay.views || 0,
        total_likes: lastDay.likes || 0,
        total_comments: lastDay.comments || 0,
        total_watch_time: lastDay.total_watch_time || 0,
        total_episodes: lastDay.total_episodes || 0
      };
    });

    // Sort by monthly views (descending)
    monthlyRankings.sort((a, b) => b.monthly_views - a.monthly_views);

    return NextResponse.json(monthlyRankings);
  } catch (error) {
    console.error('Error in monthly chart rankings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
