'use server';

import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '@/lib/utils';

// This function creates a Supabase client with the service role key
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Generate slugs for podcasts that don't have them
export async function generatePodcastSlugsAction() {
  const supabaseAdmin = createAdminClient();
  
  try {
    // Get podcasts without slugs
    const { data: podcasts, error: fetchError } = await supabaseAdmin
      .from('podcasts')
      .select('id, title, slug')
      .or('slug.is.null,slug.eq.')
      .eq('submission_status', 'approved');

    if (fetchError) throw fetchError;

    let updated = 0;
    let errors = 0;

    for (const podcast of podcasts || []) {
      try {
        const baseSlug = generateSlug(podcast.title);
        let slug = baseSlug;
        let counter = 1;

        // Check for uniqueness
        while (true) {
          const { data: existingPodcast } = await supabaseAdmin
            .from('podcasts')
            .select('id')
            .eq('slug', slug)
            .neq('id', podcast.id)
            .single();

          if (!existingPodcast) break;
          
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Update the podcast with the new slug
        const { error: updateError } = await supabaseAdmin
          .from('podcasts')
          .update({ slug })
          .eq('id', podcast.id);

        if (updateError) {
          console.error(`Error updating podcast ${podcast.id}:`, updateError);
          errors++;
        } else {
          updated++;
        }
      } catch (error) {
        console.error(`Error processing podcast ${podcast.id}:`, error);
        errors++;
      }
    }

    return { 
      success: true, 
      updated, 
      errors,
      message: `Updated ${updated} podcasts with slugs. ${errors} errors occurred.`
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Generate slugs for episodes that don't have them
export async function generateEpisodeSlugsAction() {
  const supabaseAdmin = createAdminClient();
  
  try {
    // Get episodes without slugs
    const { data: episodes, error: fetchError } = await supabaseAdmin
      .from('episodes')
      .select('id, title, slug')
      .or('slug.is.null,slug.eq.');

    if (fetchError) throw fetchError;

    let updated = 0;
    let errors = 0;

    for (const episode of episodes || []) {
      try {
        const baseSlug = generateSlug(episode.title);
        let slug = baseSlug;
        let counter = 1;

        // Check for uniqueness
        while (true) {
          const { data: existingEpisode } = await supabaseAdmin
            .from('episodes')
            .select('id')
            .eq('slug', slug)
            .neq('id', episode.id)
            .single();

          if (!existingEpisode) break;
          
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Update the episode with the new slug
        const { error: updateError } = await supabaseAdmin
          .from('episodes')
          .update({ slug })
          .eq('id', episode.id);

        if (updateError) {
          console.error(`Error updating episode ${episode.id}:`, updateError);
          errors++;
        } else {
          updated++;
        }
      } catch (error) {
        console.error(`Error processing episode ${episode.id}:`, error);
        errors++;
      }
    }

    return { 
      success: true, 
      updated, 
      errors,
      message: `Updated ${updated} episodes with slugs. ${errors} errors occurred.`
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
