import { Metadata } from 'next';
import { generateHomeSEOData, HomeSEOConfig } from '@/lib/home-seo-generator';
import StaticHomePage from './StaticHomePage';
import { createClient } from '@/integrations/supabase/server';

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Enable static generation
export const dynamic = 'force-static';
export const revalidate = false; // Fully static, no revalidation

// Pre-generate static params for common search params
export async function generateStaticParams() {
  const commonParams = [
    { type: 'platform' },
    { type: 'database' },
    { type: 'directory' },
    { type: 'discovery' },
    { type: 'analytics' },
  ];
  
  return commonParams;
}

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const searchParamsResolved = await searchParams;
  const config: HomeSEOConfig = {
    type: (searchParamsResolved.type as 'platform' | 'database' | 'directory' | 'discovery' | 'analytics') || 'platform',
    category: searchParamsResolved.category as string,
    language: searchParamsResolved.language as string,
    location: searchParamsResolved.location as string,
    feature: searchParamsResolved.feature as string,
  };

  try {
    const seoData = await generateHomeSEOData(config);
    
    return {
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords.join(', '),
      openGraph: {
        title: seoData.title,
        description: seoData.description,
        url: seoData.canonicalUrl,
        siteName: 'PodDB Pro',
        type: 'website',
        images: [
          {
            url: '/og-home.jpg',
            width: 1200,
            height: 630,
            alt: seoData.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: seoData.title,
        description: seoData.description,
        images: ['/og-home.jpg'],
      },
      alternates: {
        canonical: seoData.canonicalUrl,
      },
    };
  } catch (error) {
    console.error('Error generating home SEO metadata:', error);
    
    return {
      title: 'PodDB Pro - Biggest Podcast Database',
      description: 'Discover the world\'s largest podcast database with thousands of podcasts.',
    };
  }
}

// Pre-fetch homepage data at build time
async function getHomepageData() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Fetch data directly from tables for static generation
    const [podcastsResult, episodesResult, peopleResult, categoriesResult, newsResult] = await Promise.all([
      supabase.from('podcasts')
        .select('id, slug, title, description, cover_image_url, total_episodes, total_views, total_likes, categories, average_duration, last_episode_date, average_rating, rating_count, is_verified')
        .eq('submission_status', 'approved')
        .order('total_views', { ascending: false })
        .limit(8),
        supabase.from('episodes')
          .select('id, slug, title, thumbnail_url, duration, published_at, podcast_id, podcasts(title, cover_image_url, is_verified)')
          .eq('podcasts.submission_status', 'approved')
          .order('published_at', { ascending: false })
          .limit(8),
      supabase.from('people')
        .select('id, slug, full_name, photo_urls, total_appearances, is_verified')
        .order('created_at', { ascending: false })
        .limit(12),
      supabase.from('categories')
        .select('category')
        .limit(10),
      supabase.from('news_articles')
        .select('id, title, slug, excerpt, featured_image_url, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3)
    ]);
    
    return {
      top_podcasts: podcastsResult.data || [],
      latest_episodes: (episodesResult.data || []).map(episode => ({
        ...episode,
        podcast_id: episode.podcast_id || '',
        podcast_title: episode.podcasts?.[0]?.title || '',
        podcast_cover: episode.podcasts?.[0]?.cover_image_url || '',
        podcasts: episode.podcasts
      })),
      featured_people: peopleResult.data || [],
      categories: categoriesResult.data || [],
      latest_news: newsResult.data || []
    };
  } catch (error: any) {
    console.warn('Warning: Could not fetch homepage data during build:', error.message);
    return {
      top_podcasts: [],
      latest_episodes: [],
      featured_people: [],
      categories: [],
      latest_news: []
    };
  }
}

export default async function Home({ searchParams }: HomePageProps) {
  // Pre-fetch data at build time for better performance
  const homepageData = await getHomepageData();
  const searchParamsResolved = await searchParams;
  
  return <StaticHomePage searchParams={searchParamsResolved} data={homepageData} />;
}