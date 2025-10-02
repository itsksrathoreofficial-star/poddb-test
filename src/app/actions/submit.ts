
'use server';

import { createClient } from '@supabase/supabase-js';
import type { Database, TablesInsert } from '@/integrations/supabase/types';
import { generateSlug } from '@/lib/utils';

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

    // Step 2.5: Generate slug for podcast if not provided
    if (!podcastData.slug || podcastData.slug.trim() === '') {
      const baseSlug = generateSlug(podcastData.title);
      let slug = baseSlug;
      let counter = 1;

      // Check for uniqueness
      while (true) {
        const { data: existingPodcast } = await supabaseAdmin
          .from('podcasts')
          .select('id')
          .eq('slug', slug)
          .single();

        if (!existingPodcast) break;
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      podcastData.slug = slug;
    }

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

    // Step 4: Prepare episodes data with the new podcast_id and generate slugs
    if (payload.episodes && payload.episodes.length > 0) {
      // Sort episodes by published date (oldest first) for proper numbering
      const sortedEpisodes = [...payload.episodes].sort((a, b) => {
        const dateA = new Date(a.published_at || 0);
        const dateB = new Date(b.published_at || 0);
        return dateA.getTime() - dateB.getTime();
      });

      const episodesData = await Promise.all(sortedEpisodes.map(async (episode, index) => {
        // Generate slug for episode if not provided
        let episodeSlug = episode.slug;
        if (!episodeSlug || episodeSlug.trim() === '') {
          const baseSlug = generateSlug(episode.title);
          let slug = baseSlug;
          let counter = 1;

          // Check for uniqueness
          while (true) {
            const { data: existingEpisode } = await supabaseAdmin
              .from('episodes')
              .select('id')
              .eq('slug', slug)
              .single();

            if (!existingEpisode) break;
            
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          episodeSlug = slug;
        }

        return {
          ...episode,
          podcast_id: podcast.id,
          slug: episodeSlug,
          episode_number: index + 1, // Assign episode number based on sorted order
        };
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
          const roles = Array.isArray(member.role) ? member.role : [member.role];
          
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
