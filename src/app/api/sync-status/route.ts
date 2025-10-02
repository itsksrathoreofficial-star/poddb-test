import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const syncServerUrl = process.env.SYNC_SERVER_URL || 'http://localhost:3002';
    
    const response = await fetch(`${syncServerUrl}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sync server responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sync status:', error);
    
    // Return default status if sync server is not available
    return NextResponse.json({
      isRunning: false,
      currentProgress: 0,
      currentStatus: 'idle',
      lastSyncTime: null,
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
    });
  }
}