"use server";

import { supabase } from '@/integrations/supabase/client';

// Calculate daily gains for today's data
export async function calculateDailyGains() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get today's and yesterday's data for podcasts
    const { data: todayPodcasts, error: todayError } = await supabase
      .from('podcast_daily_stats')
      .select('*')
      .eq('date', today);

    if (todayError) {
      console.error('Error fetching today\'s podcast data:', todayError);
      return;
    }

    const { data: yesterdayPodcasts, error: yesterdayError } = await supabase
      .from('podcast_daily_stats')
      .select('*')
      .eq('date', yesterday);

    if (yesterdayError) {
      console.error('Error fetching yesterday\'s podcast data:', yesterdayError);
      return;
    }

    // Calculate gains for podcasts
    for (const todayPodcast of todayPodcasts || []) {
      const yesterdayPodcast = yesterdayPodcasts?.find(
        (p: any) => p.podcast_id === (todayPodcast as any).podcast_id
      );

      const dailyViewsGain = (todayPodcast as any).views - ((yesterdayPodcast as any)?.views || 0);
      const dailyLikesGain = (todayPodcast as any).likes - ((yesterdayPodcast as any)?.likes || 0);
      const dailyCommentsGain = (todayPodcast as any).comments - ((yesterdayPodcast as any)?.comments || 0);
      const dailyWatchTimeGain = (todayPodcast as any).total_watch_time - ((yesterdayPodcast as any)?.total_watch_time || 0);

      // Update today's record with calculated gains
      try {
        await (supabase as any)
          .from('podcast_daily_stats')
          .update({
            daily_views_gain: Math.max(0, dailyViewsGain),
            daily_likes_gain: Math.max(0, dailyLikesGain),
            daily_comments_gain: Math.max(0, dailyCommentsGain),
            daily_watch_time_gain: Math.max(0, dailyWatchTimeGain)
          })
          .eq('podcast_id', (todayPodcast as any).podcast_id)
          .eq('date', today);
      } catch (updateError) {
        console.warn('Could not update daily gains:', updateError);
      }
    }

    // Get today's and yesterday's data for episodes
    const { data: todayEpisodes, error: todayEpisodesError } = await supabase
      .from('episode_daily_stats')
      .select('*')
      .eq('date', today);

    if (todayEpisodesError) {
      console.error('Error fetching today\'s episode data:', todayEpisodesError);
      return;
    }

    const { data: yesterdayEpisodes, error: yesterdayEpisodesError } = await supabase
      .from('episode_daily_stats')
      .select('*')
      .eq('date', yesterday);

    if (yesterdayEpisodesError) {
      console.error('Error fetching yesterday\'s episode data:', yesterdayEpisodesError);
      return;
    }

    // Calculate gains for episodes
    for (const todayEpisode of todayEpisodes || []) {
      const yesterdayEpisode = yesterdayEpisodes?.find(
        (e: any) => e.episode_id === (todayEpisode as any).episode_id
      );

      const dailyViewsGain = (todayEpisode as any).views - ((yesterdayEpisode as any)?.views || 0);
      const dailyLikesGain = (todayEpisode as any).likes - ((yesterdayEpisode as any)?.likes || 0);
      const dailyCommentsGain = (todayEpisode as any).comments - ((yesterdayEpisode as any)?.comments || 0);
      const dailyWatchTimeGain = (todayEpisode as any).watch_time - ((yesterdayEpisode as any)?.watch_time || 0);

      // Update today's record with calculated gains
      try {
        await (supabase as any)
          .from('episode_daily_stats')
          .update({
            daily_views_gain: Math.max(0, dailyViewsGain),
            daily_likes_gain: Math.max(0, dailyLikesGain),
            daily_comments_gain: Math.max(0, dailyCommentsGain),
            daily_watch_time_gain: Math.max(0, dailyWatchTimeGain)
          })
          .eq('episode_id', (todayEpisode as any).episode_id)
          .eq('date', today);
      } catch (updateError) {
        console.warn('Could not update episode daily gains:', updateError);
      }
    }

    console.log('Daily gains calculated successfully');
  } catch (error) {
    console.error('Error calculating daily gains:', error);
  }
}

// Get monthly data for specific month
export async function getMonthlyData(month: string, year: string) {
  try {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('podcast_analytics_summary')
      .select(`
        *,
        podcasts!inner(id, title, created_at)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('total_views', { ascending: false });

    if (error) {
      console.error('Error fetching monthly data:', error);
      return [];
    }

    // Group by podcast and calculate monthly totals
    const podcastMap = new Map();
    data.forEach((item: any) => {
      const podcastId = item.podcast_id;
      if (!podcastMap.has(podcastId)) {
        podcastMap.set(podcastId, {
          id: podcastId,
          title: item.podcasts?.title || 'Unknown',
          total_views: 0,
          total_likes: 0,
          total_comments: 0,
          total_watch_time: 0,
          monthly_views: 0,
          monthly_likes: 0,
          monthly_comments: 0,
          monthly_watch_time: 0
        });
      }
      
      const podcast = podcastMap.get(podcastId);
      podcast.total_views += item.total_views || 0;
      podcast.total_likes += item.total_likes || 0;
      podcast.total_comments += item.total_comments || 0;
      podcast.total_watch_time += item.total_watch_time || 0;
      podcast.monthly_views += item.daily_views_gain || 0;
      podcast.monthly_likes += item.daily_likes_gain || 0;
      podcast.monthly_comments += item.daily_comments_gain || 0;
      podcast.monthly_watch_time += item.daily_watch_time_gain || 0;
    });

    return Array.from(podcastMap.values())
      .sort((a, b) => b.monthly_views - a.monthly_views)
      .map((podcast, index) => ({
        ...podcast,
        rank: index + 1
      }));
  } catch (error) {
    console.error('Error in getMonthlyData:', error);
    return [];
  }
}

// Get weekly data for specific week
export async function getWeeklyData(weekStart: string) {
  try {
    const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('podcast_analytics_summary')
      .select(`
        *,
        podcasts!inner(id, title, created_at)
      `)
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('total_views', { ascending: false });

    if (error) {
      console.error('Error fetching weekly data:', error);
      return [];
    }

    // Group by podcast and calculate weekly totals
    const podcastMap = new Map();
    data.forEach((item: any) => {
      const podcastId = item.podcast_id;
      if (!podcastMap.has(podcastId)) {
        podcastMap.set(podcastId, {
          id: podcastId,
          title: item.podcasts?.title || 'Unknown',
          total_views: 0,
          total_likes: 0,
          total_comments: 0,
          total_watch_time: 0,
          weekly_views: 0,
          weekly_likes: 0,
          weekly_comments: 0,
          weekly_watch_time: 0
        });
      }
      
      const podcast = podcastMap.get(podcastId);
      podcast.total_views += item.total_views || 0;
      podcast.total_likes += item.total_likes || 0;
      podcast.total_comments += item.total_comments || 0;
      podcast.total_watch_time += item.total_watch_time || 0;
      podcast.weekly_views += item.daily_views_gain || 0;
      podcast.weekly_likes += item.daily_likes_gain || 0;
      podcast.weekly_comments += item.daily_comments_gain || 0;
      podcast.weekly_watch_time += item.daily_watch_time_gain || 0;
    });

    return Array.from(podcastMap.values())
      .sort((a, b) => b.weekly_views - a.weekly_views)
      .map((podcast, index) => ({
        ...podcast,
        rank: index + 1
      }));
  } catch (error) {
    console.error('Error in getWeeklyData:', error);
    return [];
  }
}
