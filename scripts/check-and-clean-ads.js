const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCleanAds() {
  console.log('🔍 Checking and cleaning ads...\n');

  try {
    // 1. Get all ads
    console.log('1. Fetching all ads...');
    const { data: ads, error: adsError } = await supabase
      .from('ad_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (adsError) {
      console.error('❌ Failed to fetch ads:', adsError.message);
      return;
    }

    console.log(`✅ Found ${ads.length} ads in database\n`);

    // 2. Check for problematic ads
    console.log('2. Checking for problematic ads...');
    
    const problematicAds = ads.filter(ad => 
      ad.placement === 'header' || 
      ad.placement === 'sidebar' ||
      ad.status === 'active' && (ad.pages.includes('all') || ad.pages.includes('home'))
    );

    if (problematicAds.length > 0) {
      console.log(`⚠️  Found ${problematicAds.length} problematic ads:`);
      problematicAds.forEach(ad => {
        console.log(`   - ${ad.name} (${ad.placement}) - Status: ${ad.status} - Pages: ${ad.pages.join(', ')}`);
      });

      // 3. Deactivate problematic ads
      console.log('\n3. Deactivating problematic ads...');
      const adIds = problematicAds.map(ad => ad.id);
      
      const { error: updateError } = await supabase
        .from('ad_configs')
        .update({ status: 'inactive' })
        .in('id', adIds);

      if (updateError) {
        console.error('❌ Failed to deactivate ads:', updateError.message);
        return;
      }

      console.log('✅ Problematic ads deactivated successfully');
    } else {
      console.log('✅ No problematic ads found');
    }

    // 4. Show current active ads
    console.log('\n4. Current active ads:');
    const activeAds = ads.filter(ad => ad.status === 'active');
    if (activeAds.length === 0) {
      console.log('   ✅ No active ads - no blank spaces should appear');
    } else {
      activeAds.forEach(ad => {
        console.log(`   - ${ad.name} (${ad.placement}) - Pages: ${ad.pages.join(', ')}`);
      });
    }

    // 5. Show ads by placement
    console.log('\n5. Ads by placement:');
    const placements = {
      content: ads.filter(ad => ad.placement === 'content'),
      footer: ads.filter(ad => ad.placement === 'footer'),
      between_content: ads.filter(ad => ad.placement === 'between_content'),
      header: ads.filter(ad => ad.placement === 'header'),
      sidebar: ads.filter(ad => ad.placement === 'sidebar')
    };

    Object.entries(placements).forEach(([placement, ads]) => {
      const activeCount = ads.filter(ad => ad.status === 'active').length;
      console.log(`   ${placement}: ${ads.length} total, ${activeCount} active`);
    });

    console.log('\n✅ Ad check and cleanup completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Refresh your home page');
    console.log('   2. Check if blank spaces are gone');
    console.log('   3. Create new ads only for content, footer, or between_content placements');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkAndCleanAds();
