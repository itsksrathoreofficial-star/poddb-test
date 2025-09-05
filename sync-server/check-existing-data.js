const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExistingData() {
  try {
    console.log('🔍 Checking existing data in database...\n');

    // Check podcasts
    const { data: podcasts, error: podcastsError } = await supabase
      .from('podcasts')
      .select('id, title, created_at')
      .order('created_at', { ascending: false });

    if (podcastsError) {
      console.error('❌ Error fetching podcasts:', podcastsError.message);
    } else {
      console.log(`📊 Total Podcasts: ${podcasts?.length || 0}`);
      if (podcasts && podcasts.length > 0) {
        console.log('📋 Recent podcasts:');
        podcasts.slice(0, 3).forEach((podcast, index) => {
          console.log(`   ${index + 1}. ${podcast.title}`);
        });
      }
    }

    // Check episodes
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('id, title, podcast_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (episodesError) {
      console.error('❌ Error fetching episodes:', episodesError.message);
    } else {
      console.log(`\n📊 Total Episodes: ${episodes?.length || 0} (showing last 10)`);
      if (episodes && episodes.length > 0) {
        console.log('📋 Recent episodes:');
        episodes.slice(0, 3).forEach((episode, index) => {
          console.log(`   ${index + 1}. ${episode.title}`);
        });
      }
    }

    // Check daily stats
    const { data: dailyStats, error: dailyStatsError } = await supabase
      .from('podcast_daily_stats')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);

    if (dailyStatsError) {
      console.error('❌ Error fetching daily stats:', dailyStatsError.message);
    } else {
      console.log(`\n📊 Daily Stats Records: ${dailyStats?.length || 0}`);
      if (dailyStats && dailyStats.length > 0) {
        console.log('📋 Recent daily stats:');
        dailyStats.forEach((stat, index) => {
          console.log(`   ${index + 1}. Date: ${stat.date}, Views: ${stat.total_views || 0}`);
        });
      }
    }

    // Check analytics summary
    const { data: analyticsSummary, error: analyticsError } = await supabase
      .from('podcast_analytics_summary')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);

    if (analyticsError) {
      console.error('❌ Error fetching analytics summary:', analyticsError.message);
    } else {
      console.log(`\n📊 Analytics Summary Records: ${analyticsSummary?.length || 0}`);
      if (analyticsSummary && analyticsSummary.length > 0) {
        console.log('📋 Recent analytics:');
        analyticsSummary.forEach((analytics, index) => {
          console.log(`   ${index + 1}. Date: ${analytics.date}, Views: ${analytics.total_views || 0}`);
        });
      }
    }

    // Check sync sessions
    const { data: syncSessions, error: syncSessionsError } = await supabase
      .from('sync_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (syncSessionsError) {
      console.error('❌ Error fetching sync sessions:', syncSessionsError.message);
    } else {
      console.log(`\n📊 Sync Sessions: ${syncSessions?.length || 0}`);
      if (syncSessions && syncSessions.length > 0) {
        console.log('📋 Recent sync sessions:');
        syncSessions.forEach((session, index) => {
          console.log(`   ${index + 1}. ${session.trigger_type} - ${session.status} - ${new Date(session.created_at).toLocaleString()}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkExistingData();

