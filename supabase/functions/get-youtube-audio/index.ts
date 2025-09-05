import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.223.0/http/server.ts';
import ytdl from 'https://deno.land/x/ytdl_core@v0.1.2/mod.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get('videoId');

    if (!videoId) {
      return new Response(JSON.stringify({ error: 'videoId is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(youtubeUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

    if (!format) {
      return new Response(JSON.stringify({ error: 'No suitable audio format found' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const audioStream = ytdl(youtubeUrl, { format });

    return new Response(audioStream, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error fetching audio stream:', error);
    return new Response(JSON.stringify({ error: 'Failed to get audio stream', details: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
