import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/integrations/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get Supabase client instance
    const supabase = await supabaseServer();
    
    // Try to get monthly data from episode_daily_stats first
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data: dailyStatsData, error: dailyStatsError } = await supabase
      .from('episode_daily_stats')
      .select(`
        *,
        episodes!inner(id, title, created_at, is_verified, thumbnail_url, cover_image_url, categories, language, location, slug, podcast_id),
        podcasts!inner(id, title, slug)
      `)
      .gte('date', monthAgo)
      .order('date', { ascending: true });

    // If episode_daily_stats has data, use it
    if (!dailyStatsError && dailyStatsData && dailyStatsData.length > 0) {
      // Group data by episode_id
      const episodeMap = new Map();
      
      dailyStatsData.forEach((item: any) => {
        const episodeId = item.episode_id;
        
        if (!episodeMap.has(episodeId)) {
          episodeMap.set(episodeId, {
            id: episodeId,
            slug: item.episodes?.slug || '',
            title: item.episodes?.title || 'Unknown',
            is_verified: item.episodes?.is_verified || false,
            cover_image_url: item.episodes?.thumbnail_url || item.episodes?.cover_image_url || '/placeholder.svg',
            categories: item.episodes?.categories || [],
            language: item.episodes?.language || '',
            location: item.episodes?.location || '',
            podcast_title: item.podcasts?.title || '',
            podcast_slug: item.podcasts?.slug || '',
            total_views: 0,
            total_likes: 0,
            total_comments: 0,
            total_watch_time: 0,
            monthly_views: 0,
            monthly_likes: 0,
            monthly_comments: 0,
            monthly_watch_time: 0,
            dailyData: [],
            type: 'episodes'
          });
        }
        
        const episode = episodeMap.get(episodeId);
        episode.dailyData.push(item);
      });

      // Calculate monthly gains for each episode
      const monthlyRankings = Array.from(episodeMap.values()).map(episode => {
        // Sort daily data by date
        episode.dailyData.sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        if (episode.dailyData.length === 0) {
          return {
            ...episode,
            monthly_views: 0,
            monthly_likes: 0,
            monthly_comments: 0,
            monthly_watch_time: 0,
            total_views: 0,
            total_likes: 0,
            total_comments: 0,
            total_watch_time: 0
          };
        }

        const firstDay = episode.dailyData[0];
        const lastDay = episode.dailyData[episode.dailyData.length - 1];

        // Calculate monthly gains (difference between last and first day)
        const monthlyViews = Math.max(0, (lastDay.views || 0) - (firstDay.views || 0));
        const monthlyLikes = Math.max(0, (lastDay.likes || 0) - (firstDay.likes || 0));
        const monthlyComments = Math.max(0, (lastDay.comments || 0) - (firstDay.comments || 0));
        const monthlyWatchTime = Math.max(0, (lastDay.watch_time || 0) - (firstDay.watch_time || 0));

        return {
          ...episode,
          monthly_views: monthlyViews,
          monthly_likes: monthlyLikes,
          monthly_comments: monthlyComments,
          monthly_watch_time: monthlyWatchTime,
          total_views: lastDay.views || 0,
          total_likes: lastDay.likes || 0,
          total_comments: lastDay.comments || 0,
          total_watch_time: lastDay.watch_time || 0
        };
      });

      // Sort by monthly views (descending)
      monthlyRankings.sort((a, b) => b.monthly_views - a.monthly_views);

      return NextResponse.json(monthlyRankings);
    }

    // Fallback: Use episodes table if episode_daily_stats has no data
    const monthAgoFallback = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: episodesData, error: episodesError } = await supabase
      .from('episodes')
      .select(`
        *,
        podcasts!inner(id, title, slug)
      `)
      .gte('created_at', monthAgoFallback)
      .order('views', { ascending: false });

    if (episodesError) {
      console.error('Error fetching episodes monthly data:', episodesError);
      return NextResponse.json({ error: 'Failed to fetch monthly data' }, { status: 500 });
    }

    // Process episodes data for monthly rankings (fallback)
    // For fallback, we'll use episodes table data and use total views as monthly views
    const rankings = episodesData.map((episode: any, index: number) => {
      return {
        id: episode.id,
        slug: episode.slug || '',
        title: episode.title || 'Unknown',
        is_verified: episode.is_verified || false,
        cover_image_url: episode.thumbnail_url || episode.cover_image_url || '/placeholder.svg',
        categories: episode.categories || [],
        language: episode.language || '',
        location: episode.location || '',
        podcast_title: episode.podcasts?.title || '',
        podcast_slug: episode.podcasts?.slug || '',
        total_views: episode.views || 0,
        total_likes: episode.likes || 0,
        total_comments: episode.comments || 0,
        total_watch_time: episode.total_watch_time || 0,
        monthly_views: episode.views || 0, // Use total views as monthly views in fallback
        monthly_likes: episode.likes || 0,
        monthly_comments: episode.comments || 0,
        monthly_watch_time: episode.total_watch_time || 0,
        type: 'episodes',
        rank: index + 1
      };
    });

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Error in episodes monthly rankings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
