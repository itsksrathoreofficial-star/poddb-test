import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function POST(request: NextRequest) {
  try {
    const syncServerUrl = process.env.SYNC_SERVER_URL || 'http://localhost:3002';
    
    // Start sync on the sync server
    const response = await fetch(`${syncServerUrl}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout for start
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sync server responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error starting sync:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
