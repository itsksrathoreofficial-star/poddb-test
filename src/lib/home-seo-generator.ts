import { supabaseServer } from '@/integrations/supabase/server-client';

export interface HomeSEOConfig {
  type?: 'platform' | 'database' | 'directory' | 'discovery' | 'analytics';
  category?: string;
  language?: string;
  location?: string;
  feature?: string;
}

export interface HomeSEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  structuredData: any;
}

// Home page SEO combinations
const HOME_SEO_COMBINATIONS = {
  types: ['platform', 'database', 'directory', 'discovery', 'analytics'] as const,
  features: ['imdb', 'house', 'biggest', 'largest', 'best', 'top', 'ultimate', 'premier', 'leading'],
  categories: [
    'business', 'technology', 'education', 'health', 'entertainment', 'news', 'sports', 
    'comedy', 'science', 'history', 'culture', 'lifestyle', 'finance', 'politics', 
    'religion', 'arts', 'music', 'film', 'books', 'travel', 'food', 'fitness', 
    'parenting', 'relationships', 'self-help', 'motivation', 'career', 'marketing', 
    'entrepreneurship', 'investing', 'real-estate', 'cryptocurrency', 'gaming', 
    'anime', 'manga', 'fashion', 'beauty', 'home', 'gardening', 'pets', 'nature'
  ],
  languages: [
    'english', 'hindi', 'spanish', 'french', 'german', 'italian', 'portuguese', 
    'russian', 'chinese', 'japanese', 'korean', 'arabic', 'dutch', 'swedish', 
    'norwegian', 'danish', 'finnish', 'polish', 'czech', 'hungarian', 'romanian', 
    'bulgarian', 'croatian', 'serbian', 'slovak', 'slovenian', 'estonian', 
    'latvian', 'lithuanian', 'greek', 'turkish', 'hebrew', 'persian', 'urdu', 
    'bengali', 'tamil', 'telugu', 'marathi', 'gujarati', 'kannada', 'malayalam', 
    'punjabi', 'odia', 'assamese', 'nepali', 'sinhala', 'thai', 'vietnamese', 
    'indonesian', 'malay', 'filipino', 'swahili', 'yoruba', 'igbo', 'hausa'
  ],
  locations: [
    'worldwide', 'global', 'international', 'usa', 'united-states', 'canada', 
    'united-kingdom', 'uk', 'australia', 'new-zealand', 'india', 'china', 
    'japan', 'south-korea', 'singapore', 'malaysia', 'thailand', 'philippines', 
    'indonesia', 'vietnam', 'germany', 'france', 'italy', 'spain', 'netherlands', 
    'belgium', 'switzerland', 'austria', 'sweden', 'norway', 'denmark', 'finland', 
    'poland', 'czech-republic', 'hungary', 'romania', 'bulgaria', 'croatia', 
    'serbia', 'slovakia', 'slovenia', 'estonia', 'latvia', 'lithuania', 'greece', 
    'turkey', 'israel', 'saudi-arabia', 'uae', 'south-africa', 'nigeria', 
    'kenya', 'egypt', 'morocco', 'brazil', 'argentina', 'chile', 'colombia', 
    'mexico', 'peru', 'venezuela', 'russia', 'ukraine', 'belarus', 'kazakhstan'
  ]
};

