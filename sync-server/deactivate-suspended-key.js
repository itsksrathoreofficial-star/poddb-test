const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deactivateSuspendedKey() {
  try {
    console.log('🔍 Finding suspended API key...');
    
    // Find the suspended API key
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

    console.log(`🔑 Found API key: ${apiKeyData.name}`);
    console.log(`🔑 API Key: ${apiKeyData.api_key.substring(0, 20)}...`);

    // Deactivate the suspended key
    const { error: updateError } = await supabase
      .from('youtube_api_keys')
      .update({ is_active: false })
      .eq('id', apiKeyData.id);

    if (updateError) {
      console.error('❌ Error deactivating API key:', updateError.message);
      return;
    }

    console.log('✅ Suspended API key has been deactivated!');
    console.log('💡 Please add a new YouTube API key through the admin panel.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deactivateSuspendedKey();

