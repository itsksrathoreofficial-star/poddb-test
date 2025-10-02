import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/server';
import { createClient } from '@/integrations/supabase/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error_id, resolution_notes } = body;

    if (!error_id) {
      return NextResponse.json(
        { success: false, error: 'Error ID is required' },
        { status: 400 }
      );
    }

    // Verify user is admin
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Update error as resolved
    const { data, error } = await supabase
      .from('error_logs')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
        resolution_notes: resolution_notes || 'Marked as resolved by admin'
      })
      .eq('error_id', error_id)
      .select('id')
      .single();

    if (error) {
      console.error('Failed to resolve error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to resolve error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Error marked as resolved'
    });

  } catch (error: any) {
    console.error('Error in resolve error API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
