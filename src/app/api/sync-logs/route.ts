import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(request: NextRequest) {
  try {
    const syncServerUrl = process.env.SYNC_SERVER_URL || 'http://localhost:3002';
    
    // Get server logs
    const response = await fetch(`${syncServerUrl}/logs`, {
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
      logs: data.logs || []
    });

  } catch (error: any) {
    console.error('Error fetching sync logs:', error);
    return NextResponse.json({
      success: false,
      logs: [],
      error: error.message
    });
  }
}

