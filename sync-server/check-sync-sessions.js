const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSyncSessions() {
  try {
    console.log('🔍 Checking sync sessions table structure and data...\n');

    // Get recent sync sessions with all fields
    const { data: sessions, error: sessionsError } = await supabase
      .from('sync_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (sessionsError) {
      console.error('❌ Error fetching sync sessions:', sessionsError.message);
      return;
    }

    console.log(`📊 Found ${sessions?.length || 0} recent sync sessions:\n`);

    if (sessions && sessions.length > 0) {
      sessions.forEach((session, index) => {
        console.log(`Session ${index + 1}:`);
        console.log(`  ID: ${session.id}`);
        console.log(`  Trigger Type: ${session.trigger_type || 'undefined'}`);
        console.log(`  Status: ${session.status}`);
        console.log(`  Started: ${session.started_at ? new Date(session.started_at).toLocaleString() : 'N/A'}`);
        console.log(`  Completed: ${session.completed_at ? new Date(session.completed_at).toLocaleString() : 'N/A'}`);
        console.log(`  Total Podcasts: ${session.total_podcasts || 0}`);
        console.log(`  Successful: ${session.successful_podcasts || 0}`);
        console.log(`  Failed: ${session.failed_podcasts || 0}`);
        console.log(`  Total Episodes: ${session.total_episodes || 0}`);
        console.log(`  Successful Episodes: ${session.successful_episodes || 0}`);
        console.log(`  Error Message: ${session.error_message || 'None'}`);
        console.log('');
      });
    }

    // Test creating a new sync session
    console.log('🧪 Testing sync session creation...');
    const testSession = {
      trigger_type: 'test',
      status: 'running',
      started_at: new Date().toISOString(),
      total_podcasts: 0,
      successful_podcasts: 0,
      failed_podcasts: 0,
      total_episodes: 0,
      successful_episodes: 0,
      failed_episodes: 0
    };

    const { data: newSession, error: createError } = await supabase
      .from('sync_sessions')
      .insert(testSession)
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Error creating test session:', createError.message);
    } else {
      console.log('✅ Test session created successfully:');
      console.log(`  ID: ${newSession.id}`);
      console.log(`  Trigger Type: ${newSession.trigger_type}`);
      console.log(`  Status: ${newSession.status}`);

      // Clean up test session
      await supabase
        .from('sync_sessions')
        .delete()
        .eq('id', newSession.id);
      console.log('🧹 Test session cleaned up');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSyncSessions();

