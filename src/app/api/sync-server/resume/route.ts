import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const response = await fetch('http://localhost:3002/api/sync-resume', {
      method: 'POST',
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
    console.error('Error resuming sync:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Sync server not available'
      },
      { status: 500 }
    );
  }
}
