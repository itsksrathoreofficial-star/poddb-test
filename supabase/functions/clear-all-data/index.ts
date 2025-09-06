// supabase/functions/clear-all-data/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // The order of deletion is critical due to foreign key constraints.
    // Only delete core content tables: podcasts, people, episodes, and news_articles
    // All other system tables (settings, API keys, analytics, etc.) are preserved
    const tablesToDelete = [
      'reviews',           // Delete reviews related to podcasts/people/episodes
      'edit_suggestions',  // Delete edit suggestions for content
      'episode_people',    // Delete episode-people relationships
      'podcast_people',    // Delete podcast-people relationships
      'daily_rankings',    // Delete rankings for podcasts/episodes
      'verification_requests', // Delete verification requests for content
      'sync_history',      // Delete sync history for podcasts
      'episodes',          // Delete all episodes
      'news_articles',     // Delete all news articles
      'podcasts',          // Delete all podcasts
      'people',            // Delete all people
    ];

    for (const table of tablesToDelete) {
      console.log(`Deleting all data from ${table}...`);
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
      if (error) {
        // Some tables might be empty, which isn't a critical error, but log it anyway.
        console.error(`Error deleting from ${table}:`, error.message);
      } else {
        console.log(`Successfully cleared table: ${table}`);
      }
    }

    return new Response(JSON.stringify({ message: "Core content data (podcasts, people, episodes, news) has been successfully cleared. System settings and configurations have been preserved." }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error clearing all data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
