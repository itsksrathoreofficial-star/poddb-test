import { createServiceClient } from '@/integrations/supabase/service';

export interface SEOConfig {
  type: 'podcasts' | 'episodes';
  period: 'weekly' | 'monthly' | 'overall';
  category?: string;
  language?: string;
  location?: string;
  state?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  structuredData: any;
  breadcrumbs: Array<{ name: string; url: string }>;
}

// SEO title variations for different contexts
const TITLE_VARIATIONS = {
  best: ['Best', 'Top', 'Leading', 'Premier', 'Elite', 'Outstanding'],
  category: ['Podcasts', 'Shows', 'Series', 'Content', 'Programs'],
  period: {
    weekly: ['This Week', 'Weekly', 'Current Week', 'Latest'],
    monthly: ['This Month', 'Monthly', 'Current Month', 'Latest'],
    overall: ['All Time', 'Overall', 'Ever', 'All-Time', 'Historical']
  },
  location: ['in', 'from', 'based in', 'located in'],
  language: ['in', 'spoken in', 'available in']
};

// Generate dynamic SEO data based on filters
export async function generateSEOData(config: SEOConfig): Promise<SEOData> {
  const { type, period, category, language, location, state } = config;
  
  // Fetch relevant data for structured data
  const { data: rankings } = await fetchRankingsForSEO(config);
  const { data: categories } = await fetchCategories();
  const { data: languages } = await fetchLanguages();
  const { data: locations } = await fetchLocations();

  // Generate title
  const title = generateTitle(config, rankings?.length || 0);
  
  // Generate description
  const description = generateDescription(config, rankings?.length || 0, rankings);
  
  // Generate keywords
  const keywords = generateKeywords(config, categories || [], languages || [], locations || []);
  
  // Generate canonical URL
  const canonicalUrl = generateCanonicalUrl(config);
  
  // Generate structured data
  const structuredData = generateStructuredData(config, rankings || []);
  
  // Generate breadcrumbs
  const breadcrumbs = generateBreadcrumbs(config);

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    structuredData,
    breadcrumbs
  };
}

function generateTitle(config: SEOConfig, count: number): string {
  const { type, period, category, language, location, state } = config;
  
  let title = '';
  
  // Add ranking type
  const bestVariation = TITLE_VARIATIONS.best[Math.floor(Math.random() * TITLE_VARIATIONS.best.length)];
  const categoryVariation = TITLE_VARIATIONS.category[Math.floor(Math.random() * TITLE_VARIATIONS.category.length)];
  
  title += `${bestVariation} ${type === 'podcasts' ? categoryVariation : 'Episodes'}`;
  
  // Add category
  if (category && category !== 'all') {
    title += ` in ${category}`;
  }
  
  // Add language
  if (language && language !== 'all') {
    const langVariation = TITLE_VARIATIONS.language[Math.floor(Math.random() * TITLE_VARIATIONS.language.length)];
    title += ` ${langVariation} ${language}`;
  }
  
  // Add location
  if (location && location !== 'all') {
    const locVariation = TITLE_VARIATIONS.location[Math.floor(Math.random() * TITLE_VARIATIONS.location.length)];
    title += ` ${locVariation} ${location}`;
  }
  
  // Add state if specified
  if (state && state !== 'all') {
    title += `, ${state}`;
  }
  
  // Add period
  const periodVariation = TITLE_VARIATIONS.period[period][Math.floor(Math.random() * TITLE_VARIATIONS.period[period].length)];
  title += ` - ${periodVariation} Rankings`;
  
  // Add count if available
  if (count > 0) {
    title += ` (${count} ${type})`;
  }
  
  return title;
}

function generateDescription(config: SEOConfig, count: number, rankings: any[]): string {
  const { type, period, category, language, location, state } = config;
  
  let description = `Discover the ${period === 'overall' ? 'most popular' : `top performing`} ${type}`;
  
  if (category && category !== 'all') {
    description += ` in the ${category} category`;
  }
  
  if (language && language !== 'all') {
    description += ` available in ${language}`;
  }
  
  if (location && location !== 'all') {
    description += ` from ${location}`;
    if (state && state !== 'all') {
      description += `, ${state}`;
    }
  }
  
  description += `. Our ${period} rankings are based on real YouTube engagement data including views, likes, and comments. `;
  
  if (rankings && rankings.length > 0) {
    const topItem = rankings[0];
    description += `Currently leading: "${topItem.title}" with ${formatNumber(topItem.total_views || topItem.weekly_views || topItem.monthly_views)} views. `;
  }
  
  description += `Explore ${count > 0 ? count : 'hundreds of'} ${type} and find your next favorite show. Updated daily with fresh data.`;
  
  return description;
}

