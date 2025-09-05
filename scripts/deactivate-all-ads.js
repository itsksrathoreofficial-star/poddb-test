const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

if (supabaseUrl === 'your-supabase-url' || supabaseKey === 'your-supabase-key') {
  console.log('⚠️  Please set your Supabase environment variables in .env.local');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your-url');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deactivateAllAds() {
  console.log('🔄 Deactivating all ads...\n');

  try {
    // Get all ads first
    const { data: ads, error: fetchError } = await supabase
      .from('ad_configs')
      .select('id, name, placement, status');

    if (fetchError) {
      console.error('❌ Failed to fetch ads:', fetchError.message);
      return;
    }

    console.log(`📊 Found ${ads.length} ads in database`);

    if (ads.length === 0) {
      console.log('✅ No ads to deactivate');
      return;
    }

    // Show current ads
    console.log('\n📋 Current ads:');
    ads.forEach(ad => {
      console.log(`   - ${ad.name} (${ad.placement}) - Status: ${ad.status}`);
    });

    // Deactivate all ads
    const { error: updateError } = await supabase
      .from('ad_configs')
      .update({ status: 'inactive' })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

    if (updateError) {
      console.error('❌ Failed to deactivate ads:', updateError.message);
      return;
    }

    console.log('\n✅ All ads deactivated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Refresh your home page');
    console.log('   2. Check that blank spaces are gone');
    console.log('   3. Create new ads only for content, footer, or between_content placements');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deactivateAllAds();
