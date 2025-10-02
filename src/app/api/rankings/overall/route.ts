import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/integrations/supabase/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from('podcast_daily_stats')
      .select(`
        *,
        podcasts!inner(id, title, created_at, is_verified, cover_image_url, categories, language, location, slug)
      `)
      .order('date', { ascending: false })
      .order('views', { ascending: false });

    if (error) {
      console.error('Error fetching overall rankings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by podcast and get latest data (total cumulative views)
    const podcastMap = new Map();
    const latestData = new Map();
    
    // Get only the latest data for each podcast (most recent date)
    data.forEach((item: any) => {
      const podcastId = item.podcast_id;
      const itemDate = new Date(item.date);
      
      if (!latestData.has(podcastId) || itemDate > new Date(latestData.get(podcastId).date)) {
        latestData.set(podcastId, item);
      }
    });
    
    // Process latest data for each podcast (this represents total cumulative views)
    latestData.forEach((item: any) => {
      const podcastId = item.podcast_id;
      podcastMap.set(podcastId, {
        id: podcastId,
        slug: item.podcasts?.slug || '',
        title: item.podcasts?.title || 'Unknown',
        is_verified: item.podcasts?.is_verified || false,
        cover_image_url: item.podcasts?.cover_image_url || '/placeholder.svg',
        categories: item.podcasts?.categories || [],
        language: item.podcasts?.language || '',
        location: item.podcasts?.location || '',
        total_views: item.views || 0, // Total cumulative views (latest data)
        total_likes: item.likes || 0, // Total cumulative likes
        total_comments: item.comments || 0, // Total cumulative comments
        total_watch_time: item.total_watch_time || 0, // Total cumulative watch time
        total_episodes: item.total_episodes || 0, // Total cumulative episodes
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

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Error in overall rankings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
