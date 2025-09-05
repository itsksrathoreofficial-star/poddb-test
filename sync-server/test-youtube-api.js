const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testYouTubeAPI() {
  try {
    console.log('🔍 Testing YouTube API...');
    
    // Get API key from database
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('youtube_api_keys')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (apiKeyError || !apiKeyData) {
      console.error('❌ No active API key found:', apiKeyError?.message);
      return;
    }

    console.log(`✅ Using API key: ${apiKeyData.name}`);
    console.log(`🔑 API Key: ${apiKeyData.api_key.substring(0, 20)}...`);

    // Test with a simple API call
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${apiKeyData.api_key}`;
    
    console.log('🌐 Testing API call...');
    const response = await fetch(testUrl);
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`📊 Response Body:`, responseText.substring(0, 500));

    if (response.ok) {
      console.log('✅ YouTube API is working correctly!');
    } else {
      console.log('❌ YouTube API error detected');
      
      if (response.status === 403) {
        console.log('🚨 403 Forbidden - Possible issues:');
        console.log('   - API key quota exceeded');
        console.log('   - API key is invalid');
        console.log('   - YouTube Data API v3 not enabled');
        console.log('   - API key restrictions');
      }
    }

  } catch (error) {
    console.error('❌ Error testing YouTube API:', error.message);
  }
}

testYouTubeAPI();

