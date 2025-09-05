
// =================================================================================================
// DEVELOPER NOTICE
// =================================================================================================
// This page fetches its data from the `get_episode_details_by_slug` Supabase RPC function.
// If you need to modify the data fetching logic, please update the corresponding SQL function
// in `supabase/migrations/20250828160000_fix_episode_details_function.sql` and document your
// changes here.
//
// The function returns a JSONB object with the following structure:
// {
//   "id": "uuid",
//   "title": "text",
//   "description": "text",
//   "youtube_url": "text",
//   "youtube_video_id": "text",
//   "thumbnail_url": "text",
//   "duration": "integer",
//   "published_at": "timestamp",
//   "views": "integer",
//   "likes": "integer",
//   "comments": "integer",
//   "slug": "text",
//   "podcasts": {
//     "id": "uuid",
//     "title": "text",
//     "cover_image_url": "text"
//   },
//   "reviews": [
//     {
//       "id": "uuid",
//       "rating": "integer",
//       "review_title": "text",
//       "review_text": "text",
//       "created_at": "timestamp",
//       "upvotes": "integer",
//       "downvotes": "integer",
//       "profiles": {
//         "display_name": "text",
//         "avatar_url": "text"
//       }
//     }
//   ]
// }
// =================================================================================================

import { supabase } from '@/integrations/supabase/client';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import EpisodeClientPage from './EpisodeClientPage';
import { type Tables } from '@/integrations/supabase/types';

export const dynamicParams = true;

type EpisodeWithPodcastAndReviews = Tables<'episodes'> & {
  podcasts: Pick<Tables<'podcasts'>, 'id' | 'title' | 'cover_image_url' | 'slug' | 'is_verified'>;
  reviews: (Tables<'reviews'> & { profiles: Tables<'profiles'> | null })[];
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { data: episodes } = await supabase
    .from('episodes')
    .select('slug, podcasts!inner(submission_status)')
    .eq('podcasts.submission_status', 'approved')
    .not('slug', 'is', null)
    .limit(1000); // Limit to avoid excessive build time, adjust as needed

  return episodes?.map(({ slug }) => ({
    slug: slug!,
  })) || [];
}

async function getEpisode(slug: string): Promise<EpisodeWithPodcastAndReviews> {
  console.log(`[EpisodePage] Fetching episode data for slug/id: ${slug}`);

  // Check if slug is a valid UUID format
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);

  // Step 1: Fetch the episode and its associated podcast
  const { data: episodeData, error: episodeError } = await supabase
    .from('episodes')
    .select(`
      *,
      podcasts!inner(id, title, cover_image_url, submission_status, slug, is_verified)
    `)
    .eq(isUUID ? 'id' : 'slug', slug)
    .eq('podcasts.submission_status', 'approved')
    .single();

  if (episodeError || !episodeData) {
    console.error(`[EpisodePage] Error fetching episode data for slug/id "${slug}":`, JSON.stringify(episodeError, null, 2));
    notFound();
  }
  
  console.log(`[EpisodePage] Successfully fetched episode data.`);

  // Step 2: Fetch the reviews for this episode
  console.log(`[EpisodePage] Fetching reviews for episode ID: ${(episodeData as any).id}`);
  const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles ( display_name, avatar_url )
    `)
    .eq('target_id', (episodeData as any).id)
    .eq('target_table', 'episodes')
    .order('created_at', { ascending: false });

  if (reviewsError) {
    console.error(`[EpisodePage] Error fetching reviews for episode ID "${(episodeData as any).id}":`, JSON.stringify(reviewsError, null, 2));
    // Don't call notFound() here, an episode can exist without reviews
  }
  
  console.log(`[EpisodePage] Successfully fetched reviews.`);

  // Step 3: Combine the data
  const combinedData = {
    ...(episodeData as any),
    reviews: reviewsData || [],
  };

  console.log(`[EpisodePage] Successfully combined data for slug/id "${slug}":`, JSON.stringify(combinedData, null, 2));
  return combinedData as unknown as EpisodeWithPodcastAndReviews;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisode(slug);
  if (!episode) {
    return { title: 'Episode Not Found' };
  }

  const seo = episode.seo_metadata as any;

  return {
    title: seo?.meta_title || `${episode.title} - ${episode.podcasts?.title}`,
    description: seo?.meta_description || episode.description || `Listen to the episode "${episode.title}" from the podcast "${episode.podcasts?.title}".`,
    keywords: seo?.keywords || [],
  };
}

export default async function EpisodePage({ params }: Props) {
  const { slug } = await params;
  const episode = await getEpisode(slug);
  return <EpisodeClientPage episode={episode} />;
}
