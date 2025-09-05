const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample data for analytics
const samplePages = [
  { url: '/', title: 'Homepage' },
  { url: '/podcasts', title: 'Podcasts' },
  { url: '/explore', title: 'Explore' },
  { url: '/rankings', title: 'Rankings' },
  { url: '/news', title: 'News' },
  { url: '/about', title: 'About' },
  { url: '/help', title: 'Help' },
  { url: '/contact', title: 'Contact' },
];

const sampleKeywords = [
  'podcast database',
  'best podcasts 2024',
  'true crime podcasts',
  'comedy podcasts',
  'business podcasts',
  'news podcasts',
  'sports podcasts',
  'technology podcasts',
  'health podcasts',
  'education podcasts',
];

const sampleTrafficSources = [
  { domain: 'google.com', type: 'organic' },
  { domain: 'bing.com', type: 'organic' },
  { domain: 'facebook.com', type: 'social' },
  { domain: 'twitter.com', type: 'social' },
  { domain: 'reddit.com', type: 'social' },
  { domain: 'linkedin.com', type: 'social' },
  { domain: 'direct', type: 'direct' },
  { domain: 'podcastindex.org', type: 'referral' },
  { domain: 'apple.com', type: 'referral' },
  { domain: 'spotify.com', type: 'referral' },
];

const sampleCountries = [
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'IN', name: 'India', region: 'Asia' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'AU', name: 'Australia', region: 'Oceania' },
  { code: 'BR', name: 'Brazil', region: 'South America' },
  { code: 'FR', name: 'France', region: 'Europe' },
];

const sampleAgeGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
const sampleGenders = ['male', 'female', 'other'];

// Generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random number within range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random decimal within range
function randomDecimal(min, max) {
  return Math.random() * (max - min) + min;
}

// Generate sample analytics events
async function generateAnalyticsEvents() {
  console.log('Generating analytics events...');
  
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  for (let i = 0; i < 1000; i++) {
    const eventDate = randomDate(startDate, endDate);
    const page = samplePages[randomInt(0, samplePages.length - 1)];
    const country = sampleCountries[randomInt(0, sampleCountries.length - 1)];
    
    const eventData = {
      session_id: `session-${i}`,
      event_type: ['page_view', 'click', 'search', 'download'][randomInt(0, 3)],
      page_url: page.url,
      page_title: page.title,
      referrer_url: Math.random() > 0.3 ? `https://${sampleTrafficSources[randomInt(0, sampleTrafficSources.length - 1)].domain}` : null,
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      country_code: country.code,
      region: country.region,
      city: country.name,
      device_type: ['desktop', 'mobile', 'tablet'][randomInt(0, 2)],
      browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][randomInt(0, 3)],
      os: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'][randomInt(0, 4)],
      created_at: eventDate.toISOString(),
    };
    
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventData);
      
      if (error) {
        console.error('Error inserting event:', error);
      }
    } catch (error) {
      console.error('Error inserting event:', error);
    }
  }
  
  console.log('Analytics events generated!');
}

