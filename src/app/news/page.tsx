import React from 'react';
import { createClient } from '@/integrations/supabase/server';
import { Metadata } from 'next';
import StaticNewsPage from './StaticNewsPage';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  author_name: string | null;
  author_bio: string | null;
  author_photo_url: string | null;
  published_at: string | null;
  tags: string[] | null;
  category: string | null;
  featured_image_url: string | null;
  reading_time: number | null;
  seo_score: number | null;
  featured: boolean | null;
  social_title: string | null;
  social_description: string | null;
  social_image_url: string | null;
  profiles: { display_name: string }[] | null;
}

// Enable static generation
export const dynamic = 'force-static';
export const revalidate = false; // Fully static, no revalidation

// Pre-fetch news data at build time
async function getNewsData() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          id,
          title,
          excerpt,
          slug,
          author_name,
          author_bio,
          author_photo_url,
          published_at,
          tags,
          category,
          featured_image_url,
          reading_time,
          seo_score,
          featured,
          social_title,
          social_description,
          social_image_url,
          profiles ( display_name )
        `)
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (error) {
      console.warn('Warning: Could not fetch news data during build:', error.message);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.warn('Warning: Could not fetch news data during build:', error.message);
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Podcast News - PodDB Pro',
    description: 'Stay updated with the latest trends, insights, and updates from the podcasting world. Expert analysis, industry news, and exclusive content.',
    keywords: 'podcast news, podcast industry, podcast trends, podcast updates, podcasting news',
    openGraph: {
      title: 'Podcast News - PodDB Pro',
      description: 'Stay updated with the latest trends, insights, and updates from the podcasting world.',
      type: 'website',
      url: 'https://poddb.pro/news',
      images: [
        {
          url: '/og-news.jpg',
          width: 1200,
          height: 630,
          alt: 'Podcast News - PodDB Pro',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Podcast News - PodDB Pro',
      description: 'Stay updated with the latest trends, insights, and updates from the podcasting world.',
      images: ['/og-news.jpg'],
    },
    alternates: {
      canonical: 'https://poddb.pro/news',
    },
  };
}

export default async function NewsPage() {
  const articles = await getNewsData();

  return <StaticNewsPage articles={articles as any} />;
}
