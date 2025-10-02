import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/integrations/supabase/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from('episodes')
      .select(`
        *,
        podcasts!inner(id, title, slug)
      `)
      .order('views', { ascending: false });

    if (error) {
      console.error('Error fetching episodes overall rankings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process episodes data with proper ranking logic
    const rankings = data.map((episode: any, index: number) => ({
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
      daily_views_gain: 0,
      daily_likes_gain: 0,
      daily_comments_gain: 0,
      daily_watch_time_gain: 0,
      weekly_views: episode.views || 0, // For overall, use total views
      weekly_likes: episode.likes || 0,
      weekly_comments: episode.comments || 0,
      weekly_watch_time: episode.total_watch_time || 0,
      monthly_views: episode.views || 0, // For overall, use total views
      monthly_likes: episode.likes || 0,
      monthly_comments: episode.comments || 0,
      monthly_watch_time: episode.total_watch_time || 0,
      last_updated: episode.updated_at,
      type: 'episodes',
      rank: index + 1
    }));

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Error in episodes overall rankings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
