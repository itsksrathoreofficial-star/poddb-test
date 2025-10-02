import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateSEOData, SEOConfig } from '@/lib/seo-generator';
import { createServiceClient } from '@/integrations/supabase/service';

export const dynamic = 'force-static';
export const revalidate = false;

interface CategoryLanguagePageProps {
  params: Promise<{ category: string; language: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: CategoryLanguagePageProps): Promise<Metadata> {
  const { category, language } = await params;
  const searchParamsResolved = await searchParams;
  
  // Verify combination exists
  const supabase = createServiceClient();
  const { data: exists } = await supabase
    .from('podcasts')
    .select('id')
    .contains('categories', [category])
    .eq('language', language)
    .limit(1);
  
  if (!exists || exists.length === 0) {
    return {
      title: 'Content Not Found - PodDB',
      description: 'The requested podcast category and language combination was not found.',
    };
  }
  
  const config: SEOConfig = {
    type: ((searchParamsResolved.type as string) || 'podcasts') as 'episodes' | 'podcasts',
    period: ((searchParamsResolved.period as string) || 'weekly') as 'overall' | 'weekly' | 'monthly',
    category: category,
    language: language,
    location: searchParamsResolved.location as string,
    state: searchParamsResolved.state as string,
  };

  try {
    const seoData = await generateSEOData(config);
    
    return {
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords.join(', '),
      alternates: {
        canonical: seoData.canonicalUrl,
      },
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
    };
  } catch (error) {
    console.error('Error generating SEO metadata:', error);
    
    return {
      title: `Best ${category} Podcasts in ${language} - PodDB`,
      description: `Discover the top ${category} podcasts in ${language} based on real YouTube engagement data. Find the best ${language} ${category} shows ranked by views, likes, and comments.`,
      keywords: `${category} podcasts in ${language}, best ${category} podcasts ${language}, top ${language} ${category} podcasts, ${category} podcast rankings ${language}`,
    };
  }
}

export async function generateStaticParams() {
  try {
    const supabase = createServiceClient();
    const { data: combinations } = await supabase
      .from('podcasts')
      .select('categories, language')
      .not('categories', 'is', null)
      .not('language', 'is', null);
    
    const uniqueCombinations = new Set<string>();
    
    combinations?.forEach(item => {
      item.categories?.forEach((category: string) => {
        if (item.language) {
          uniqueCombinations.add(`${category}-${item.language}`);
        }
      });
    });
    
    return Array.from(uniqueCombinations).slice(0, 200).map((combination) => {
      const [category, language] = combination.split('-');
      return {
        category: category,
        language: language,
      };
    });
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function CategoryLanguagePage({ params, searchParams }: CategoryLanguagePageProps) {
  const resolvedSearchParams = await searchParams;
  // Set the filters from URL
  const newSearchParams = new URLSearchParams();
  
  // Preserve existing search params
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      newSearchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });
  
  // Set filters from URL
  const { category, language } = await params;
  newSearchParams.set('category', category);
  newSearchParams.set('language', language);
  
  // Redirect to main rankings page with filters
  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.location.replace('/rankings?${newSearchParams.toString()}');
          `,
        }}
      />
    </div>
  );
}
