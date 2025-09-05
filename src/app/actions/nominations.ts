
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { TablesInsert } from '@/integrations/supabase/types';

// This function creates a Supabase client with the service role key,
// which has admin privileges and can bypass RLS policies.
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

export async function createNominationPollAction(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const deadline = formData.get('deadline') as string;
  const nominatedPodcastIds = formData.getAll('nominated_podcast_ids') as string[];
  const createdById = formData.get('created_by_id') as string;

  if (!title || !deadline || nominatedPodcastIds.length === 0 || !createdById) {
    return { success: false, error: 'Title, deadline, creator, and at least one nominee are required.' };
  }
  
  if (nominatedPodcastIds.length > 10) {
    return { success: false, error: 'You can nominate a maximum of 10 podcasts per poll.' };
  }

  const supabaseAdmin = createAdminClient();

  try {
    // Step 1: Create the poll
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('nomination_polls')
      .insert({
        title,
        description,
        deadline,
        created_by: createdById,
        status: 'open',
      })
      .select()
      .single();

    if (pollError) throw pollError;

    // Step 2: Add the nominated podcasts
    const nomineesToInsert = nominatedPodcastIds.map(podcastId => ({
      poll_id: poll.id,
      podcast_id: podcastId,
    }));

    const { error: nomineesError } = await supabaseAdmin
      .from('nominated_podcasts')
      .insert(nomineesToInsert);

    if (nomineesError) {
      // Rollback poll creation if nominees fail
      await supabaseAdmin.from('nomination_polls').delete().eq('id', poll.id);
      throw nomineesError;
    }

    revalidatePath('/admin');
    revalidatePath('/awards/vote');
    return { success: true, data: poll };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function castVoteAction(pollId: string, nominatedPodcastId: string, userId: string) {
    if (!pollId || !nominatedPodcastId || !userId) {
        return { success: false, error: 'Missing required information for voting.' };
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
        const { data, error } = await supabase.rpc('cast_vote', {
            p_poll_id: pollId,
            p_nominated_podcast_id: nominatedPodcastId,
            p_user_id: userId
        } as any);

        if (error) throw error;

        if (data === false) {
             return { success: false, error: 'You have already voted in this poll or the poll is closed.' };
        }

        revalidatePath(`/awards/vote`);
        return { success: true, message: 'Your vote has been cast successfully!' };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
