import { Metadata } from 'next';
import { generateSEOData, SEOConfig } from '@/lib/seo-generator';

interface RankingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug?: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: RankingsLayoutProps): Promise<Metadata> {
  // Add null check for searchParams
  const safeSearchParams = searchParams ? await searchParams : {};
  
  const config: SEOConfig = {
    type: (safeSearchParams.type as 'podcasts' | 'episodes') || 'podcasts',
    period: (safeSearchParams.period as 'weekly' | 'monthly' | 'overall') || 'weekly',
    category: safeSearchParams.category as string,
    language: safeSearchParams.language as string,
    location: safeSearchParams.location as string,
    state: safeSearchParams.state as string,
  };

  try {
    const seoData = await generateSEOData(config);
    
    return {
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords.join(', '),
      openGraph: {
        title: seoData.title,
        description: seoData.description,
        url: seoData.canonicalUrl,
        siteName: 'PodDB',
        type: 'website',
        images: [
          {
            url: '/og-rankings.jpg',
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
        images: ['/og-rankings.jpg'],
      },
      alternates: {
        canonical: seoData.canonicalUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error generating SEO metadata:', error);
    
    // Fallback metadata
    return {
      title: 'Podcast Rankings - PodDB',
      description: 'Discover the most popular podcasts based on real YouTube engagement data. Find top podcasts by category, language, location, and time period.',
      keywords: 'podcast rankings, best podcasts, top podcasts, podcast discovery, youtube podcast data',
    };
  }
}

export default function RankingsLayout({ children }: RankingsLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
