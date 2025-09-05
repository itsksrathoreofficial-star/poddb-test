const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkApiKeys() {
  try {
    console.log('🔍 Checking YouTube API keys in database...');
    
    const { data, error } = await supabase
      .from('youtube_api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching API keys:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ No YouTube API keys found in database!');
      console.log('💡 Please add YouTube API keys through the admin panel.');
      return;
    }

    console.log(`✅ Found ${data.length} YouTube API key(s):`);
    data.forEach((key, index) => {
      console.log(`\n${index + 1}. Name: ${key.name}`);
      console.log(`   Active: ${key.is_active ? '✅' : '❌'}`);
      console.log(`   Quota Used: ${key.quota_used || 0}/10000`);
      console.log(`   Created: ${new Date(key.created_at).toLocaleString()}`);
      console.log(`   API Key: ${key.api_key.substring(0, 10)}...`);
    });

    // Check for active keys with quota
    const activeKeys = data.filter(key => key.is_active && (key.quota_used || 0) < 9000);
    console.log(`\n🎯 Active keys with sufficient quota: ${activeKeys.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkApiKeys();

