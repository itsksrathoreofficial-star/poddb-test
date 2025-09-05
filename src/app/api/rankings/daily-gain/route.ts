import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/integrations/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const podcastId = searchParams.get('podcastId');

    if (!podcastId) {
      return NextResponse.json({ error: 'Podcast ID is required' }, { status: 400 });
    }

    // Get Supabase client instance
    const supabase = await supabaseServer();

    // Get last 2 days of data for this podcast (most recent first)
    const { data, error } = await supabase
      .from('podcast_daily_stats')
      .select('*')
      .eq('podcast_id', podcastId)
      .order('date', { ascending: false })
      .limit(2);

    if (error) {
      console.error('Error fetching daily gain data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length < 2) {
      // If less than 2 days of data, return 0 gains
      return NextResponse.json({ 
        views: 0, 
        likes: 0, 
        comments: 0, 
        watchTime: 0 
      });
    }

    const today = data[0]; // Most recent data
    const yesterday = data[1]; // Previous day data

    // Calculate daily gain: Today's total views - Yesterday's total views
    // This gives us the actual views gained in the last day
    const dailyGain = {
      views: Math.max(0, (today.views || 0) - (yesterday.views || 0)),
      likes: Math.max(0, (today.likes || 0) - (yesterday.likes || 0)),
      comments: Math.max(0, (today.comments || 0) - (yesterday.comments || 0)),
      watchTime: Math.max(0, (today.total_watch_time || 0) - (yesterday.total_watch_time || 0))
    };

    return NextResponse.json(dailyGain);
  } catch (error) {
    console.error('Error in daily gain API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
