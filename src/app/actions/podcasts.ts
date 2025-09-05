"use server";

import { supabase } from '@/integrations/supabase/client';
import { notFound } from 'next/navigation';
import type { Tables } from '@/integrations/supabase/types';

export type PodcastWithEpisodesAndReviews = Tables<'podcasts'> & {
  episodes: (Tables<'episodes'> & { slug?: string })[];
  reviews: (Tables<'reviews'> & { profiles: Tables<'profiles'> | null })[];
  team_members: any[];
  language: string;
  category: string;
  social_links: { [key: string]: string };
  official_website: string | null;
  platform_links: { [key: string]: string };
};

export async function getPodcast(slug: string): Promise<PodcastWithEpisodesAndReviews> {
  console.log(`[getPodcast Action] Fetching data for slug: ${slug}`);
  
  const { data, error } = await supabase.rpc('get_podcast_details_by_slug' as any, { p_slug: slug } as any);
    
  if (error) {
    console.error(`[getPodcast Action] Supabase RPC error for slug "${slug}":`, JSON.stringify(error, null, 2));
    notFound();
  }

  if (!data) {
    console.error(`[getPodcast Action] No data returned for slug "${slug}". Triggering 404.`);
    notFound();
  }
  
  console.log(`[getPodcast Action] Successfully fetched data for slug "${slug}":`, JSON.stringify(data, null, 2));
  return data as unknown as PodcastWithEpisodesAndReviews;
}

export async function getPodcastById(id: string): Promise<PodcastWithEpisodesAndReviews> {
  console.log(`[getPodcastById Action] Fetching data for ID: ${id}`);
  
  // First try to get by slug if the ID is actually a slug
  const { data: slugData, error: slugError } = await supabase.rpc('get_podcast_details_by_slug' as any, { p_slug: id } as any);
  
  if (!slugError && slugData) {
    console.log(`[getPodcastById Action] Found by slug "${id}":`, JSON.stringify(slugData, null, 2));
    return slugData as unknown as PodcastWithEpisodesAndReviews;
  }
  
  // If not found by slug, try to get by ID
  const { data, error } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes (
        id,
        title,
        description,
        youtube_url,
        youtube_video_id,
        thumbnail_url,
        duration,
        published_at,
        views,
        likes,
        comments,
        slug
      )
    `)
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`[getPodcastById Action] Supabase error for ID "${id}":`, JSON.stringify(error, null, 2));
    notFound();
  }

  if (!data) {
    console.error(`[getPodcastById Action] No data returned for ID "${id}". Triggering 404.`);
    notFound();
  }

  // Fetch reviews separately since there's no direct relationship
  const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      review_title,
      review_text,
      created_at,
      upvotes,
      downvotes,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('target_id', (data as any).id)
    .eq('target_table', 'podcasts');

  if (reviewsError) {
    console.error(`[getPodcastById Action] Error fetching reviews for ID "${id}":`, JSON.stringify(reviewsError, null, 2));
    // Don't fail if reviews can't be fetched
  }

  // Fetch team members separately since there's no direct relationship
  const { data: teamData, error: teamError } = await supabase
    .from('team_members')
    .select(`
      id,
      full_name,
      bio,
      photo_urls,
      social_links,
      is_verified,
      role
    `)
    .eq('podcast_id', (data as any).id);

  if (teamError) {
    console.error(`[getPodcastById Action] Error fetching team members for ID "${id}":`, JSON.stringify(teamError, null, 2));
    // Don't fail if team members can't be fetched
  }

  // Add reviews and team members to the data
  const podcastWithReviews = {
    ...(data as any),
    reviews: reviewsData || [],
    team_members: teamData || []
  };
  
  console.log(`[getPodcastById Action] Successfully fetched data for ID "${id}":`, JSON.stringify(podcastWithReviews, null, 2));
  return podcastWithReviews as unknown as PodcastWithEpisodesAndReviews;
}