import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/integrations/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'overall';
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category') || '';

    let startDate: Date;
    let startDateStr: string;

    // Set date range based on period
    switch (period) {
      case 'weekly':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDateStr = startDate.toISOString().split('T')[0];
        break;
      case 'monthly':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDateStr = startDate.toISOString().split('T')[0];
        break;
      default:
        startDate = new Date('2020-01-01'); // Far back for overall
        startDateStr = startDate.toISOString().split('T')[0];
    }

    // Build query with optional category filter
    const supabase = await supabaseServer();
    let query = supabase
      .from('episodes')
      .select(`
        id, title, slug, is_verified, thumbnail_url, cover_image_url, 
        categories, language, location, views, likes, comments, 
        total_watch_time, created_at, updated_at,
        podcasts!inner(id, title, slug, is_verified)
      `)
      .gte('created_at', startDateStr)
      .order('views', { ascending: false })
      .limit(limit);

    // Add category filter if specified
    if (category && category !== 'all') {
      query = query.contains('categories', [category]);
    }

    const { data: episodesData, error: episodesError } = await query;

    if (episodesError) {
      console.error('Error fetching episodes enhanced data:', episodesError);
      return NextResponse.json({ error: 'Failed to fetch episodes data' }, { status: 500 });
    }

    // Calculate ranking metrics
    const rankings = episodesData.map((episode: any, index: number) => {
      // Calculate engagement rate
      const totalEngagement = (episode.likes || 0) + (episode.comments || 0);
      const engagementRate = episode.views > 0 ? (totalEngagement / episode.views) * 100 : 0;

      // Calculate watch time efficiency
      const watchTimeEfficiency = episode.views > 0 ? (episode.total_watch_time || 0) / episode.views : 0;

      // Calculate recency score (newer episodes get slight boost)
      const daysSinceCreation = Math.floor((Date.now() - new Date(episode.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.max(0, 30 - daysSinceCreation) / 30; // 0-1 scale, 1 for very recent

      // Calculate composite score for ranking
      const compositeScore = 
        (episode.views || 0) * 1.0 +           // Views weight: 1.0
        (episode.likes || 0) * 2.0 +           // Likes weight: 2.0 (more valuable)
        (episode.comments || 0) * 3.0 +        // Comments weight: 3.0 (most valuable)
        engagementRate * 100 +                 // Engagement rate bonus
        (episode.total_watch_time || 0) * 0.1 + // Watch time bonus
        recencyScore * 1000;                   // Recency bonus

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
        podcast_verified: episode.podcasts?.is_verified || false,
        total_views: episode.views || 0,
        total_likes: episode.likes || 0,
        total_comments: episode.comments || 0,
        total_watch_time: episode.total_watch_time || 0,
        engagement_rate: Math.round(engagementRate * 100) / 100,
        watch_time_efficiency: Math.round(watchTimeEfficiency * 100) / 100,
        recency_score: Math.round(recencyScore * 100) / 100,
        composite_score: Math.round(compositeScore),
        days_since_creation: daysSinceCreation,
        weekly_views: episode.views || 0, // For now, use total views
        weekly_likes: episode.likes || 0,
        weekly_comments: episode.comments || 0,
        weekly_watch_time: episode.total_watch_time || 0,
        monthly_views: episode.views || 0,
        monthly_likes: episode.likes || 0,
        monthly_comments: episode.comments || 0,
        monthly_watch_time: episode.total_watch_time || 0,
        last_updated: episode.updated_at,
        created_at: episode.created_at,
        type: 'episodes',
        rank: index + 1,
        period: period
      };
    });

    // Sort by composite score for better ranking
    rankings.sort((a, b) => b.composite_score - a.composite_score);

    // Update ranks after sorting
    rankings.forEach((episode, index) => {
      episode.rank = index + 1;
    });

    return NextResponse.json({
      data: rankings,
      meta: {
        period,
        total: rankings.length,
        category: category || 'all',
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in episodes enhanced rankings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
