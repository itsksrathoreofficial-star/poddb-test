// supabase/functions/delete-podcast/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  
  try {
    const { podcastId } = await req.json();
    if (!podcastId) {
      throw new Error("Podcast ID is required.");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all episode IDs for the podcast
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('id')
      .eq('podcast_id', podcastId);

    if (episodesError) throw episodesError;

    const episodeIds = episodes.map(e => e.id);

    // Step 1: Delete from tables referencing episodes
    if (episodeIds.length > 0) {
      await supabase.from('episode_people').delete().in('episode_id', episodeIds);
      // If there were other tables referencing episodes, they'd go here.
    }

    // Step 2: Delete from tables referencing the podcast
    await supabase.from('podcast_people').delete().eq('podcast_id', podcastId);
    // await supabase.from('sync_history').delete().eq('podcast_id', podcastId);
    // await supabase.from('rankings').delete().eq('podcast_id', podcastId);

    // Step 3: Delete all episodes of the podcast
    if (episodeIds.length > 0) {
      await supabase.from('episodes').delete().eq('podcast_id', podcastId);
    }

    // Step 4: Delete the podcast itself
    const { error: deletePodcastError } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', podcastId);
    
    if (deletePodcastError) throw deletePodcastError;

    return new Response(JSON.stringify({ message: `Successfully deleted podcast ${podcastId}` }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
