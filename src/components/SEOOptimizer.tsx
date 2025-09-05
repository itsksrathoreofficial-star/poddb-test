'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SEOOptimizerProps {
  config: {
    type: 'podcasts' | 'episodes';
    period: 'weekly' | 'monthly' | 'overall';
    category?: string;
    language?: string;
    location?: string;
    state?: string;
  };
  rankings: any[];
}

export default function SEOOptimizer({ config, rankings }: SEOOptimizerProps) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Update page title dynamically
    const title = generateDynamicTitle(config, rankings.length);
    document.title = title;
    
    // Update meta description
    const description = generateDynamicDescription(config, rankings.length, rankings);
    updateMetaTag('description', description);
    
    // Update meta keywords
    const keywords = generateDynamicKeywords(config);
    updateMetaTag('keywords', keywords.join(', '));
    
    // Update canonical URL
    const canonicalUrl = generateCanonicalUrl(config);
    updateCanonicalUrl(canonicalUrl);
    
    // Update Open Graph tags
    updateOpenGraphTags(config, title, description, canonicalUrl);
    
    // Update Twitter Card tags
    updateTwitterCardTags(config, title, description);
    
    // Add breadcrumb structured data
    addBreadcrumbStructuredData(config);
    
    // Add ranking structured data
    addRankingStructuredData(config, rankings);
    
  }, [config, rankings, searchParams]);
  
  return null;
}

function generateDynamicTitle(config: any, count: number): string {
  const { type, period, category, language, location, state } = config;
  
  const titleVariations = {
    best: ['Best', 'Top', 'Leading', 'Premier', 'Elite', 'Outstanding'],
    category: ['Podcasts', 'Shows', 'Series', 'Content', 'Programs'],
    period: {
      weekly: ['This Week', 'Weekly', 'Current Week', 'Latest'],
      monthly: ['This Month', 'Monthly', 'Current Month', 'Latest'],
      overall: ['All Time', 'Overall', 'Ever', 'All-Time', 'Historical']
    }
  };
  
  let title = '';
  
  const best = titleVariations.best[Math.floor(Math.random() * titleVariations.best.length)];
  const categoryType = titleVariations.category[Math.floor(Math.random() * titleVariations.category.length)];
  const periodType = titleVariations.period[period as keyof typeof titleVariations.period][Math.floor(Math.random() * titleVariations.period[period as keyof typeof titleVariations.period].length)];
  
  title += `${best} ${type === 'podcasts' ? categoryType : 'Episodes'}`;
  
  if (category && category !== 'all') {
    title += ` in ${category}`;
  }
  
  if (language && language !== 'all') {
    title += ` in ${language}`;
  }
  
  if (location && location !== 'all') {
    title += ` from ${location}`;
    if (state && state !== 'all') {
      title += `, ${state}`;
    }
  }
  
  title += ` - ${periodType} Rankings`;
  
  if (count > 0) {
    title += ` (${count} ${type})`;
  }
  
  return title;
}

function generateDynamicDescription(config: any, count: number, rankings: any[]): string {
  const { type, period, category, language, location, state } = config;
  
  let description = `Discover the ${period === 'overall' ? 'most popular' : 'top performing'} ${type}`;
  
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
    const views = topItem.total_views || topItem.weekly_views || topItem.monthly_views || 0;
    description += `Currently leading: "${topItem.title}" with ${formatNumber(views)} views. `;
  }
  
  description += `Explore ${count > 0 ? count : 'hundreds of'} ${type} and find your next favorite show. Updated daily with fresh data.`;
  
  return description;
}

function generateDynamicKeywords(config: any): string[] {
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
  }
  
  // Language keywords
  if (language && language !== 'all') {
    keywords.add(`${language} podcasts`);
    keywords.add(`podcasts in ${language}`);
    keywords.add(`${language} podcast rankings`);
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

function generateCanonicalUrl(config: any): string {
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

function updateMetaTag(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function updateCanonicalUrl(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}

function updateOpenGraphTags(config: any, title: string, description: string, url: string) {
  const ogTags = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'PodDB' },
    { property: 'og:image', content: '/og-rankings.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' }
  ];
  
  ogTags.forEach(tag => {
    let meta = document.querySelector(`meta[property="${tag.property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', tag.property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', tag.content);
  });
}

function updateTwitterCardTags(config: any, title: string, description: string) {
  const twitterTags = [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: '/og-rankings.jpg' }
  ];
  
  twitterTags.forEach(tag => {
    let meta = document.querySelector(`meta[name="${tag.name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', tag.name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', tag.content);
  });
}

function addBreadcrumbStructuredData(config: any) {
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
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  };
  
  // Remove existing breadcrumb structured data
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => {
    if (script.textContent?.includes('BreadcrumbList')) {
      script.remove();
    }
  });
  
  // Add new breadcrumb structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

function addRankingStructuredData(config: any, rankings: any[]) {
  const { type, period, category, language, location, state } = config;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poddb.pro';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": generateDynamicTitle(config, rankings.length),
    "description": generateDynamicDescription(config, rankings.length, rankings),
    "url": generateCanonicalUrl(config),
    "numberOfItems": rankings.length,
    "itemListElement": rankings.slice(0, 100).map((item, index) => ({
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
    }))
  };
  
  // Remove existing ranking structured data
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => {
    if (script.textContent?.includes('ItemList')) {
      script.remove();
    }
  });
  
  // Add new ranking structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