function generateKeywords(config: SEOConfig, categories: any[], languages: any[], locations: any[]): string[] {
  const { type, period, category, language, location, state } = config;
  
  const keywords = new Set<string>();
  
  // Base keywords
  keywords.add(type);
  keywords.add(`${type} rankings`);
  keywords.add(`${period} ${type} rankings`);
  keywords.add('podcast rankings');
  keywords.add('best podcasts');
  keywords.add('top podcasts');
  
  // Category keywords
  if (category && category !== 'all') {
    keywords.add(`${category} podcasts`);
    keywords.add(`best ${category} podcasts`);
    keywords.add(`top ${category} podcasts`);
    keywords.add(`${category} podcast rankings`);
  } else {
    // Add all categories as keywords
    categories.slice(0, 20).forEach(cat => {
      keywords.add(`${cat.category} podcasts`);
    });
  }
  
  // Language keywords
  if (language && language !== 'all') {
    keywords.add(`${language} podcasts`);
    keywords.add(`podcasts in ${language}`);
    keywords.add(`${language} podcast rankings`);
  } else {
    // Add all languages as keywords
    languages.slice(0, 10).forEach(lang => {
      keywords.add(`${lang.language} podcasts`);
    });
  }
  
  // Location keywords
  if (location && location !== 'all') {
    keywords.add(`podcasts in ${location}`);
    keywords.add(`${location} podcasts`);
    keywords.add(`best podcasts in ${location}`);
    if (state && state !== 'all') {
      keywords.add(`podcasts in ${state}`);
      keywords.add(`${state} podcasts`);
    }
  } else {
    // Add popular locations as keywords
    locations.slice(0, 15).forEach(loc => {
      keywords.add(`podcasts in ${loc.location}`);
    });
  }
  
  // Period-specific keywords
  keywords.add(`${period} trending podcasts`);
  keywords.add(`popular ${type} ${period}`);
  
  // Additional SEO keywords
  keywords.add('podcast discovery');
  keywords.add('podcast recommendations');
  keywords.add('youtube podcast data');
  keywords.add('podcast analytics');
  keywords.add('podcast statistics');
  
  return Array.from(keywords);
}

function generateCanonicalUrl(config: SEOConfig): string {
  const { type, period, category, language, location, state } = config;
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poddb.pro';
  let path = '/rankings';
  
  const params = new URLSearchParams();
  
  if (type !== 'podcasts') params.append('type', type);
  if (period !== 'weekly') params.append('period', period);
  if (category && category !== 'all') params.append('category', category);
  if (language && language !== 'all') params.append('language', language);
  if (location && location !== 'all') params.append('location', location);
  if (state && state !== 'all') params.append('state', state);
  
  const queryString = params.toString();
  if (queryString) {
    path += `?${queryString}`;
  }
  
  return `${baseUrl}${path}`;
}

function generateStructuredData(config: SEOConfig, rankings: any[]): any {
  const { type, period, category, language, location, state } = config;
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poddb.pro';
  
  // Main structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": generateTitle(config, rankings?.length || 0),
    "description": generateDescription(config, rankings?.length || 0, rankings),
    "url": generateCanonicalUrl(config),
    "numberOfItems": rankings?.length || 0,
    "itemListElement": rankings?.slice(0, 100).map((item, index) => ({
      "@type": type === 'podcasts' ? 'PodcastSeries' : 'Episode',
      "position": index + 1,
      "name": item.title,
      "description": item.description || `${item.title} - ${type === 'podcasts' ? 'Podcast' : 'Episode'}`,
      "url": `${baseUrl}/${type}/${item.slug}`,
      "image": item.cover_image_url || item.thumbnail_url,
      ...(type === 'podcasts' ? {
        "numberOfEpisodes": item.total_episodes,
        "aggregateRating": item.average_rating ? {
          "@type": "AggregateRating",
          "ratingValue": item.average_rating,
          "ratingCount": item.rating_count
        } : undefined
      } : {
        "partOfSeries": {
          "@type": "PodcastSeries",
          "name": item.podcast_title
        },
        "duration": item.duration ? `PT${Math.floor(item.duration / 60)}M${item.duration % 60}S` : undefined
      }),
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ViewAction",
          "userInteractionCount": item.total_views || item.views
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": item.total_likes || item.likes
        }
      ]
    })) || []
  };
  
  // Add breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": generateBreadcrumbs(config).map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  };
  
  // Add website structured data
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PodDB",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
  
  return [structuredData, breadcrumbStructuredData, websiteStructuredData];
}

