import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('http://localhost:3002/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sync server responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sync server status:', error);
    return NextResponse.json(
      { 
        error: 'Sync server not available',
        isRunning: false,
        currentProgress: 0,
        currentStatus: 'idle',
        lastSyncTime: '',
        syncStats: {
          totalPodcasts: 0,
          successfulPodcasts: 0,
          failedPodcasts: 0,
          totalEpisodes: 0,
          successfulEpisodes: 0,
          failedEpisodes: 0
        },
        serverUptime: 0,
        serverTime: new Date().toISOString()
      },
      { status: 200 }
    );
  }
}