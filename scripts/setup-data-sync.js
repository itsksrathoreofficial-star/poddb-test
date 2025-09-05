#!/usr/bin/env node

/**
 * PodDB Data Sync System Setup Script
 * 
 * This script helps set up and verify the data sync system.
 * Run this after deploying the database migrations and edge functions.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    // Check if required tables exist
    const requiredTables = [
      'podcast_daily_stats',
      'episode_daily_stats',
      'podcast_weekly_stats',
      'episode_weekly_stats',
      'podcast_monthly_stats',
      'episode_monthly_stats',
      'ranking_snapshots',
      'sync_sessions',
      'auto_sync_settings',
      'auto_sync_logs'
    ];

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Table ${table} is missing or inaccessible:`, error.message);
          return false;
        }
        
        console.log(`✅ Table ${table} exists`);
      } catch (err) {
        console.error(`❌ Error checking table ${table}:`, err.message);
        return false;
      }
    }

    // Check if required functions exist
    console.log('🔍 Checking database functions...');
    
    try {
      const { data, error } = await supabase.rpc('calculate_weekly_stats', {
        start_date: '2024-01-01'
      });
      
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        console.error('❌ Function calculate_weekly_stats is missing');
        return false;
      }
      
      console.log('✅ Function calculate_weekly_stats exists');
    } catch (err) {
      console.error('❌ Error checking function calculate_weekly_stats:', err.message);
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('calculate_monthly_stats', {
        year_num: 2024,
        month_num: 1
      });
      
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        console.error('❌ Function calculate_monthly_stats is missing');
        return false;
      }
      
      console.log('✅ Function calculate_monthly_stats exists');
    } catch (err) {
      console.error('❌ Error checking function calculate_monthly_stats:', err.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error checking database schema:', error.message);
    return false;
  }
}

async function checkYouTubeAPIKeys() {
  console.log('🔍 Checking YouTube API keys...');
  
  try {
    const { data, error } = await supabase
      .from('youtube_api_keys')
      .select('id, api_key, is_active, quota_limit, quota_used')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching YouTube API keys:', error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.error('❌ No active YouTube API keys found');
      console.log('   Please add at least one YouTube API key in the admin panel');
      return false;
    }

    console.log(`✅ Found ${data.length} active YouTube API key(s)`);
    
    for (const key of data) {
      const quotaStatus = key.quota_limit ? 
        `${key.quota_used || 0}/${key.quota_limit}` : 
        'No limit set';
      console.log(`   - Key ${key.id}: ${quotaStatus} quota used`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error checking YouTube API keys:', error.message);
    return false;
  }
}

async function checkPodcasts() {
  console.log('🔍 Checking podcasts...');
  
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('id, title, youtube_channel_id, status')
      .eq('status', 'approved')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching podcasts:', error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No approved podcasts found');
      console.log('   This is normal if you haven\'t approved any podcasts yet');
      return true;
    }

    console.log(`✅ Found ${data.length} approved podcasts`);
    
    const withYouTubeId = data.filter(p => p.youtube_channel_id);
    console.log(`   - ${withYouTubeId.length} have YouTube channel IDs`);
    console.log(`   - ${data.length - withYouTubeId.length} missing YouTube channel IDs`);

    if (withYouTubeId.length === 0) {
      console.log('⚠️  No podcasts have YouTube channel IDs configured');
      console.log('   Data sync will not work without YouTube channel IDs');
    }

    return true;
  } catch (error) {
    console.error('❌ Error checking podcasts:', error.message);
    return false;
  }
}

async function initializeAutoSyncSettings() {
  console.log('🔧 Initializing auto sync settings...');
  
  try {
    const { data, error } = await supabase
      .from('auto_sync_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error checking auto sync settings:', error.message);
      return false;
    }

    if (!data) {
      // Create default settings
      const { error: insertError } = await supabase
        .from('auto_sync_settings')
        .insert({
          id: 'default',
          enabled: false,
          schedule_type: 'daily',
          schedule_time: '02:00:00',
          schedule_days: [1, 2, 3, 4, 5, 6, 7],
          schedule_day_of_month: 1,
          max_retries: 3,
          retry_delay_minutes: 30,
          batch_size: 10
        });

      if (insertError) {
        console.error('❌ Error creating auto sync settings:', insertError.message);
        return false;
      }

      console.log('✅ Auto sync settings initialized with defaults');
    } else {
      console.log('✅ Auto sync settings already exist');
    }

    return true;
  } catch (error) {
    console.error('❌ Error initializing auto sync settings:', error.message);
    return false;
  }
}

async function testEdgeFunction() {
  console.log('🔍 Testing daily-data-sync edge function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('daily-data-sync', {
      body: { 
        operation: 'test',
        batch_size: 1
      }
    });

    if (error) {
      if (error.message.includes('Invalid operation')) {
        console.log('✅ Edge function is accessible (expected error for test operation)');
        return true;
      } else {
        console.error('❌ Error testing edge function:', error.message);
        return false;
      }
    }

    console.log('✅ Edge function is accessible');
    return true;
  } catch (error) {
    console.error('❌ Error testing edge function:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 PodDB Data Sync System Setup');
  console.log('================================\n');

  let allChecksPassed = true;

  // Check database schema
  const schemaOk = await checkDatabaseSchema();
  if (!schemaOk) {
    allChecksPassed = false;
    console.log('\n❌ Database schema check failed. Please run the migrations first.');
  }

  console.log();

  // Check YouTube API keys
  const apiKeysOk = await checkYouTubeAPIKeys();
  if (!apiKeysOk) {
    allChecksPassed = false;
  }

  console.log();

  // Check podcasts
  const podcastsOk = await checkPodcasts();
  if (!podcastsOk) {
    allChecksPassed = false;
  }

  console.log();

  // Initialize auto sync settings
  const settingsOk = await initializeAutoSyncSettings();
  if (!settingsOk) {
    allChecksPassed = false;
  }

  console.log();

  // Test edge function
  const functionOk = await testEdgeFunction();
  if (!functionOk) {
    allChecksPassed = false;
  }

  console.log('\n' + '='.repeat(50));

  if (allChecksPassed) {
    console.log('✅ All checks passed! The data sync system is ready to use.');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to /admin → Data Sync tab');
    console.log('   2. Configure your auto sync settings');
    console.log('   3. Test with a manual sync');
    console.log('   4. Monitor the sync progress and history');
  } else {
    console.log('❌ Some checks failed. Please fix the issues above before using the data sync system.');
    console.log('\n🔧 Common solutions:');
    console.log('   - Run database migrations: supabase db push');
    console.log('   - Deploy edge functions: supabase functions deploy daily-data-sync');
    console.log('   - Add YouTube API keys in the admin panel');
    console.log('   - Ensure podcasts have YouTube channel IDs configured');
  }

  console.log('\n📚 For more information, see DATA_SYNC_README.md');
}

// Run the setup
main().catch(console.error);