export async function generateHomeSEOData(config: HomeSEOConfig): Promise<HomeSEOData> {
  const { type = 'platform', category, language, location, feature } = config;
  
  // Generate dynamic title based on parameters
  let title = 'PodDB Pro';
  let description = 'Discover the world\'s largest podcast database with thousands of podcasts.';
  let keywords = ['podcast', 'podcast database', 'podcast platform', 'podcast directory'];
  
  // Build title based on parameters
  if (feature) {
    const featureMap: Record<string, string> = {
      'imdb': 'IMDB for Podcasts',
      'house': 'House of Podcasts', 
      'biggest': 'Biggest Podcast Database',
      'largest': 'Largest Podcast Database',
      'best': 'Best Podcast Platform',
      'top': 'Top Podcast Database',
      'ultimate': 'Ultimate Podcast Platform',
      'premier': 'Premier Podcast Database',
      'leading': 'Leading Podcast Platform'
    };
    title = `${featureMap[feature] || feature} - PodDB Pro`;
  } else if (type) {
    const typeMap: Record<string, string> = {
      'platform': 'Podcast Platform',
      'database': 'Podcast Database', 
      'directory': 'Podcast Directory',
      'discovery': 'Podcast Discovery',
      'analytics': 'Podcast Analytics'
    };
    title = `${typeMap[type]} - PodDB Pro`;
  }
  
  // Add category to title
  if (category) {
    title = `${title} for ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    keywords.push(`${category} podcast`, `${category} podcast database`);
  }
  
  // Add language to title
  if (language) {
    title = `${title} in ${language.charAt(0).toUpperCase() + language.slice(1)}`;
    keywords.push(`${language} podcast`, `${language} podcast database`);
  }
  
  // Add location to title
  if (location) {
    const locationName = location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    title = `${title} in ${locationName}`;
    keywords.push(`podcast in ${location}`, `podcast database ${location}`);
  }
  
  // Generate description
  description = `Discover ${title.toLowerCase()}. Search, explore, and analyze podcasts with PodDB Pro - the leading podcast discovery and analytics platform.`;
  
  // Add more keywords
  keywords.push(
    'podcast search', 'podcast discovery', 'podcast analytics', 'podcast statistics',
    'podcast creators', 'podcast episodes', 'audio content', 'podcast recommendations',
    'podcast industry', 'podcast metadata', 'podcast relationships', 'podcast network'
  );
  
  // Generate canonical URL
  let canonicalUrl = 'https://poddb.pro';
  const params = new URLSearchParams();
  
  if (type && type !== 'platform') params.append('type', type);
  if (category) params.append('category', category);
  if (language) params.append('language', language);
  if (location) params.append('location', location);
  if (feature) params.append('feature', feature);
  
  if (params.toString()) {
    canonicalUrl += `?${params.toString()}`;
  }
  
  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": title,
    "url": canonicalUrl,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://poddb.pro/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Podcast Database",
      "description": description,
      "numberOfItems": "10000+"
    }
  };
  
  return {
    title,
    description,
    keywords,
    canonicalUrl,
    structuredData
  };
}

export async function generateHomeSEOCombinations(): Promise<Array<{url: string, title: string, description: string, priority: number}>> {
  const combinations: Array<{url: string, title: string, description: string, priority: number}> = [];
  
  // Base combinations (type-based)
  for (const type of HOME_SEO_COMBINATIONS.types) {
    const config: HomeSEOConfig = { type };
    const seoData = await generateHomeSEOData(config);
    combinations.push({
      url: seoData.canonicalUrl,
      title: seoData.title,
      description: seoData.description,
      priority: 0.9
    });
  }
  
  // Feature combinations
  for (const feature of HOME_SEO_COMBINATIONS.features) {
    const config: HomeSEOConfig = { feature };
    const seoData = await generateHomeSEOData(config);
    combinations.push({
      url: seoData.canonicalUrl,
      title: seoData.title,
      description: seoData.description,
      priority: 0.9
    });
  }
  
  // Category combinations (top 20 categories)
  const topCategories = HOME_SEO_COMBINATIONS.categories.slice(0, 20);
  for (const category of topCategories) {
    for (const type of HOME_SEO_COMBINATIONS.types) {
      const config: HomeSEOConfig = { type, category };
      const seoData = await generateHomeSEOData(config);
      combinations.push({
        url: seoData.canonicalUrl,
        title: seoData.title,
        description: seoData.description,
        priority: 0.8
      });
    }
  }
  
  // Language combinations (top 15 languages)
  const topLanguages = HOME_SEO_COMBINATIONS.languages.slice(0, 15);
  for (const language of topLanguages) {
    for (const type of HOME_SEO_COMBINATIONS.types) {
      const config: HomeSEOConfig = { type, language };
      const seoData = await generateHomeSEOData(config);
      combinations.push({
        url: seoData.canonicalUrl,
        title: seoData.title,
        description: seoData.description,
        priority: 0.8
      });
    }
  }
  
  // Location combinations (top 20 locations)
  const topLocations = HOME_SEO_COMBINATIONS.locations.slice(0, 20);
  for (const location of topLocations) {
    for (const type of HOME_SEO_COMBINATIONS.types) {
      const config: HomeSEOConfig = { type, location };
      const seoData = await generateHomeSEOData(config);
      combinations.push({
        url: seoData.canonicalUrl,
        title: seoData.title,
        description: seoData.description,
        priority: 0.8
      });
    }
  }
  
  // Feature + Category combinations (top 10 each)
  const topFeatures = HOME_SEO_COMBINATIONS.features.slice(0, 10);
  const topCategoriesForFeature = HOME_SEO_COMBINATIONS.categories.slice(0, 10);
  for (const feature of topFeatures) {
    for (const category of topCategoriesForFeature) {
      const config: HomeSEOConfig = { feature, category };
      const seoData = await generateHomeSEOData(config);
      combinations.push({
        url: seoData.canonicalUrl,
        title: seoData.title,
        description: seoData.description,
        priority: 0.7
      });
    }
  }
  
  return combinations;
}
