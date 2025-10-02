
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/integrations/supabase/server';
import StaticExplorePage from './StaticExplorePage';

// Enable static generation
export const dynamic = 'force-static';
export const revalidate = false; // Fully static, no revalidation

// Pre-fetch explore page data at build time
async function getExplorePageData() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Try to fetch carousel items separately (handle permission errors gracefully)
    let carouselData = [];
    try {
      const { data, error: carouselError } = await supabase
        .from('explore_carousel')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true });

      if (carouselError) {
        console.warn('Carousel table not accessible:', carouselError.message);
        carouselData = [
          {
            id: 'fallback-1',
            title: 'Welcome to PodDB',
            description: 'Discover amazing podcasts and episodes',
            image_url: '/hero-bg.jpeg',
            redirect_link: '/explore'
          }
        ];
      } else {
        carouselData = data || [];
        if (carouselData.length === 0) {
          carouselData = [
            {
              id: 'fallback-1',
              title: 'Welcome to PodDB',
              description: 'Discover amazing podcasts and episodes',
              image_url: '/hero-bg.jpeg',
              redirect_link: '/explore'
            }
          ];
        }
      }
    } catch (carouselError) {
      console.warn('Carousel table not accessible:', carouselError);
      carouselData = [
        {
          id: 'fallback-1',
          title: 'Welcome to PodDB',
          description: 'Discover amazing podcasts and episodes',
          image_url: '/hero-bg.jpeg',
          redirect_link: '/explore'
        }
      ];
    }

    // Fetch data directly from tables for static generation
    const [podcastsResult, episodesResult, peopleResult] = await Promise.all([
      supabase.from('podcasts')
        .select('id, slug, title, description, cover_image_url, total_episodes, total_views, total_likes, categories, average_duration, last_episode_date, average_rating, rating_count, is_verified')
        .eq('submission_status', 'approved')
        .order('total_views', { ascending: false })
        .limit(8),
      supabase.from('episodes')
        .select('id, slug, title, thumbnail_url, duration, published_at, podcasts(title, cover_image_url, is_verified)')
        .eq('podcasts.submission_status', 'approved')
        .order('published_at', { ascending: false })
        .limit(8),
      supabase.from('people')
        .select('id, slug, full_name, photo_urls, total_appearances, is_verified')
        .order('created_at', { ascending: false })
        .limit(12)
    ]);

    return {
      top_podcasts: podcastsResult.data || [],
      latest_episodes: episodesResult.data || [],
      featured_people: peopleResult.data || [],
      carouselItems: carouselData
    };
  } catch (error: any) {
    console.warn('Warning: Could not fetch explore page data during build:', error.message);
    return {
      top_podcasts: [],
      latest_episodes: [],
      featured_people: [],
      carouselItems: [
        {
          id: 'fallback-1',
          title: 'Welcome to PodDB',
          description: 'Discover amazing podcasts and episodes',
          image_url: '/hero-bg.jpeg',
          redirect_link: '/explore'
        }
      ]
    };
  }
}

export default async function ExplorePage() {
  const exploreData = await getExplorePageData();

  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4 space-y-16">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading explore page...</span>
          </div>
        </div>
      </div>
    }>
      <StaticExplorePage data={exploreData} />
    </Suspense>
  );
}
