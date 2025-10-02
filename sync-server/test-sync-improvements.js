const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSyncImprovements() {
  console.log('🧪 Testing sync improvements...\n');
  
  try {
    // Test 1: Check for podcasts with large episode counts
    console.log('1️⃣ Checking podcasts with large episode counts...');
    const { data: largePodcasts, error: podcastError } = await supabase
      .from('podcasts')
      .select('id, title, total_episodes, youtube_playlist_id')
      .gt('total_episodes', 1000)
      .order('total_episodes', { ascending: false })
      .limit(5);

    if (podcastError) {
      console.error('Error fetching podcasts:', podcastError);
    } else {
      console.log(`Found ${largePodcasts.length} podcasts with 1000+ episodes:`);
      largePodcasts.forEach(podcast => {
        console.log(`  - ${podcast.title}: ${podcast.total_episodes} episodes`);
      });
    }

    // Test 2: Check for duplicate episode slugs
    console.log('\n2️⃣ Checking for duplicate episode slugs...');
    const { data: duplicateSlugs, error: slugError } = await supabase
      .rpc('get_duplicate_episode_slugs');

    if (slugError) {
      // Fallback query if RPC doesn't exist
      const { data: episodes, error: episodesError } = await supabase
        .from('episodes')
        .select('slug')
        .order('slug');
      
      if (episodesError) {
        console.error('Error checking duplicate slugs:', episodesError);
      } else {
        const slugCounts = {};
        episodes.forEach(ep => {
          slugCounts[ep.slug] = (slugCounts[ep.slug] || 0) + 1;
        });
        
        const duplicates = Object.entries(slugCounts).filter(([slug, count]) => count > 1);
        console.log(`Found ${duplicates.length} duplicate slug groups`);
        
        if (duplicates.length > 0) {
          console.log('Top 5 duplicate slugs:');
          duplicates.slice(0, 5).forEach(([slug, count]) => {
            console.log(`  - "${slug}": ${count} episodes`);
          });
        }
      }
    } else {
      console.log(`Found ${duplicateSlugs.length} duplicate slug groups`);
    }

    // Test 3: Check recent sync errors
    console.log('\n3️⃣ Checking recent sync errors...');
    const { data: recentErrors, error: errorError } = await supabase
      .from('auto_sync_logs')
      .select('*')
      .eq('log_level', 'ERROR')
      .order('created_at', { ascending: false })
      .limit(10);

    if (errorError) {
      console.error('Error fetching sync logs:', errorError);
    } else {
      console.log(`Found ${recentErrors.length} recent errors:`);
      recentErrors.forEach(error => {
        console.log(`  - ${error.created_at}: ${error.message}`);
      });
    }

    // Test 4: Check episode stats table for timeout errors
    console.log('\n4️⃣ Checking for timeout-related issues...');
    const { data: timeoutErrors, error: timeoutError } = await supabase
      .from('auto_sync_logs')
      .select('*')
      .or('message.ilike.%timeout%,message.ilike.%522%,message.ilike.%upstream%')
      .order('created_at', { ascending: false })
      .limit(5);

    if (timeoutError) {
      console.error('Error fetching timeout logs:', timeoutError);
    } else {
      console.log(`Found ${timeoutErrors.length} timeout-related errors:`);
      timeoutErrors.forEach(error => {
        console.log(`  - ${error.created_at}: ${error.message.substring(0, 100)}...`);
      });
    }

    // Test 5: Check database performance
    console.log('\n5️⃣ Checking database performance...');
    const startTime = Date.now();
    const { data: testQuery, error: perfError } = await supabase
      .from('episodes')
      .select('id, title, slug')
      .limit(100);
    
    const queryTime = Date.now() - startTime;
    
    if (perfError) {
      console.error('Database performance test failed:', perfError);
    } else {
      console.log(`Database query took ${queryTime}ms for 100 episodes`);
      if (queryTime > 5000) {
        console.log('⚠️  Database appears to be slow (>5s for 100 records)');
      } else {
        console.log('✅ Database performance looks good');
      }
    }

    console.log('\n🎉 Sync improvement tests completed!');
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
testSyncImprovements();
