import { Metadata } from 'next';
import { generateHomeSEOData, HomeSEOConfig } from '@/lib/home-seo-generator';
import HomePageClient from '../../HomePageClient';

export const dynamic = 'force-static';
export const revalidate = false;

interface FeatureCategoryPageProps {
  params: Promise<{ feature: string; category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  // Define the features and categories that should be statically generated
  const features = [
    'platform',
    'database', 
    'directory',
    'discovery',
    'analytics',
    'search',
    'browse',
    'explore',
    'find',
    'discover'
  ];

  const categories = [
    'technology',
    'business',
    'science',
    'health',
    'education',
    'entertainment',
    'news',
    'sports',
    'comedy',
    'politics',
    'culture',
    'lifestyle'
  ];

  const params = [];
  for (const feature of features) {
    for (const category of categories) {
      params.push({
        feature,
        category,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params, searchParams }: FeatureCategoryPageProps): Promise<Metadata> {
  const { feature, category } = await params;
  const searchParamsResolved = await searchParams;
  const config: HomeSEOConfig = {
    feature,
    category,
    type: (searchParamsResolved.type as 'platform' | 'database' | 'directory' | 'discovery' | 'analytics') || 'platform',
    language: searchParamsResolved.language as string,
    location: searchParamsResolved.location as string,
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
    console.error('Error generating feature category SEO metadata:', error);
    
    return {
      title: 'PodDB Pro - Biggest Podcast Database',
      description: 'Discover the world\'s largest podcast database with thousands of podcasts.',
    };
  }
}

export default async function FeatureCategoryPage({ params, searchParams }: FeatureCategoryPageProps) {
  const { feature, category } = await params;
  const searchParamsResolved = await searchParams;
  return <HomePageClient searchParams={searchParamsResolved} />;
}
