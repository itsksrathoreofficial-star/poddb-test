import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    // Check sync server status
    const syncServerUrl = process.env.SYNC_SERVER_URL || 'http://localhost:3002';
    
    try {
      const response = await fetch(`${syncServerUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const healthData = await response.json();
        return NextResponse.json({
          status: 'online',
          server_url: syncServerUrl,
          health: healthData,
          last_checked: new Date().toISOString(),
          uptime: healthData.uptime || 0,
          version: healthData.version || 'unknown',
          memory_usage: healthData.memory_usage || {},
          cpu_usage: healthData.cpu_usage || 0
        });
      } else {
        return NextResponse.json({
          status: 'error',
          server_url: syncServerUrl,
          error: `Server responded with status ${response.status}`,
          last_checked: new Date().toISOString()
        });
      }
    } catch (error: any) {
      return NextResponse.json({
        status: 'offline',
        server_url: syncServerUrl,
        error: error.message,
        last_checked: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('Error checking sync server status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
