
// =================================================================================================
// DEVELOPER NOTICE
// =================================================================================================
// This page fetches its data from the `get_podcast_details_by_slug` Supabase RPC function.
// If you need to modify the data fetching logic, please update the corresponding SQL function
// in `supabase/migrations/20250828230000_fix_get_podcast_details_by_slug_function.sql`
// and document your changes here.
//
// The function returns a JSONB object with the following structure:
// {
//   "id": "uuid",
//   "title": "text",
//   "description": "text",
//   "cover_image_url": "text",
//   "total_episodes": "integer",
//   "total_views": "integer",
//   "total_likes": "integer",
//   "categories": "text[]",
//   "average_duration": "integer",
//   "last_episode_date": "date",
//   "team_members": [
//     {
//       "role": "text",
//       "id": "uuid",
//       "full_name": "text",
//       "bio": "text",
//       "photo_urls": "text[]",
//       "social_links": "jsonb",
//       "is_verified": "boolean"
//     }
//   ],
//   "episodes": [
//     {
//       "id": "uuid",
//       "title": "text",
//       "youtube_url": "text",
//       "youtube_video_id": "text",
//       "thumbnail_url": "text",
//       "duration": "integer",
//       "published_at": "timestamp",
//       "views": "integer",
//       "likes": "integer",
//       "comments": "integer",
//       "slug": "text"
//     }
//   ],
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

import { Metadata } from 'next';
import PodcastClientPage from './PodcastClientPage';
import { getPodcast, PodcastWithEpisodesAndReviews } from '@/app/actions/podcasts';
import { supabase } from '@/integrations/supabase/client';

export const dynamicParams = false; // Only pre-rendered pages allowed
export const revalidate = false; // Fully static, no revalidation

type Props = {
  params: Promise<{ slug: string }>;
};

// This function tells Next.js which slugs to pre-render at build time.
export async function generateStaticParams() {
  // Fetch a limited number of approved podcasts with valid slugs
  const { data: podcasts } = await supabase
    .from('podcasts')
    .select('slug')
    .eq('submission_status', 'approved')
    .not('slug', 'is', null)
    .limit(1000); // Adjust limit as needed

  return podcasts?.map(({ slug }) => ({
    slug: slug!,
  })) || [];
}


// Generate SEO metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const podcast = await getPodcast(slug); 
  
  if (!podcast) {
    return {
      title: 'Podcast Not Found',
    };
  }

  const seo = podcast.seo_metadata as any;

  return {
    title: seo?.meta_title || podcast.title,
    description: seo?.meta_description || podcast.description,
    keywords: seo?.keywords || podcast.categories || [],
    openGraph: {
        title: seo?.meta_title || podcast.title,
        description: seo?.meta_description || podcast.description || '',
        images: [
            {
                url: podcast.cover_image_url || '/placeholder.svg',
                width: 1200,
                height: 630,
                alt: podcast.title,
            },
        ],
    },
  };
}

// The main page component
export default async function PodcastPage({ params }: Props) {
  const { slug } = await params;
  const podcast = await getPodcast(slug);
  return <PodcastClientPage podcast={podcast} />;
}
