import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, adId, userId, pageUrl, referrer } = body;

    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    
    const userAgent = request.headers.get('user-agent') || '';

    if (type === 'impression') {
      const { error } = await supabase.rpc('record_ad_impression', {
        p_ad_id: adId,
        p_user_id: userId || null,
        p_ip_address: ip,
        p_user_agent: userAgent,
        p_page_url: pageUrl
      } as any);

      if (error) throw error;
    } else if (type === 'click') {
      const { error } = await supabase.rpc('record_ad_click', {
        p_ad_id: adId,
        p_user_id: userId || null,
        p_ip_address: ip,
        p_user_agent: userAgent,
        p_referrer: referrer,
        p_page_url: pageUrl
      } as any);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ad tracking error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageName = searchParams.get('page');
    const deviceType = searchParams.get('device') || 'desktop';

    if (!pageName) {
      return NextResponse.json(
        { success: false, error: 'Page name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('get_active_ads_for_page', {
      page_name: pageName,
      device_type: deviceType
    } as any);

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
