import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('adId');

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    // Get current stats for the ad
    const { data: currentStats, error: currentError } = await supabase
      .from('ad_stats')
      .select('*')
      .eq('ad_id', adId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (currentError && currentError.code !== 'PGRST116') {
      throw currentError;
    }

    // Get total stats for the ad
    const { data: totalStats, error: totalError } = await supabase
      .from('ad_stats')
      .select('impressions, clicks, revenue')
      .eq('ad_id', adId);

    if (totalError) throw totalError;

    // Calculate totals
    const totals = totalStats?.reduce(
      (acc, stat) => ({
        impressions: acc.impressions + ((stat as any).impressions || 0),
        clicks: acc.clicks + ((stat as any).clicks || 0),
        revenue: acc.revenue + ((stat as any).revenue || 0),
      }),
      { impressions: 0, clicks: 0, revenue: 0 }
    ) || { impressions: 0, clicks: 0, revenue: 0 };

    // Calculate CTR
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

    const stats = {
      impressions: totals.impressions,
      clicks: totals.clicks,
      ctr: parseFloat(ctr.toFixed(2)),
      revenue: parseFloat(totals.revenue.toFixed(2)),
      current: currentStats || null
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching ad stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId, type, value } = body;

    if (!adId || !type) {
      return NextResponse.json(
        { success: false, error: 'Ad ID and type are required' },
        { status: 400 }
      );
    }

    // Update ad stats
    const { error } = await (supabase as any)
      .from('ad_stats')
      .upsert({
        ad_id: adId,
        date: new Date().toISOString().split('T')[0],
        [type]: value,
        updated_at: new Date().toISOString()
      } as any, {
        onConflict: 'ad_id,date'
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating ad stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
