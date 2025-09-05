#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deactivateSampleAds() {
  console.log('🔧 Deactivating sample ads...\n');

  try {
    // Deactivate all sample ads
    const { error } = await supabase
      .from('ad_configs')
      .update({ status: 'inactive' })
      .in('name', ['Header Banner Ad', 'Sidebar Ad', 'Custom Promo Ad']);

    if (error) throw error;

    console.log('✅ Sample ads deactivated successfully!');
    console.log('📋 Now you can:');
    console.log('   1. Go to Admin Panel → Ad Manager');
    console.log('   2. Create your own ads');
    console.log('   3. Select specific pages where you want ads to show');
    console.log('   4. No more blank spaces will appear unless you configure ads\n');

    // Check current status
    const { data: ads, error: checkError } = await supabase
      .from('ad_configs')
      .select('name, status, pages')
      .order('name');

    if (checkError) throw checkError;

    console.log('📊 Current ad status:');
    ads?.forEach(ad => {
      console.log(`   - ${ad.name}: ${ad.status} (Pages: ${JSON.stringify(ad.pages)})`);
    });

  } catch (error) {
    console.error('❌ Error deactivating ads:', error.message);
    process.exit(1);
  }
}

deactivateSampleAds();
