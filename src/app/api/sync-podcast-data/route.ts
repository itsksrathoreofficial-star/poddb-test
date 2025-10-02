// src/app/api/sync-podcast-data/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { withAPIErrorHandling, createErrorResponse, createSuccessResponse } from '@/lib/api-error-wrapper';

export const dynamic = 'force-static';
export const revalidate = false;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export const POST = withAPIErrorHandling(async (request: Request) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { podcastId, apiKey, apiKeyId } = await request.json();

    if (!podcastId || !apiKey || !apiKeyId) {
      return NextResponse.json({ error: 'Missing required parameters: podcastId, apiKey, apiKeyId' }, { status: 400, headers: CORS_HEADERS });
    }

    const { data, error } = await supabase.functions.invoke('sync-podcast-data', {
      body: { podcastId, apiKey, apiKeyId },
    });

    if (error) {
      console.error('Error invoking Supabase function:', error);
      return NextResponse.json({ error: 'Failed to invoke sync function', details: error.message }, { status: 500, headers: CORS_HEADERS });
    }

    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});