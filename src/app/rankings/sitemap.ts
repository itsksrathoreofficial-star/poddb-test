import { MetadataRoute } from 'next';
import { createServiceClient } from '@/integrations/supabase/service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poddb.pro';
  const sitemap: MetadataRoute.Sitemap = [];
  
  try {
    // Base rankings page
    sitemap.push({
      url: `${baseUrl}/rankings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
    
    // Get all categories
    const supabase = createServiceClient();
    const { data: categories } = await supabase
      .from('podcasts')
      .select('categories')
      .not('categories', 'is', null);
    
    const uniqueCategories = Array.from(
      new Set(categories?.flatMap(item => item.categories || []) || [])
    );
    
    // Get all languages
    const { data: languages } = await supabase
      .from('podcasts')
      .select('language')
      .not('language', 'is', null);
    
    const uniqueLanguages = Array.from(
      new Set(languages?.map(item => item.language).filter(Boolean) || [])
    );
    
    // Get all locations
    const { data: locations } = await supabase
      .from('podcasts')
      .select('location')
      .not('location', 'is', null);
    
    const uniqueLocations = Array.from(
      new Set(locations?.map(item => item.location).filter(Boolean) || [])
    );
    
    const periods = ['weekly', 'monthly', 'overall'];
    const types = ['podcasts', 'episodes'];
    
    // Generate category pages
    uniqueCategories.slice(0, 100).forEach(category => {
      sitemap.push({
        url: `${baseUrl}/rankings/${encodeURIComponent(category)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
      
      // Category with periods
      periods.forEach(period => {
        sitemap.push({
          url: `${baseUrl}/rankings?category=${encodeURIComponent(category)}&period=${period}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        });
      });
      
      // Category with types
      types.forEach(type => {
        sitemap.push({
          url: `${baseUrl}/rankings?category=${encodeURIComponent(category)}&type=${type}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        });
      });
    });
    
    // Generate language pages
    uniqueLanguages.slice(0, 50).forEach(language => {
      sitemap.push({
        url: `${baseUrl}/rankings?language=${encodeURIComponent(language)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
      
      // Language with periods
      periods.forEach(period => {
        sitemap.push({
          url: `${baseUrl}/rankings?language=${encodeURIComponent(language)}&period=${period}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    });
    
    // Generate location pages
    uniqueLocations.slice(0, 100).forEach(location => {
      sitemap.push({
        url: `${baseUrl}/rankings?location=${encodeURIComponent(location)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
      
      // Location with periods
      periods.forEach(period => {
        sitemap.push({
          url: `${baseUrl}/rankings?location=${encodeURIComponent(location)}&period=${period}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    });
    
    // Generate category + language combinations
    uniqueCategories.slice(0, 50).forEach(category => {
      uniqueLanguages.slice(0, 20).forEach(language => {
        sitemap.push({
          url: `${baseUrl}/rankings/${encodeURIComponent(category)}/${encodeURIComponent(language)}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        });
        
        // Category + language with periods
        periods.forEach(period => {
          sitemap.push({
            url: `${baseUrl}/rankings?category=${encodeURIComponent(category)}&language=${encodeURIComponent(language)}&period=${period}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.6,
          });
        });
      });
    });
    
    // Generate category + language + location combinations
    uniqueCategories.slice(0, 30).forEach(category => {
      uniqueLanguages.slice(0, 15).forEach(language => {
        uniqueLocations.slice(0, 20).forEach(location => {
          sitemap.push({
            url: `${baseUrl}/rankings/${encodeURIComponent(category)}/${encodeURIComponent(language)}/${encodeURIComponent(location)}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.6,
          });
        });
      });
    });
    
    // Generate all period combinations
    periods.forEach(period => {
      sitemap.push({
        url: `${baseUrl}/rankings?period=${period}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    });
    
    // Generate all type combinations
    types.forEach(type => {
      sitemap.push({
        url: `${baseUrl}/rankings?type=${type}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    });
    
  } catch (error) {
    console.error('Error generating rankings sitemap:', error);
  }
  
  return sitemap;
}
