import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    const { action } = await request.json();

    if (!action || !['start', 'stop', 'restart', 'kill'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be start, stop, restart, or kill' }, { status: 400 });
    }

    const syncServerPath = process.env.SYNC_SERVER_PATH || './sync-server';
    let command = '';

    switch (action) {
      case 'start':
        // Try PM2 first, then fallback to direct start
        command = `cd ${syncServerPath} && (npm run pm2 || npm start)`;
        break;
      case 'stop':
        // Try PM2 stop first, then kill processes
        command = `cd ${syncServerPath} && (npm run pm2:stop || pkill -f "node.*server.js")`;
        break;
      case 'restart':
        // Try PM2 restart first, then stop and start
        command = `cd ${syncServerPath} && (npm run pm2:restart || (pkill -f "node.*server.js" && sleep 2 && npm start))`;
        break;
      case 'kill':
        // Force kill all related processes
        command = `pkill -f "node.*server.js" && pkill -f "npm.*start" && pkill -f "pm2.*sync-server"`;
        break;
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000, // 30 second timeout
        cwd: process.cwd()
      });

      return NextResponse.json({
        success: true,
        action,
        message: `Server ${action} command executed successfully`,
        output: stdout,
        error: stderr || null,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error(`Error executing ${action} command:`, error);
      return NextResponse.json({
        success: false,
        action,
        error: error.message,
        output: error.stdout || '',
        stderr: error.stderr || '',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in sync server control:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
