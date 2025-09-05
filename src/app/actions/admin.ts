'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { generateSeoMetadata } from '@/ai/flows/generate-seo-metadata';
import type { SeoMetadataInput } from '@/ai/flows/generate-seo-metadata';
import type { TablesInsert, Json } from '@/integrations/supabase/types';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { subDays, startOfDay, endOfDay } from 'date-fns';

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

export async function getContributionsAction() {
    const supabaseAdmin = createAdminClient();
    try {
        // Use service role to bypass RLS and get all contributions
        const { data, error } = await supabaseAdmin
            .from('contributions')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Get all episodes with SEO metadata
export async function getAllEpisodesAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { data, error } = await supabaseAdmin
            .from('episodes')
            .select(`
                id, title, description, slug, seo_metadata, 
                published_at, episode_number, season_number,
                duration, views, likes, average_rating,
                podcasts!inner(id, title, slug)
            `)
            .order('published_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Get all people with SEO metadata
export async function getAllPeopleAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { data, error } = await supabaseAdmin
            .from('people')
            .select(`
                id, full_name, bio, slug, seo_metadata,
                location, birth_date, photo_urls, website_url,
                total_appearances, average_rating, is_verified,
                social_links, created_at, updated_at
            `)
            .order('full_name', { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPendingPodcastsAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { data, error } = await supabaseAdmin.rpc('get_pending_podcasts_with_profiles');
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePodcastStatusAction(podcastId: string, status: 'approved' | 'rejected', userId: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const { error } = await supabaseAdmin
      .from('podcasts')
      .update({ submission_status: status, approved_by: userId })
      .eq('id', podcastId);

    if (error) throw error;

    if (status === 'approved') {
      const { data: podcast, error: podcastError } = await supabaseAdmin
        .from('podcasts')
        .select('id, title, description, categories')
        .eq('id', podcastId)
        .single();

      if (podcastError) throw podcastError;

      if (podcast) {
        const job: TablesInsert<'seo_jobs'> = {
          target_id: podcast.id,
          target_table: 'podcasts',
          status: 'pending',
          context: {
            title: podcast.title,
            description: podcast.description,
            contentType: 'podcast',
            relatedInfo: podcast.categories?.join(', ') || ''
          }
        };
        
        const { error: insertError } = await supabaseAdmin
          .from('seo_jobs')
          .upsert(job, { onConflict: 'target_id, target_table', ignoreDuplicates: true });
            
        if (insertError) throw insertError;
      }
    }
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}



// --- YouTube API Key Actions ---

export async function saveApiKeyAction(apiKeyName: string, youtubeApiKey: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const { data, error } = await supabaseAdmin
      .from('youtube_api_keys')
      .upsert({
        name: apiKeyName,
        api_key: youtubeApiKey,
        quota_used: 0,
        quota_limit: 10000,
        is_active: true
      }, { onConflict: 'api_key', ignoreDuplicates: false });

    if (error) throw error;
    
    revalidatePath('/admin');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteApiKeyAction(keyId: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const { error } = await supabaseAdmin
      .from('youtube_api_keys')
      .delete()
      .eq('id', keyId);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleApiKeyAction(keyId: string, isActive: boolean) {
  const supabaseAdmin = createAdminClient();
  try {
    const { error } = await supabaseAdmin
      .from('youtube_api_keys')
      .update({ is_active: !isActive })
      .eq('id', keyId);

    if (error) throw error;
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetApiKeyQuotasAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { error } = await supabaseAdmin
            .from('youtube_api_keys')
            .update({ quota_used: 0 })
            .neq('id', '00000000-0000-0000-0000-000000000000'); 

        if (error) throw error;

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRankingsAction(
  itemType: 'podcasts' | 'episodes',
  period: 'weekly' | 'monthly' | 'overall',
  category: string
) {
  const supabaseAdmin = createAdminClient();

  if (period === 'overall') {
    if (itemType === 'podcasts') {
      let query = supabaseAdmin
        .from('podcasts')
        .select('id, slug, title, categories, total_views, total_likes, cover_image_url, total_episodes, is_verified')
        .eq('submission_status', 'approved');
      if (category !== 'all') {
        query = query.contains('categories', [category]);
      }
      const { data, error } = await query.order('total_views', { ascending: false }).limit(100);
      if (error) {
        console.error(`[getRankingsAction] Error fetching overall podcast rankings:`, error);
        return [];
      }
      return data.map((p, i) => ({ ...p, rank: i + 1, viewsInPeriod: p.total_views, likesInPeriod: p.total_likes }));
    } else { // episodes
      let query = supabaseAdmin
        .from('episodes')
        .select('id, slug, title, views, likes, thumbnail_url, podcasts!inner(title, submission_status, categories, is_verified)')
        .eq('podcasts.submission_status', 'approved');
      if (category !== 'all') {
        query = query.contains('podcasts.categories', [category]);
      }
      const { data, error } = await query.order('views', { ascending: false }).limit(100);
      if (error) {
        console.error(`[getRankingsAction] Error fetching overall episode rankings:`, error);
        return [];
      }
      return data.map((e, i) => {
        const podcast = Array.isArray(e.podcasts) ? e.podcasts[0] : e.podcasts;
        return {
          id: e.id,
          slug: e.slug,
          title: e.title,
          cover_image_url: e.thumbnail_url,
          viewsInPeriod: e.views,
          likesInPeriod: e.likes,
          rank: i + 1,
          podcast_title: podcast?.title || 'Unknown Podcast',
          categories: podcast?.categories || [],
          total_episodes: 0,
          is_verified: podcast?.is_verified || false,
        };
      });
    }
  }

  // Weekly and monthly rankings are not supported since sync functionality is removed
  console.warn(`[getRankingsAction] Period '${period}' is not supported. Only 'overall' rankings are available.`);
  return [];
}

// --- Gemini API Key Actions ---

export async function saveGeminiApiKeyAction(apiKeyName: string, geminiApiKey: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const { data, error } = await supabaseAdmin
      .from('gemini_api_keys')
      .upsert({
        name: apiKeyName,
        api_key: geminiApiKey,
        requests_used: 0,
        is_active: true
      }, { onConflict: 'api_key', ignoreDuplicates: false });

    if (error) throw error;
    
    revalidatePath('/admin');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteGeminiApiKeyAction(keyId: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const { error } = await supabaseAdmin
      .from('gemini_api_keys')
      .delete()
      .eq('id', keyId);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleGeminiApiKeyAction(keyId: string, isActive: boolean) {
  const supabaseAdmin = createAdminClient();
  try {
    const { error } = await supabaseAdmin
      .from('gemini_api_keys')
      .update({ is_active: !isActive })
      .eq('id', keyId);

    if (error) throw error;
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetGeminiApiKeyQuotasAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { error } = await supabaseAdmin
            .from('gemini_api_keys')
            .update({ requests_used: 0 })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- OpenRouter API Key Actions ---

export async function saveOpenRouterApiKeyAction(apiKeyName: string, openRouterApiKey: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const { data, error } = await supabaseAdmin
      .from('openrouter_api_keys')
      .upsert({
        name: apiKeyName,
        api_key: openRouterApiKey,
        requests_used: 0,
        is_active: true
      }, { onConflict: 'api_key', ignoreDuplicates: false });

    if (error) throw error;
    
    revalidatePath('/admin');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteOpenRouterApiKeyAction(keyId: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const { error } = await supabaseAdmin
      .from('openrouter_api_keys')
      .delete()
      .eq('id', keyId);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleOpenRouterApiKeyAction(keyId: string, isActive: boolean) {
  const supabaseAdmin = createAdminClient();
  try {
    const { error } = await supabaseAdmin
      .from('openrouter_api_keys')
      .update({ is_active: !isActive })
      .eq('id', keyId);

    if (error) throw error;
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetOpenRouterApiKeyQuotasAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { error } = await supabaseAdmin
            .from('openrouter_api_keys')
            .update({ requests_used: 0 })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- SEO Generation Actions ---

export async function queueSeoGenerationForApprovedPodcastsAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { data: approvedPodcasts, error: podcastError } = await supabaseAdmin
            .from('podcasts')
            .select('id, title, description, categories')
            .eq('submission_status', 'approved');

        if (podcastError) throw podcastError;

        const jobs: TablesInsert<'seo_jobs'>[] = [];
        for (const podcast of approvedPodcasts) {
            jobs.push({
                target_id: podcast.id,
                target_table: 'podcasts',
                status: 'pending',
                context: {
                    title: podcast.title,
                    description: podcast.description,
                    contentType: 'podcast',
                    relatedInfo: podcast.categories?.join(', ') || ''
                }
            });
        }
        
        if (jobs.length > 0) {
            const { error: insertError } = await supabaseAdmin
                .from('seo_jobs')
                .upsert(jobs, { onConflict: 'target_id, target_table', ignoreDuplicates: true });
                
            if (insertError) throw insertError;
        }

        revalidatePath('/admin');
        return { success: true, count: jobs.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Advanced Queue Management for Episodes
export async function queueSeoGenerationForEpisodesAction() {
    const supabaseAdmin = createAdminClient();
    try {
        // Get total count first
        const { count: totalEpisodes, error: countError } = await supabaseAdmin
            .from('episodes')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Get episodes that don't have SEO jobs yet
        const { data: episodes, error: episodesError } = await supabaseAdmin
            .from('episodes')
            .select(`
                id, title, description, 
                podcasts!inner(id, title),
                seo_jobs!left(id, status)
            `)
            .is('seo_jobs.id', null); // Only episodes without existing SEO jobs

        if (episodesError) throw episodesError;

        const jobs: TablesInsert<'seo_jobs'>[] = [];
        for (const episode of episodes || []) {
            jobs.push({
                target_id: episode.id,
                target_table: 'episodes',
                status: 'pending',
                context: {
                    title: episode.title,
                    description: episode.description || '',
                    contentType: 'episode',
                    relatedInfo: `From podcast: ${(episode.podcasts as any)?.title || 'Unknown'}`
                }
            });
        }

        if (jobs.length > 0) {
            const { error: insertError } = await supabaseAdmin
                .from('seo_jobs')
                .insert(jobs);
                
            if (insertError) throw insertError;
        }

        revalidatePath('/admin');
        return { 
            success: true, 
            count: jobs.length,
            total: totalEpisodes || 0,
            message: `Queued ${jobs.length} episodes for SEO generation (${totalEpisodes || 0} total episodes)`
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Advanced Queue Management for People
export async function queueSeoGenerationForPeopleAction() {
    const supabaseAdmin = createAdminClient();
    try {
        // Get total count first
        const { count: totalPeople, error: countError } = await supabaseAdmin
            .from('people')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Get people that don't have SEO jobs yet
        const { data: people, error: peopleError } = await supabaseAdmin
            .from('people')
            .select(`
                id, full_name, bio, location,
                seo_jobs!left(id, status)
            `)
            .is('seo_jobs.id', null); // Only people without existing SEO jobs

        if (peopleError) throw peopleError;

        const jobs: TablesInsert<'seo_jobs'>[] = [];
        for (const person of people || []) {
            jobs.push({
                target_id: person.id,
                target_table: 'people',
                status: 'pending',
                context: {
                    title: person.full_name,
                    description: person.bio || '',
                    contentType: 'person',
                    relatedInfo: person.location || ''
                }
            });
        }

        if (jobs.length > 0) {
            const { error: insertError } = await supabaseAdmin
                .from('seo_jobs')
                .insert(jobs);
                
            if (insertError) throw insertError;
        }

        revalidatePath('/admin');
        return { 
            success: true, 
            count: jobs.length,
            total: totalPeople || 0,
            message: `Queued ${jobs.length} people for SEO generation (${totalPeople || 0} total people)`
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Get detailed queue statistics
export async function getSeoQueueStatsAction() {
    const supabaseAdmin = createAdminClient();
    try {
        // Get counts by status and content type
        const { data: stats, error: statsError } = await supabaseAdmin
            .from('seo_jobs')
            .select('status, target_table')
            .order('created_at', { ascending: false });

        if (statsError) throw statsError;

        // Calculate statistics
        const statsByType = {
            podcasts: { pending: 0, completed: 0, failed: 0, processing: 0, total: 0 },
            episodes: { pending: 0, completed: 0, failed: 0, processing: 0, total: 0 },
            people: { pending: 0, completed: 0, failed: 0, processing: 0, total: 0 }
        };

        stats?.forEach(stat => {
            const type = stat.target_table as keyof typeof statsByType;
            if (type && statsByType[type]) {
                statsByType[type][stat.status as keyof typeof statsByType[typeof type]]++;
                statsByType[type].total++;
            }
        });

        // Get total content counts
        const [podcastsCount, episodesCount, peopleCount] = await Promise.all([
            supabaseAdmin.from('podcasts').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('episodes').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('people').select('*', { count: 'exact', head: true })
        ]);

        return {
            success: true,
            data: {
                stats: statsByType,
                totals: {
                    podcasts: podcastsCount.count || 0,
                    episodes: episodesCount.count || 0,
                    people: peopleCount.count || 0
                }
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Process queue in batches with progress tracking
export async function processSeoQueueBatchAction(batchSize: number = 10) {
    const supabaseAdmin = createAdminClient();
    try {
        console.log(`🚀 Starting batch processing with batch size: ${batchSize}`);
        
        const { data: pendingJobs, error: fetchError } = await supabaseAdmin
            .from('seo_jobs')
            .select('*')
            .eq('status', 'pending')
            .limit(batchSize);

        if (fetchError) throw fetchError;
        if (!pendingJobs || pendingJobs.length === 0) {
            console.log('ℹ️ No pending jobs to process.');
            return { success: true, processed: 0, message: "No pending jobs to process." };
        }

        console.log(`📋 Processing batch of ${pendingJobs.length} jobs`);

        let processed = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const job of pendingJobs) {
            try {
                console.log(`🔄 Processing job ${job.id} for ${job.target_table}...`);
                
                await supabaseAdmin.from('seo_jobs').update({ status: 'processing' }).eq('id', job.id);

                const context = job.context as SeoMetadataInput;
                const seoData = await generateSeoMetadata(context);
                console.log(`✅ SEO generation successful for job ${job.id}`);

                // Update the target record with SEO data
                const updateData: any = {
                    seo_metadata: seoData as any
                };
                
                // Check if slug needs to be updated
                if (seoData.slug) {
                    const { data: existingSlug } = await supabaseAdmin
                        .from(job.target_table as any)
                        .select('id')
                        .eq('slug', seoData.slug)
                        .neq('id', job.target_id)
                        .single();
                    
                    if (!existingSlug) {
                        updateData.slug = seoData.slug;
                        console.log(`🔗 Updating slug to: ${seoData.slug}`);
                    }
                }

                const { error: updateError } = await supabaseAdmin
                    .from(job.target_table as any)
                    .update(updateData)
                    .eq('id', job.target_id);

                if (updateError) throw updateError;
                
                await supabaseAdmin.from('seo_jobs').update({ status: 'completed' }).eq('id', job.id);
                processed++;
                console.log(`✅ Job ${job.id} completed successfully`);

            } catch (jobError: any) {
                console.error(`❌ Job ${job.id} failed:`, jobError);
                await supabaseAdmin.from('seo_jobs').update({ 
                    status: 'failed', 
                    error_message: jobError.message 
                }).eq('id', job.id);
                failed++;
                errors.push(`Job ${job.id}: ${jobError.message}`);
            }
        }

        revalidatePath('/admin');
        return { 
            success: true, 
            processed, 
            failed,
            errors: errors.slice(0, 5), // Return first 5 errors
            message: `Batch processing completed: ${processed} successful, ${failed} failed`
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Clear failed jobs to retry them
export async function clearFailedSeoJobsAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { error } = await supabaseAdmin
            .from('seo_jobs')
            .update({ status: 'pending', error_message: null })
            .eq('status', 'failed');

        if (error) throw error;

        revalidatePath('/admin');
        return { success: true, message: "Failed jobs cleared and reset to pending" };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function regenerateSeoForExistingContentAction() {
    const supabaseAdmin = createAdminClient();
    try {
        // Get all approved podcasts that already have SEO metadata
        const { data: existingPodcasts, error: podcastError } = await supabaseAdmin
            .from('podcasts')
            .select('id, title, description, categories, seo_metadata')
            .eq('submission_status', 'approved')
            .not('seo_metadata', 'is', null);

        if (podcastError) throw podcastError;

        const jobs: TablesInsert<'seo_jobs'>[] = [];
        for (const podcast of existingPodcasts) {
            jobs.push({
                target_id: podcast.id,
                target_table: 'podcasts',
                status: 'pending',
                context: {
                    title: podcast.title,
                    description: podcast.description,
                    contentType: 'podcast',
                    relatedInfo: podcast.categories?.join(', ') || ''
                }
            });
        }
        
        if (jobs.length > 0) {
            const { error: insertError } = await supabaseAdmin
                .from('seo_jobs')
                .upsert(jobs, { onConflict: 'target_id, target_table', ignoreDuplicates: true });
                
            if (insertError) throw insertError;
        }

        revalidatePath('/admin');
        return { success: true, count: jobs.length, message: `${jobs.length} podcasts queued for SEO regeneration.` };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getSeoJobsAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { data: seoJobs, error: jobsError } = await supabaseAdmin
            .from('seo_jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        const enrichedJobs = await Promise.all(
            seoJobs.map(async (job) => {
                if (job.target_table === 'podcasts') {
                    const { data: podcast, error: podcastError } = await supabaseAdmin
                        .from('podcasts')
                        .select('title, seo_metadata')
                        .eq('id', job.target_id)
                        .single();
                    
                    if (!podcastError && podcast) {
                        return {
                            ...job,
                            podcasts: podcast
                        };
                    }
                } else if (job.target_table === 'episodes') {
                    const { data: episode, error: episodeError } = await supabaseAdmin
                        .from('episodes')
                        .select('title, seo_metadata')
                        .eq('id', job.target_id)
                        .single();
                    
                    if (!episodeError && episode) {
                        return {
                            ...job,
                            podcasts: episode // Using same field name for consistency
                        };
                    }
                } else if (job.target_table === 'people') {
                    const { data: person, error: personError } = await supabaseAdmin
                        .from('people')
                        .select('full_name as title, seo_metadata')
                        .eq('id', job.target_id)
                        .single();
                    
                    if (!personError && person) {
                        return {
                            ...job,
                            podcasts: person // Using same field name for consistency
                        };
                    }
                }
                return {
                    ...job,
                    podcasts: null
                };
            })
        );

        return { success: true, data: enrichedJobs };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function processSeoJobQueueAction() {
    const supabaseAdmin = createAdminClient();
    try {
        console.log('🚀 Starting SEO job queue processing...');
        
        const { data: pendingJobs, error: fetchError } = await supabaseAdmin
            .from('seo_jobs')
            .select('*')
            .eq('status', 'pending')
            .limit(5);

        if (fetchError) throw fetchError;
        if (!pendingJobs || pendingJobs.length === 0) {
            console.log('ℹ️ No pending jobs to process.');
            return { success: true, processed: 0, message: "No pending jobs to process." };
        }

        console.log(`📋 Found ${pendingJobs.length} pending jobs to process`);

        for (const job of pendingJobs) {
            try {
                console.log(`🔄 Processing job ${job.id} for ${job.target_table}...`);
                
                await supabaseAdmin.from('seo_jobs').update({ status: 'processing' }).eq('id', job.id);

                const context = job.context as SeoMetadataInput;
                console.log(`📝 Job context:`, { 
                    title: context.title, 
                    contentType: context.contentType,
                    descriptionLength: context.description?.length || 0
                });
                
                const seoData = await generateSeoMetadata(context);
                console.log(`✅ SEO generation successful for job ${job.id}`);

                // Only update slug if it's different and doesn't conflict
                const updateData: any = {
                    seo_metadata: seoData as any
                };
                
                // Check if slug needs to be updated
                if (seoData.slug) {
                    const { data: existingSlug } = await supabaseAdmin
                        .from(job.target_table as any)
                        .select('id')
                        .eq('slug', seoData.slug)
                        .neq('id', job.target_id)
                        .single();
                    
                    if (!existingSlug) {
                        updateData.slug = seoData.slug;
                        console.log(`🔗 Updating slug to: ${seoData.slug}`);
                    } else {
                        console.log(`⚠️ Slug ${seoData.slug} already exists, skipping slug update`);
                    }
                }

                const { error: updateError } = await supabaseAdmin
                    .from(job.target_table as any)
                    .update(updateData)
                    .eq('id', job.target_id);

                if (updateError) throw updateError;
                
                await supabaseAdmin.from('seo_jobs').update({ status: 'completed' }).eq('id', job.id);
                console.log(`✅ Job ${job.id} completed successfully`);
                
                revalidatePath(`/${job.target_table}/${seoData.slug}`);

            } catch (aiError: any) {
                console.error(`❌ Failed to process SEO job ${job.id}:`, aiError);
                await supabaseAdmin.from('seo_jobs').update({ 
                    status: 'failed', 
                    error_message: aiError.message 
                }).eq('id', job.id);
            }
        }
        
        revalidatePath('/admin');
        console.log(`🎯 SEO job queue processing completed. Processed ${pendingJobs.length} jobs.`);
        return { success: true, processed: pendingJobs.length };

    } catch (error: any) {
        console.error("❌ Error processing SEO job queue:", error);
        return { success: false, error: error.message };
    }
}

export async function generateSingleSeoMetadataAction(
    targetId: string, 
    targetTable: 'podcasts' | 'episodes' | 'people' | 'news_articles',
    context: SeoMetadataInput
) {
    const supabaseAdmin = createAdminClient();
    try {
        console.log(`🚀 Starting comprehensive SEO generation for ${targetTable} ${targetId}`);
        console.log(`📝 Context:`, context);
        
        // Fetch additional data for comprehensive SEO generation
        let additionalContext = {};
        
        if (targetTable === 'podcasts') {
            const { data: podcastData } = await supabaseAdmin
                .from('podcasts')
                .select('*')
                .eq('id', targetId)
                .single();
            
            if (podcastData) {
                additionalContext = {
                    categories: podcastData.categories || [],
                    tags: podcastData.tags || [],
                    language: podcastData.language,
                    averageRating: podcastData.average_rating,
                    totalViews: podcastData.total_views,
                    totalLikes: podcastData.total_likes,
                    totalEpisodes: podcastData.total_episodes,
                    averageDuration: podcastData.average_duration,
                    firstEpisodeDate: podcastData.first_episode_date,
                    lastEpisodeDate: podcastData.last_episode_date,
                    teamMembers: podcastData.team_members,
                    socialLinks: podcastData.social_links,
                    platformLinks: podcastData.platform_links,
                    officialWebsite: podcastData.official_website,
                    youtubePlaylistUrl: podcastData.youtube_playlist_url,
                };
            }
        } else if (targetTable === 'episodes') {
            const { data: episodeData } = await supabaseAdmin
                .from('episodes')
                .select(`
                    *,
                    podcasts!inner(title, cover_image_url, slug)
                `)
                .eq('id', targetId)
                .single();
            
            if (episodeData) {
                additionalContext = {
                    tags: episodeData.tags || [],
                    episodeNumber: episodeData.episode_number,
                    seasonNumber: episodeData.season_number,
                    duration: episodeData.duration,
                    publishedAt: episodeData.published_at,
                    podcastTitle: episodeData.podcasts?.title,
                    averageRating: episodeData.average_rating,
                    totalViews: episodeData.views,
                    totalLikes: episodeData.likes,
                };
            }
        } else if (targetTable === 'people') {
            const { data: personData } = await supabaseAdmin
                .from('people')
                .select('*')
                .eq('id', targetId)
                .single();
            
            if (personData) {
                additionalContext = {
                    bio: personData.bio,
                    birthDate: personData.birth_date,
                    location: personData.location,
                    photoUrls: personData.photo_urls,
                    websiteUrl: personData.website_url,
                    totalAppearances: personData.total_appearances,
                    isVerified: personData.is_verified,
                    averageRating: personData.average_rating,
                    socialLinks: personData.social_links,
                };
            }
        }
        
        // Enhance context with additional data
        const enhancedContext = {
            ...context,
            additionalContext
        };
        
        console.log(`🔍 Enhanced context for comprehensive SEO:`, enhancedContext);
        
        const seoData = await generateSeoMetadata(enhancedContext);
        console.log(`✅ Comprehensive SEO generation successful:`, seoData);
        
        // Only update slug if it's different and doesn't conflict
        const updateData: any = {
            seo_metadata: seoData as any
        };
        
        // Check if slug needs to be updated
        if (seoData.slug) {
            const { data: existingSlug } = await supabaseAdmin
                .from(targetTable)
                .select('id')
                .eq('slug', seoData.slug)
                .neq('id', targetId)
                .single();
            
            if (!existingSlug) {
                updateData.slug = seoData.slug;
                console.log(`🔗 Will update slug to: ${seoData.slug}`);
            } else {
                console.log(`⚠️ Slug ${seoData.slug} already exists, skipping slug update`);
            }
        }

        const { error } = await supabaseAdmin
            .from(targetTable)
            .update(updateData)
            .eq('id', targetId);

        if (error) throw error;

        console.log(`✅ Database update successful for ${targetTable} ${targetId}`);
        revalidatePath('/admin');
        revalidatePath(`/${targetTable}/${seoData.slug}`);
        return { success: true, data: seoData };
    } catch (error: any) {
        console.error('❌ AI SEO Generation Error:', error);
        return { success: false, error: error.message };
    }
}

// Test function to verify OpenRouter API is working
export async function testOpenRouterApiAction() {
    try {
        console.log('🧪 Testing OpenRouter API connection...');
        
        // Test with a simple prompt
        const testInput: SeoMetadataInput = {
            title: "Test Podcast",
            description: "This is a test podcast for API verification",
            contentType: "podcast",
            relatedInfo: "Test category"
        };
        
        const result = await generateSeoMetadata(testInput);
        console.log('✅ OpenRouter API test successful:', result);
        
        return { 
            success: true, 
            message: "OpenRouter API is working correctly",
            data: result 
        };
    } catch (error: any) {
        console.error('❌ OpenRouter API test failed:', error);
        return { 
            success: false, 
            error: error.message,
            message: "OpenRouter API test failed. Check your API keys and configuration."
        };
    }
}

// --- Settings Actions ---

export async function exportSettingsAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { data, error } = await supabaseAdmin.from('settings').select('*').eq('id', 1).single();
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        return { success: true, data: data || null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function importSettingsAction(settingsData: Json) {
    const supabaseAdmin = createAdminClient();
    try {
        const { data, error } = await supabaseAdmin
            .from('settings')
            .update({
                ...(settingsData as any),
                id: 1,
                updated_at: new Date().toISOString(),
            })
            .eq('id', 1);

        if (error) throw error;

        revalidatePath('/admin');
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleMaintenanceModeAction(isMaintenanceMode: boolean) {
    const supabaseAdmin = createAdminClient();
    try {
        const { error } = await supabaseAdmin
            .from('settings')
            .update({ maintenance_mode: isMaintenanceMode })
            .eq('id', 1);

        if (error) throw error;

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function clearAllDataAction() {
    const supabaseAdmin = createAdminClient();
    try {
        const { error } = await supabaseAdmin.functions.invoke('clear-all-data');
        if (error) throw new Error(error.message);

        revalidatePath('/admin');
        return { success: true, message: 'Core content data (podcasts, people, episodes, news) has been cleared. System settings preserved.' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Pages Content Actions ---

export async function saveAboutPageContentAction(content: Json) {
  const supabaseAdmin = createAdminClient();
  try {
    const { error } = await supabaseAdmin
      .from('pages')
      .update({ content })
      .eq('slug', 'about');
    
    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/about');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Explore Page Carousel Actions ---

export async function saveCarouselItemAction(formData: FormData) {
  const supabaseAdmin = createAdminClient();
  const rawFormData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    image_url: formData.get('image_url') as string,
    redirect_link: formData.get('redirect_link') as string,
    order: parseInt(formData.get('order') as string, 10),
    is_active: formData.get('is_active') === 'on',
  };

  try {
    const { data, error } = await supabaseAdmin.from('explore_carousel').insert(rawFormData);
    if (error) throw error;
    revalidatePath('/admin');
    revalidatePath('/explore');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCarouselItemAction(id: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const { error } = await supabaseAdmin.from('explore_carousel').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin');
    revalidatePath('/explore');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCarouselItemOrderAction(id: string, order: number) {
    const supabaseAdmin = createAdminClient();
    try {
        const { error } = await supabaseAdmin.from('explore_carousel').update({ order }).eq('id', id);
        if (error) throw error;
        revalidatePath('/admin');
        revalidatePath('/explore');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleCarouselItemActiveAction(id: string, currentState: boolean) {
    const supabaseAdmin = createAdminClient();
    try {
        const { error } = await supabaseAdmin.from('explore_carousel').update({ is_active: !currentState }).eq('id', id);
        if (error) throw error;
        revalidatePath('/admin');
        revalidatePath('/explore');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Award Actions ---

export async function createAwardAction(awardData: TablesInsert<'awards'>) {
    const supabaseAdmin = createAdminClient();
    try {
        const { data, error } = await supabaseAdmin.from('awards').insert(awardData).select().single();
        if (error) throw error;
        revalidatePath('/admin/awards');
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignAwardAction(assignmentData: TablesInsert<'assigned_awards'>) {
    const supabaseAdmin = createAdminClient();
    try {
        const { data, error } = await supabaseAdmin.from('assigned_awards').insert(assignmentData).select().single();
        if (error) throw error;
        revalidatePath('/admin/awards');
        revalidatePath('/awards');
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAwardAction(awardId: string) {
    const supabaseAdmin = createAdminClient();
    try {
        await supabaseAdmin.from('assigned_awards').delete().eq('award_id', awardId);
        await supabaseAdmin.from('awards').delete().eq('id', awardId);
        revalidatePath('/admin/awards');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateAwardAction(awardId: string, awardData: Partial<TablesInsert<'awards'>>) {
    const supabaseAdmin = createAdminClient();
    try {
        const { data, error } = await supabaseAdmin.from('awards').update(awardData).eq('id', awardId).select().single();
        if (error) throw error;
        revalidatePath('/admin/awards');
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function revokeAwardAction(assignedAwardId: string) {
    const supabaseAdmin = createAdminClient();
    try {
        await supabaseAdmin.from('assigned_awards').delete().eq('id', assignedAwardId);
        revalidatePath('/admin/awards');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Nomination Actions ---

export async function updateNominationAction(nominationId: string, nominationData: Partial<TablesInsert<'nominations'>>) {
    const supabaseAdmin = createAdminClient();
    try {
        const { data, error } = await supabaseAdmin.from('nominations').update(nominationData).eq('id', nominationId).select().single();
        if (error) throw error;
        revalidatePath('/admin/nominations');
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteNominationPollAction(pollId: string) {
    const supabaseAdmin = createAdminClient();
    try {
        const { data: nominatedPodcasts, error: nominatedPodcastsError } = await supabaseAdmin
            .from('nominated_podcasts')
            .select('id')
            .eq('poll_id', pollId);

        if (nominatedPodcastsError) throw nominatedPodcastsError;

        const nominatedPodcastIds = nominatedPodcasts.map(np => np.id);

        if (nominatedPodcastIds.length > 0) {
            await supabaseAdmin.from('votes').delete().in('nominated_podcast_id', nominatedPodcastIds);
        }

        await supabaseAdmin.from('nominated_podcasts').delete().eq('poll_id', pollId);
        await supabaseAdmin.from('nomination_polls').delete().eq('id', pollId);
        revalidatePath('/admin/nominations');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function addManualVoteAction(pollId: string, nominatedPodcastId: string, votesToAdd: number, userId: string) {
    const supabaseAdmin = createAdminClient();
    try {
        const votes = Array.from({ length: votesToAdd }, () => ({
            poll_id: pollId,
            nominated_podcast_id: nominatedPodcastId,
            user_id: userId,
            is_manual_vote: true
        }));
        const { error } = await supabaseAdmin.from('votes').insert(votes);
        if (error) throw error;
        revalidatePath('/admin/nominations');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- Verification Actions ---

export async function handleVerificationAction(requestId: string, status: 'approved' | 'rejected', reviewedById: string) {
    const supabaseAdmin = createAdminClient();
    try {
        const { data: request, error: fetchError } = await supabaseAdmin
            .from('verification_requests')
            .select('target_id, target_table')
            .eq('id', requestId)
            .single();

        if (fetchError || !request) throw new Error("Request not found.");

        const { error: updateRequestError } = await supabaseAdmin
            .from('verification_requests')
            .update({ status, reviewed_by: reviewedById, reviewed_at: new Date().toISOString() })
            .eq('id', requestId);
        
        if (updateRequestError) throw updateRequestError;

        if (status === 'approved') {
            const { error: verifyItemError } = await supabaseAdmin
                .from(request.target_table as any)
                .update({ is_verified: true })
                .eq('id', request.target_id);

             if (verifyItemError) throw verifyItemError;
        }
        
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function approveContribution(contributionId: string, reviewerId: string) {
  const supabaseAdmin = createAdminClient();
  
  // First get the contribution details
  const { data: contribution, error: fetchError } = await supabaseAdmin
    .from('contributions')
    .select('user_id, target_table, target_id, data')
    .eq('id', contributionId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  // Check if reviewer is admin
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('user_id', reviewerId)
    .single();

  if (profileError || profile?.role !== 'admin') {
    throw new Error('Only admins can approve contributions.');
  }

  // Approve the contribution using direct table update
  const { error: updateError } = await supabaseAdmin
    .from('contributions')
    .update({
      status: 'approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', contributionId)
    .eq('status', 'pending');

  if (updateError) throw new Error(updateError.message);

  // Apply the changes to the target table
  const targetTable = contribution.target_table;
  const targetId = contribution.target_id;
  const data = contribution.data;

  // Update the target record with the contribution data
  const { error: targetUpdateError } = await supabaseAdmin
    .from(targetTable)
    .update(data)
    .eq('id', targetId);

  if (targetUpdateError) throw new Error(targetUpdateError.message);

  // Send notification to the user
  try {
    const { error: notificationError } = await supabaseAdmin.rpc('create_notification', {
      p_user_id: contribution.user_id,
      p_title: 'Contribution Approved',
      p_message: `Your contribution for ${contribution.data.title || 'the item'} has been approved and is now live!`,
      p_type: 'contribution_approved',
      p_metadata: {
        contribution_id: contributionId,
        target_table: contribution.target_table,
        target_id: contribution.target_id
      }
    });

    if (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the main operation if notification fails
    }
  } catch (notificationError) {
    console.error('Failed to send notification:', notificationError);
    // Don't fail the main operation if notification fails
  }

  revalidatePath('/admin');
}

export async function rejectContribution(contributionId: string, reviewerNotes: string, reviewerId: string) {
  const supabaseAdmin = createAdminClient();
  
  // First get the contribution details
  const { data: contribution, error: fetchError } = await supabaseAdmin
    .from('contributions')
    .select('user_id, target_table, target_id, data')
    .eq('id', contributionId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  // Check if reviewer is admin
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('user_id', reviewerId)
    .single();

  if (profileError || profile?.role !== 'admin') {
    throw new Error('Only admins can reject contributions.');
  }

  // Reject the contribution using direct table update
  const { error: updateError } = await supabaseAdmin
    .from('contributions')
    .update({
      status: 'rejected',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: reviewerNotes
    })
    .eq('id', contributionId)
    .eq('status', 'pending');

  if (updateError) throw new Error(updateError.message);

  // Send notification to the user
  try {
    const { error: notificationError } = await supabaseAdmin.rpc('create_notification', {
      p_user_id: contribution.user_id,
      p_title: 'Contribution Rejected',
      p_message: `Your contribution for ${contribution.data.title || 'the item'} has been rejected. ${reviewerNotes ? `Reason: ${reviewerNotes}` : ''}`,
      p_type: 'contribution_rejected',
      p_metadata: {
        contribution_id: contributionId,
        target_table: contribution.target_table,
        target_id: contribution.target_id,
        reviewer_notes: reviewerNotes
      }
    });

    if (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the main operation if notification fails
    }
  } catch (notificationError) {
    console.error('Failed to send notification:', notificationError);
    // Don't fail the main operation if notification fails
  }

  revalidatePath('/admin');
}

export async function getContributionByIdAction(contributionId: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const { data, error } = await supabaseAdmin
      .from('contributions')
      .select('*')
      .eq('id', contributionId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOriginalDataAction(targetTable: string, targetId: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const { data, error } = await supabaseAdmin
      .from(targetTable)
      .select('*')
      .eq('id', targetId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}