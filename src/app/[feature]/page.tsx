import { Metadata } from 'next';
import { generateHomeSEOData, HomeSEOConfig } from '@/lib/home-seo-generator';
import HomePageClient from '../HomePageClient';

interface FeaturePageProps {
  params: Promise<{ feature: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: FeaturePageProps): Promise<Metadata> {
  const { feature } = await params;
  const searchParamsResolved = await searchParams;
  const config: HomeSEOConfig = {
    feature,
    type: (searchParamsResolved.type as 'platform' | 'database' | 'directory' | 'discovery' | 'analytics') || 'platform',
    category: searchParamsResolved.category as string,
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
    console.error('Error generating feature SEO metadata:', error);
    
    return {
      title: 'PodDB Pro - Biggest Podcast Database',
      description: 'Discover the world\'s largest podcast database with thousands of podcasts.',
    };
  }
}

export default async function FeaturePage({ params, searchParams }: FeaturePageProps) {
  const { feature } = await params;
  const searchParamsResolved = await searchParams;
  return <HomePageClient searchParams={searchParamsResolved} />;
}
