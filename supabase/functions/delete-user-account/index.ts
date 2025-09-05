// supabase/functions/delete-user-account/index.ts
import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.223.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { userId } = await req.json();
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Order of operations is important due to foreign keys and data dependencies.
    console.log(`Starting deletion for user: ${userId}`);
    
    // Any direct user content should be handled first. The current schema cascades deletions
    // from the 'profiles' table for things like reviews, suggestions, verification requests.
    // Let's ensure a clean slate.
    
    // 1. Delete user's podcast contributions and all related data.
    const { data: podcasts, error: podcastsError } = await supabaseAdmin
      .from('podcasts')
      .select('id')
      .eq('submitted_by', userId);
    
    if (podcastsError) throw new Error(`Failed to fetch user's podcasts: ${podcastsError.message}`);
    
    if (podcasts && podcasts.length > 0) {
        const podcastIds = podcasts.map(p => p.id);
        console.log(`Found ${podcastIds.length} podcasts submitted by user to delete.`);
        for (const podcastId of podcastIds) {
          const { error } = await supabaseAdmin.functions.invoke('delete-podcast', {
            body: { podcastId },
          });
          if (error) console.error(`Failed to delete podcast ${podcastId} during user cleanup:`, error);
        }
    }

    // 2. Delete user's profile from 'profiles' table. Cascading deletes will handle linked tables.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.error(`Could not delete profile for user ${userId}: ${profileError.message}`);
    } else {
        console.log("Deleted user's profile.");
    }

    // 3. Delete user's avatar from storage
    const { data: files } = await supabaseAdmin.storage.from('avatars').list(userId);
    if (files && files.length > 0) {
        const filePaths = files.map(file => `${userId}/${file.name}`);
        await supabaseAdmin.storage.from('avatars').remove(filePaths);
        console.log("Deleted user's avatars from storage.");
    }

    // 4. Delete the user from auth.users (this should be last)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      throw new Error(`Failed to delete user from authentication: ${authError.message}`);
    }
    console.log("Deleted user from auth.");

    console.log(`Successfully deleted all data for user: ${userId}`);
    return new Response(JSON.stringify({ message: 'User account deleted successfully.' }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error during account deletion:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
