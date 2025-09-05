import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();
    
    // Extract IP address from request
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               headersList.get('x-real-ip') || 
               '127.0.0.1';

    // Prepare error data
    const errorData = {
      error_id: body.error_id || generateErrorId(),
      error_type: body.error_type || 'server',
      severity: body.severity || 'medium',
      title: body.title || 'Server Error',
      message: body.message || 'Unknown error',
      stack_trace: body.stack_trace,
      file_path: body.file_path,
      line_number: body.line_number,
      function_name: body.function_name,
      component_name: body.component_name,
      page_url: body.page_url || request.url,
      user_id: body.user_id,
      session_id: body.session_id,
      user_agent: headersList.get('user-agent'),
      ip_address: ip,
      country_code: body.country_code,
      browser: body.browser,
      browser_version: body.browser_version,
      os: body.os,
      device_type: body.device_type,
      screen_resolution: body.screen_resolution,
      viewport_size: body.viewport_size,
      console_logs: body.console_logs || [],
      network_logs: body.network_logs || [],
      performance_metrics: body.performance_metrics || {},
      error_context: body.error_context || {}
    };

    // Insert error into database
    const { data, error } = await supabase
      .from('error_logs')
      .insert([errorData])
      .select('id, error_id')
      .single();

    if (error) {
      console.error('Failed to log error to database:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to log error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      error_id: data.error_id,
      id: data.id
    });

  } catch (error: any) {
    console.error('Error in error logging API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateErrorId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ERR-${dateStr}-${randomStr}`;
}
