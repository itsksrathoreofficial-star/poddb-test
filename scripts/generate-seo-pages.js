const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSEOCombinations() {
  console.log('🚀 Starting SEO combinations generation...');
  
  try {
    // Fetch all data
    const [categoriesRes, languagesRes, locationsRes] = await Promise.all([
      supabase.from('podcasts').select('categories').not('categories', 'is', null),
      supabase.from('podcasts').select('language').not('language', 'is', null),
      supabase.from('podcasts').select('location').not('location', 'is', null)
    ]);
    
    const categories = Array.from(
      new Set(categoriesRes.data?.flatMap(item => item.categories || []) || [])
    );
    
    const languages = Array.from(
      new Set(languagesRes.data?.map(item => item.language).filter(Boolean) || [])
    );
    
    const locations = Array.from(
      new Set(locationsRes.data?.map(item => item.location).filter(Boolean) || [])
    );
    
    console.log(`📊 Found ${categories.length} categories, ${languages.length} languages, ${locations.length} locations`);
    
    const combinations = [];
    const types = ['podcasts', 'episodes'];
    const periods = ['weekly', 'monthly', 'overall'];
    
    // Base combinations
    types.forEach(type => {
      periods.forEach(period => {
        combinations.push({
          type,
          period,
          url: `/rankings?type=${type}&period=${period}`,
          priority: 0.9
        });
      });
    });
    
    // Category combinations
    categories.slice(0, 100).forEach(category => {
      types.forEach(type => {
        periods.forEach(period => {
          combinations.push({
            type,
            period,
            category,
            url: `/rankings?type=${type}&period=${period}&category=${encodeURIComponent(category)}`,
            priority: 0.8
          });
        });
      });
    });
    
    // Language combinations
    languages.slice(0, 50).forEach(language => {
      types.forEach(type => {
        periods.forEach(period => {
          combinations.push({
            type,
            period,
            language,
            url: `/rankings?type=${type}&period=${period}&language=${encodeURIComponent(language)}`,
            priority: 0.8
          });
        });
      });
    });
    
    // Location combinations
    locations.slice(0, 100).forEach(location => {
      types.forEach(type => {
        periods.forEach(period => {
          combinations.push({
            type,
            period,
            location,
            url: `/rankings?type=${type}&period=${period}&location=${encodeURIComponent(location)}`,
            priority: 0.8
          });
        });
      });
    });
    
    // Category + Language combinations
    categories.slice(0, 50).forEach(category => {
      languages.slice(0, 20).forEach(language => {
        types.forEach(type => {
          periods.forEach(period => {
            combinations.push({
              type,
              period,
              category,
              language,
              url: `/rankings?type=${type}&period=${period}&category=${encodeURIComponent(category)}&language=${encodeURIComponent(language)}`,
              priority: 0.7
            });
          });
        });
      });
    });
    
    // Category + Location combinations
    categories.slice(0, 50).forEach(category => {
      locations.slice(0, 30).forEach(location => {
        types.forEach(type => {
          periods.forEach(period => {
            combinations.push({
              type,
              period,
              category,
              location,
              url: `/rankings?type=${type}&period=${period}&category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}`,
              priority: 0.7
            });
          });
        });
      });
    });
    
    // Language + Location combinations
    languages.slice(0, 20).forEach(language => {
      locations.slice(0, 30).forEach(location => {
        types.forEach(type => {
          periods.forEach(period => {
            combinations.push({
              type,
              period,
              language,
              location,
              url: `/rankings?type=${type}&period=${period}&language=${encodeURIComponent(language)}&location=${encodeURIComponent(location)}`,
              priority: 0.7
            });
          });
        });
      });
    });
    
    // Category + Language + Location combinations
    categories.slice(0, 30).forEach(category => {
      languages.slice(0, 15).forEach(language => {
        locations.slice(0, 20).forEach(location => {
          types.forEach(type => {
            periods.forEach(period => {
              combinations.push({
                type,
                period,
                category,
                language,
                location,
                url: `/rankings?type=${type}&period=${period}&category=${encodeURIComponent(category)}&language=${encodeURIComponent(language)}&location=${encodeURIComponent(location)}`,
                priority: 0.6
              });
            });
          });
        });
      });
    });
    
    console.log(`✅ Generated ${combinations.length} SEO combinations`);
    
    // Save to file
    const outputPath = path.join(process.cwd(), 'data', 'seo-combinations.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(combinations, null, 2));
    
    console.log(`💾 Saved combinations to ${outputPath}`);
    
    // Generate sample titles and descriptions
    const sampleCombinations = combinations.slice(0, 20);
    const samples = sampleCombinations.map(combo => {
      const title = generateTitle(combo);
      const description = generateDescription(combo);
      
      return {
        ...combo,
        title,
        description
      };
    });
    
    const samplesPath = path.join(process.cwd(), 'data', 'seo-samples.json');
    fs.writeFileSync(samplesPath, JSON.stringify(samples, null, 2));
    
    console.log(`📝 Generated sample titles and descriptions`);
    console.log(`🎯 Total potential SEO pages: ${combinations.length}`);
    console.log(`📈 Estimated search coverage: ${combinations.length * 10} keywords`);
    
  } catch (error) {
    console.error('❌ Error generating SEO combinations:', error);
    process.exit(1);
  }
}

function generateTitle(combo) {
  const titleVariations = {
    best: ['Best', 'Top', 'Leading', 'Premier', 'Elite'],
    category: ['Podcasts', 'Shows', 'Series', 'Content'],
    period: {
      weekly: ['This Week', 'Weekly', 'Current Week'],
      monthly: ['This Month', 'Monthly', 'Current Month'],
      overall: ['All Time', 'Overall', 'Ever']
    }
  };
  
  let title = '';
  
  const best = titleVariations.best[Math.floor(Math.random() * titleVariations.best.length)];
  const category = titleVariations.category[Math.floor(Math.random() * titleVariations.category.length)];
  const period = titleVariations.period[combo.period][Math.floor(Math.random() * titleVariations.period[combo.period].length)];
  
  title += `${best} ${combo.type === 'podcasts' ? category : 'Episodes'}`;
  
  if (combo.category) {
    title += ` in ${combo.category}`;
  }
  
  if (combo.language) {
    title += ` in ${combo.language}`;
  }
  
  if (combo.location) {
    title += ` from ${combo.location}`;
  }
  
  title += ` - ${period} Rankings`;
  
  return title;
}

function generateDescription(combo) {
  let description = `Discover the ${combo.period === 'overall' ? 'most popular' : 'top performing'} ${combo.type}`;
  
  if (combo.category) {
    description += ` in the ${combo.category} category`;
  }
  
  if (combo.language) {
    description += ` available in ${combo.language}`;
  }
  
  if (combo.location) {
    description += ` from ${combo.location}`;
  }
  
  description += `. Our ${combo.period} rankings are based on real YouTube engagement data including views, likes, and comments. `;
  description += `Find your next favorite ${combo.type === 'podcasts' ? 'show' : 'episode'} with our comprehensive rankings. Updated daily.`;
  
  return description;
}

// Run the script
generateSEOCombinations();
