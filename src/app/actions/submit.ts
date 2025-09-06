
'use server';

import { createClient } from '@supabase/supabase-js';
import type { Database, TablesInsert } from '@/integrations/supabase/types';

// This function creates a Supabase client with the service role key,
// which has admin privileges and can bypass RLS policies.
// This is necessary for server-side actions that need to write to the database.
function createAdminClient() {
  return createClient<Database>(
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

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

interface SubmitPodcastPayload {
    podcast: Omit<TablesInsert<'podcasts'>, 'id' | 'created_at' | 'updated_at'> & { team_members?: any[] };
    episodes: Omit<TablesInsert<'episodes'>, 'id' | 'podcast_id' | 'created_at' | 'updated_at'>[];
}

export async function submitPodcastAction(payload: SubmitPodcastPayload) {
  const supabaseAdmin = createAdminClient();

  try {
    // Step 1: Check for duplicate playlist ID before inserting
    if (payload.podcast.youtube_playlist_id) {
      const { data: existingPodcast, error: duplicateError } = await supabaseAdmin
        .from('podcasts')
        .select('id, title, slug, submission_status')
        .eq('youtube_playlist_id', payload.podcast.youtube_playlist_id)
        .single();

      if (duplicateError && duplicateError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking duplicate playlist:', duplicateError);
        throw new Error('Failed to check for duplicate playlist');
      }

      if (existingPodcast) {
        const statusText = existingPodcast.submission_status === 'approved' ? 'approved' : 'pending review';
        throw new Error(`This playlist has already been submitted! The podcast "${existingPodcast.title}" is ${statusText}.`);
      }
    }

    // Step 2: Separate team members from podcast data
    const { team_members, ...podcastData } = payload.podcast;

    // Step 3: Insert the podcast data and get the new podcast's ID
    const { data: podcast, error: podcastError } = await supabaseAdmin
      .from('podcasts')
      .insert(podcastData)
      .select('id')
      .single();

    if (podcastError) {
      console.error('Supabase podcast insert error:', podcastError);
      throw new Error(`Failed to insert podcast: ${podcastError.message}`);
    }
    
    if (!podcast) {
        throw new Error('Failed to create podcast, no data returned.');
    }

    // Step 4: Prepare episodes data with the new podcast_id
    if (payload.episodes && payload.episodes.length > 0) {
      const episodesData = payload.episodes.map(episode => ({
        ...episode,
        podcast_id: podcast.id,
      }));

      // Step 5: Insert the episodes data
      const { error: episodesError } = await supabaseAdmin
        .from('episodes')
        .insert(episodesData);

      if (episodesError) {
        console.warn(`Podcast ${podcast.id} created, but failed to insert episodes:`, episodesError);
      }
    }

    // Step 6: Process team members
    if (team_members && team_members.length > 0) {
      for (const member of team_members) {
        // Find or create the person
        let { data: person, error: personError } = await supabaseAdmin
          .from('people')
          .select('id')
          .eq('full_name', member.name)
          .single();

        if (personError && personError.code !== 'PGRST116') { // 'PGRST116' is "No rows found"
          console.error('Error finding person:', personError);
          continue; // Skip to next member
        }

        if (!person) {
          const { data: newPerson, error: newPersonError } = await supabaseAdmin
            .from('people')
            .insert({
              full_name: member.name,
              bio: member.bio,
              photo_urls: member.photo_urls,
              social_links: member.social_links,
              is_verified: false, // Team members must be approved
              slug: generateSlug(member.name),
            })
            .select('id')
            .single();
          
          if (newPersonError) {
            console.error('Error creating person:', newPersonError);
            continue;
          }
          person = newPerson;
        }

        // Link person to podcast with multiple roles
        if (person) {
          const roles = Array.isArray(member.roles) ? member.roles : [member.roles];
          
          for (const role of roles) {
            const { error: linkError } = await supabaseAdmin
              .from('podcast_people')
              .insert({
                podcast_id: podcast.id,
                person_id: person.id,
                role: role,
              });

            if (linkError) {
              console.error('Error linking person to podcast with role:', linkError);
            }
          }
        }
      }
    }

    return { success: true, data: podcast };
  } catch (error: any) {
    console.error('Error in submitPodcastAction:', error);
    return { success: false, error: error.message };
  }
}