function generateBreadcrumbs(config: SEOConfig): Array<{ name: string; url: string }> {
  const { type, period, category, language, location, state } = config;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poddb.pro';
  
  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Rankings', url: `${baseUrl}/rankings` }
  ];
  
  if (type !== 'podcasts') {
    breadcrumbs.push({ name: type.charAt(0).toUpperCase() + type.slice(1), url: `${baseUrl}/rankings?type=${type}` });
  }
  
  if (period !== 'weekly') {
    breadcrumbs.push({ name: period.charAt(0).toUpperCase() + period.slice(1), url: `${baseUrl}/rankings?type=${type}&period=${period}` });
  }
  
  if (category && category !== 'all') {
    breadcrumbs.push({ name: category, url: `${baseUrl}/rankings?type=${type}&period=${period}&category=${category}` });
  }
  
  if (language && language !== 'all') {
    breadcrumbs.push({ name: language, url: `${baseUrl}/rankings?type=${type}&period=${period}&category=${category}&language=${language}` });
  }
  
  if (location && location !== 'all') {
    breadcrumbs.push({ name: location, url: `${baseUrl}/rankings?type=${type}&period=${period}&category=${category}&language=${language}&location=${location}` });
  }
  
  if (state && state !== 'all') {
    breadcrumbs.push({ name: state, url: `${baseUrl}/rankings?type=${type}&period=${period}&category=${category}&language=${language}&location=${location}&state=${state}` });
  }
  
  return breadcrumbs;
}

// Helper functions
async function fetchRankingsForSEO(config: SEOConfig) {
  const { type, period, category, language, location, state } = config;
  
  const supabase = createServiceClient();
  let query = supabase
    .from(type)
    .select('*')
    .order('total_views', { ascending: false })
    .limit(100);
  
  if (category && category !== 'all') {
    query = query.contains('categories', [category]);
  }
  
  if (language && language !== 'all') {
    query = query.eq('language', language);
  }
  
  if (location && location !== 'all') {
    query = query.eq('location', location);
  }
  
  return await query;
}

async function fetchCategories() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('podcasts')
    .select('categories')
    .not('categories', 'is', null);
  
  const uniqueCategories = Array.from(
    new Set(data?.flatMap(item => item.categories || []) || [])
  ).map(category => ({ category }));
  
  return { data: uniqueCategories };
}

async function fetchLanguages() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('podcasts')
    .select('language')
    .not('language', 'is', null);
  
  const uniqueLanguages = Array.from(
    new Set(data?.map(item => item.language).filter(Boolean) || [])
  ).map(language => ({ language }));
  
  return { data: uniqueLanguages };
}

async function fetchLocations() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('podcasts')
    .select('location')
    .not('location', 'is', null);
  
  const uniqueLocations = Array.from(
    new Set(data?.map(item => item.location).filter(Boolean) || [])
  ).map(location => ({ location }));
  
  return { data: uniqueLocations };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Generate all possible SEO combinations
export async function generateAllSEOCombinations(): Promise<SEOConfig[]> {
  const { data: categories } = await fetchCategories();
  const { data: languages } = await fetchLanguages();
  const { data: locations } = await fetchLocations();
  
  const combinations: SEOConfig[] = [];
  
  const types: ('podcasts' | 'episodes')[] = ['podcasts', 'episodes'];
  const periods: ('weekly' | 'monthly' | 'overall')[] = ['weekly', 'monthly', 'overall'];
  
  // Base combinations (no filters)
  types.forEach(type => {
    periods.forEach(period => {
      combinations.push({ type, period });
    });
  });
  
  // Category combinations
  categories.slice(0, 50).forEach(cat => {
    types.forEach(type => {
      periods.forEach(period => {
        combinations.push({ type, period, category: cat.category });
      });
    });
  });
  
  // Language combinations
  languages.slice(0, 20).forEach(lang => {
    types.forEach(type => {
      periods.forEach(period => {
        combinations.push({ type, period, language: lang.language });
      });
    });
  });
  
  // Location combinations
  locations.slice(0, 30).forEach(loc => {
    types.forEach(type => {
      periods.forEach(period => {
        combinations.push({ type, period, location: loc.location });
      });
    });
  });
  
  // Category + Language combinations
  categories.slice(0, 20).forEach(cat => {
    languages.slice(0, 10).forEach(lang => {
      types.forEach(type => {
        periods.forEach(period => {
          combinations.push({ 
            type, 
            period, 
            category: cat.category, 
            language: lang.language 
          });
        });
      });
    });
  });
  
  // Category + Location combinations
  categories.slice(0, 20).forEach(cat => {
    locations.slice(0, 15).forEach(loc => {
      types.forEach(type => {
        periods.forEach(period => {
          combinations.push({ 
            type, 
            period, 
            category: cat.category, 
            location: loc.location 
          });
        });
      });
    });
  });
  
  // Language + Location combinations
  languages.slice(0, 10).forEach(lang => {
    locations.slice(0, 15).forEach(loc => {
      types.forEach(type => {
        periods.forEach(period => {
          combinations.push({ 
            type, 
            period, 
            language: lang.language, 
            location: loc.location 
          });
        });
      });
    });
  });
  
  return combinations;
}
