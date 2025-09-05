#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

async function setupAdSystem() {
  console.log('🚀 Setting up Ad Management System...\n');

  try {
    // Check if tables exist
    console.log('📋 Checking database tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['ad_configs', 'ad_stats', 'ad_clicks', 'ad_impressions']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message);
      return;
    }

    const existingTables = tables.map(t => t.table_name);
    const requiredTables = ['ad_configs', 'ad_stats', 'ad_clicks', 'ad_impressions'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables detected. Please run the migration first:');
      console.log('   npx supabase db push');
      console.log('   or');
      console.log('   Run the migration file: supabase/migrations/20241220000001_create_ad_management_tables.sql\n');
      return;
    }

    console.log('✅ All required tables exist\n');

    // Check if there are any existing ads
    const { data: existingAds, error: adsError } = await supabase
      .from('ad_configs')
      .select('id, name, type, status')
      .limit(5);

    if (adsError) {
      console.error('❌ Error checking existing ads:', adsError.message);
      return;
    }

    if (existingAds && existingAds.length > 0) {
      console.log('📊 Found existing ads:');
      existingAds.forEach(ad => {
        console.log(`   - ${ad.name} (${ad.type}) - ${ad.status}`);
      });
      console.log('');
    } else {
      console.log('📝 No existing ads found. Creating sample ads...\n');
      
      // Create sample ads
      const sampleAds = [
        {
          name: 'Header Banner Ad',
          type: 'google_adsense',
          status: 'active',
          placement: 'header',
          ad_position: 1,
          pages: ['all'],
          devices: ['desktop', 'mobile'],
          google_adsense_code: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="1234567890" data-ad-format="auto"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
          max_ads_per_page: 1,
          priority: 1,
          width: 728,
          height: 90
        },
        {
          name: 'Sidebar Ad',
          type: 'google_adsense',
          status: 'active',
          placement: 'sidebar',
          ad_position: 1,
          pages: ['podcasts', 'episodes', 'rankings', 'news'],
          devices: ['desktop'],
          google_adsense_code: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="0987654321" data-ad-format="rectangle"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
          max_ads_per_page: 2,
          priority: 2,
          width: 300,
          height: 250
        },
        {
          name: 'Custom Promo Ad',
          type: 'custom',
          status: 'active',
          placement: 'content',
          ad_position: 1,
          pages: ['home'],
          devices: ['desktop', 'mobile'],
          custom_html: '<div class="custom-ad-banner" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; text-align: center; color: white;"><h3>Special Offer!</h3><p>Get 50% off on premium features</p><a href="https://example.com/offer" style="background: white; color: #667eea; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 10px;">Learn More</a></div>',
          click_url: 'https://example.com/offer',
          image_url: 'https://via.placeholder.com/728x90/667eea/ffffff?text=Special+Offer',
          alt_text: 'Special Offer Banner',
          max_ads_per_page: 1,
          priority: 3,
          width: 728,
          height: 90
        }
      ];

      const { error: insertError } = await supabase
        .from('ad_configs')
        .insert(sampleAds);

      if (insertError) {
        console.error('❌ Error creating sample ads:', insertError.message);
        return;
      }

      console.log('✅ Sample ads created successfully\n');
    }

    // Test the ad system
    console.log('🧪 Testing ad system...');
    
    const { data: testAds, error: testError } = await supabase
      .rpc('get_active_ads_for_page', {
        page_name: 'home',
        device_type: 'desktop'
      });

    if (testError) {
      console.error('❌ Error testing ad system:', testError.message);
      return;
    }

    console.log(`✅ Ad system test successful - found ${testAds.length} ads for home page\n`);

    // Display setup instructions
    console.log('🎉 Ad Management System setup complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. Go to your admin panel: /admin');
    console.log('   2. Click on "Ad Manager" tab');
    console.log('   3. Configure your Google AdSense codes');
    console.log('   4. Create custom ads as needed');
    console.log('   5. Adjust ad placement and settings\n');
    
    console.log('💡 Features available:');
    console.log('   ✅ Google AdSense integration');
    console.log('   ✅ Custom ad management');
    console.log('   ✅ Automatic ad placement');
    console.log('   ✅ Click and impression tracking');
    console.log('   ✅ Device-specific targeting');
    console.log('   ✅ Page-specific targeting');
    console.log('   ✅ Analytics and reporting\n');

    console.log('🔧 Ad placements:');
    console.log('   - Header: Top of page');
    console.log('   - Sidebar: Left or right sidebar');
    console.log('   - Content: Within content area');
    console.log('   - Footer: Bottom of page');
    console.log('   - Between Content: Between content blocks\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupAdSystem();
