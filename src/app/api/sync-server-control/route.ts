import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    const syncServerUrl = process.env.SYNC_SERVER_URL || 'http://localhost:3002';
    
    let response;
    let endpoint = '';
    
    switch (action) {
      case 'start':
        endpoint = '/sync';
        break;
      case 'stop':
        endpoint = '/stop';
        break;
      case 'pause':
        endpoint = '/pause';
        break;
      case 'resume':
        endpoint = '/resume';
        break;
      case 'restart':
        // First stop, then start
        try {
          await fetch(`${syncServerUrl}/stop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000)
          });
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        } catch (error) {
          // Ignore stop errors, continue with start
        }
        endpoint = '/sync';
        break;
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Use: start, stop, pause, resume, restart' 
        }, { status: 400 });
    }

    // Make request to sync server
    response = await fetch(`${syncServerUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PodDB-Admin-Panel/1.0'
      },
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sync server responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      action,
      message: data.message || `${action} completed successfully`,
      data
    });

  } catch (error: any) {
    console.error(`Error controlling sync server:`, error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      action: 'unknown'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const syncServerUrl = process.env.SYNC_SERVER_URL || 'http://localhost:3002';
    
    // Get server status
    const response = await fetch(`${syncServerUrl}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PodDB-Admin-Panel/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Sync server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      serverOnline: true,
      data
    });

  } catch (error: any) {
    console.error('Error checking sync server status:', error);
    return NextResponse.json({
      success: false,
      serverOnline: false,
      error: error.message
    });
  }
}