// Generate sample page performance data
async function generatePagePerformance() {
  console.log('Generating page performance data...');
  
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  for (let page of samplePages) {
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const performanceData = {
        page_url: page.url,
        page_title: page.title,
        date: currentDate.toISOString().split('T')[0],
        impressions: randomInt(100, 5000),
        clicks: randomInt(10, 500),
        ctr: randomDecimal(0.01, 0.15),
        avg_time_on_page: randomDecimal(30, 300),
        bounce_rate: randomDecimal(0.2, 0.8),
        exit_rate: randomDecimal(0.1, 0.6),
        unique_visitors: randomInt(50, 2000),
        total_visits: randomInt(150, 6000),
        organic_traffic: randomInt(50, 3000),
        direct_traffic: randomInt(20, 1000),
        referral_traffic: randomInt(10, 500),
        social_traffic: randomInt(10, 300),
        paid_traffic: randomInt(0, 100),
      };
      
      try {
        const { error } = await supabase
          .from('analytics_page_performance')
          .upsert(performanceData, { onConflict: 'page_url,date' });
        
        if (error) {
          console.error('Error inserting page performance:', error);
        }
      } catch (error) {
        console.error('Error inserting page performance:', error);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  console.log('Page performance data generated!');
}

// Generate sample keyword performance data
async function generateKeywordPerformance() {
  console.log('Generating keyword performance data...');
  
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  for (let keyword of sampleKeywords) {
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const keywordData = {
        keyword: keyword,
        date: currentDate.toISOString().split('T')[0],
        search_volume: randomInt(1000, 100000),
        impressions: randomInt(100, 10000),
        clicks: randomInt(10, 1000),
        ctr: randomDecimal(0.01, 0.20),
        avg_position: randomDecimal(1, 50),
        avg_cpc: randomDecimal(0.5, 5.0),
        competition_level: ['low', 'medium', 'high'][randomInt(0, 2)],
        search_intent: ['informational', 'navigational', 'transactional'][randomInt(0, 2)],
        related_pages: [samplePages[randomInt(0, samplePages.length - 1)].url],
      };
      
      try {
        const { error } = await supabase
          .from('analytics_keywords')
          .upsert(keywordData, { onConflict: 'keyword,date' });
        
        if (error) {
          console.error('Error inserting keyword performance:', error);
        }
      } catch (error) {
        console.error('Error inserting keyword performance:', error);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  console.log('Keyword performance data generated!');
}

// Generate sample traffic sources data
async function generateTrafficSources() {
  console.log('Generating traffic sources data...');
  
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  for (let source of sampleTrafficSources) {
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const trafficData = {
        source_domain: source.domain,
        source_type: source.type,
        date: currentDate.toISOString().split('T')[0],
        sessions: randomInt(50, 2000),
        users: randomInt(30, 1500),
        page_views: randomInt(100, 5000),
        avg_session_duration: randomDecimal(60, 600),
        bounce_rate: randomDecimal(0.1, 0.9),
        conversion_rate: randomDecimal(0.01, 0.10),
      };
      
      try {
        const { error } = await supabase
          .from('analytics_traffic_sources')
          .upsert(trafficData, { onConflict: 'source_domain,source_type,date' });
        
        if (error) {
          console.error('Error inserting traffic source:', error);
        }
      } catch (error) {
        console.error('Error inserting traffic source:', error);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  console.log('Traffic sources data generated!');
}

// Generate sample user demographics data
async function generateUserDemographics() {
  console.log('Generating user demographics data...');
  
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  for (let ageGroup of sampleAgeGroups) {
    for (let gender of sampleGenders) {
      for (let country of sampleCountries) {
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const demoData = {
            date: currentDate.toISOString().split('T')[0],
            age_group: ageGroup,
            gender: gender,
            country_code: country.code,
            region: country.region,
            city: country.name,
            sessions: randomInt(10, 500),
            users: randomInt(5, 300),
            page_views: randomInt(20, 1000),
            avg_session_duration: randomDecimal(30, 300),
            bounce_rate: randomDecimal(0.1, 0.9),
            conversion_rate: randomDecimal(0.01, 0.08),
          };
          
          try {
            const { error } = await supabase
              .from('analytics_user_demographics')
              .upsert(demoData, { onConflict: 'date,age_group,gender,country_code,region,city' });
            
            if (error) {
              console.error('Error inserting demographics:', error);
            }
          } catch (error) {
            console.error('Error inserting demographics:', error);
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }
  }
  
  console.log('User demographics data generated!');
}

// Generate sample SEO performance data
async function generateSEOPerformance() {
  console.log('Generating SEO performance data...');
  
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  for (let page of samplePages) {
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const seoData = {
        page_url: page.url,
        date: currentDate.toISOString().split('T')[0],
        google_indexed: Math.random() > 0.1,
        google_position: Math.random() > 0.3 ? randomInt(1, 50) : null,
        google_impressions: randomInt(50, 5000),
        google_clicks: randomInt(5, 500),
        google_ctr: randomDecimal(0.01, 0.20),
        bing_indexed: Math.random() > 0.2,
        bing_position: Math.random() > 0.4 ? randomInt(1, 50) : null,
        bing_impressions: randomInt(20, 2000),
        bing_clicks: randomInt(2, 200),
        bing_ctr: randomDecimal(0.01, 0.15),
        page_speed_score: randomInt(50, 100),
        mobile_friendly: Math.random() > 0.1,
        core_web_vitals: {
          lcp: randomDecimal(1.0, 4.0),
          fid: randomDecimal(10, 100),
          cls: randomDecimal(0.01, 0.3),
        },
        seo_score: randomInt(60, 100),
      };
      
      try {
        const { error } = await supabase
          .from('analytics_seo_performance')
          .upsert(seoData, { onConflict: 'page_url,date' });
        
        if (error) {
          console.error('Error inserting SEO performance:', error);
        }
      } catch (error) {
        console.error('Error inserting SEO performance:', error);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  console.log('SEO performance data generated!');
}

// Main function to generate all data
async function generateAllAnalyticsData() {
  try {
    console.log('Starting analytics data generation...');
    
    await generateAnalyticsEvents();
    await generatePagePerformance();
    await generateKeywordPerformance();
    await generateTrafficSources();
    await generateUserDemographics();
    await generateSEOPerformance();
    
    console.log('All analytics data generated successfully!');
  } catch (error) {
    console.error('Error generating analytics data:', error);
  }
}

// Run the script
if (require.main === module) {
  generateAllAnalyticsData();
}

module.exports = {
  generateAllAnalyticsData,
  generateAnalyticsEvents,
  generatePagePerformance,
  generateKeywordPerformance,
  generateTrafficSources,
  generateUserDemographics,
  generateSEOPerformance,
};
