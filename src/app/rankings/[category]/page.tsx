import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RankingsContent from '../page';
import { generateSEOData, SEOConfig } from '@/lib/seo-generator';
import { createServiceClient } from '@/integrations/supabase/service';

export const dynamic = 'force-static';
export const revalidate = false;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const searchParamsResolved = await searchParams;
  
  // Verify category exists
  const supabase = createServiceClient();
  const { data: categoryExists } = await supabase
    .from('podcasts')
    .select('categories')
    .contains('categories', [category])
    .limit(1);
  
  if (!categoryExists || categoryExists.length === 0) {
    return {
      title: 'Category Not Found - PodDB',
      description: 'The requested podcast category was not found.',
    };
  }
  
  const config: SEOConfig = {
    type: ((searchParamsResolved.type as string) || 'podcasts') as 'episodes' | 'podcasts',
    period: ((searchParamsResolved.period as string) || 'weekly') as 'overall' | 'weekly' | 'monthly',
    category: category,
    language: searchParamsResolved.language as string,
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
      title: `Best ${category} Podcasts - PodDB`,
      description: `Discover the top ${category} podcasts based on real YouTube engagement data. Find the best ${category} shows ranked by views, likes, and comments.`,
      keywords: `${category} podcasts, best ${category} podcasts, top ${category} podcasts, ${category} podcast rankings`,
    };
  }
}

export async function generateStaticParams() {
  try {
    const supabase = createServiceClient();
    const { data: categories } = await supabase
      .from('podcasts')
      .select('categories')
      .not('categories', 'is', null);
    
    const uniqueCategories = Array.from(
      new Set(categories?.flatMap(item => item.categories || []) || [])
    );
    
    return uniqueCategories.slice(0, 100).map((category) => ({
      category: category,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedSearchParams = await searchParams;
  // Set the category filter from URL
  const newSearchParams = new URLSearchParams();
  
  // Preserve existing search params
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      newSearchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });
  
  // Set category from URL
  const { category } = await params;
  newSearchParams.set('category', category);
  
  // Redirect to main rankings page with category filter
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
