/**
 * Setup script for error tracking system
 * This script will create the necessary database tables and functions
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupErrorTracking() {
  console.log('🚀 Setting up Error Tracking System...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250121000000_create_error_tracking_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            // If exec_sql doesn't exist, try direct query
            const { error: directError } = await supabase
              .from('error_logs')
              .select('id')
              .limit(1);
            
            if (directError && directError.code === 'PGRST116') {
              // Table doesn't exist, try to create it
              console.log('📋 Creating tables and functions...');
              
              // Execute the full migration
              const { error: migrationError } = await supabase
                .rpc('exec', { sql: migrationSQL });
              
              if (migrationError) {
                console.log('⚠️  Migration error (this might be expected):', migrationError.message);
              }
            }
          }
        } catch (stmtError) {
          console.log(`⚠️  Statement ${i + 1} error (might be expected):`, stmtError.message);
        }
      }
    }

    // Verify the setup
    console.log('\n🔍 Verifying setup...');

    // Check if error_logs table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['error_logs', 'error_notifications', 'error_analytics']);

    if (tableError) {
      console.log('❌ Could not verify tables:', tableError.message);
    } else {
      console.log('✅ Tables found:', tables.map(t => t.table_name));
    }

    // Test the functions
    try {
      const { data: stats, error: statsError } = await supabase.rpc('get_error_statistics');
      
      if (statsError) {
        console.log('❌ get_error_statistics function not found:', statsError.message);
        console.log('📝 You may need to run the migration manually in Supabase Dashboard');
      } else {
        console.log('✅ get_error_statistics function working');
      }
    } catch (funcError) {
      console.log('❌ Function test failed:', funcError.message);
    }

    console.log('\n🎉 Setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check Supabase Dashboard for any errors');
    console.log('2. Run the migration manually if needed');
    console.log('3. Test the error tracking system');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n🔧 Manual setup required:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy and paste the migration SQL');
    console.log('4. Execute the migration');
  }
}

// Run the setup
if (require.main === module) {
  setupErrorTracking();
}

module.exports = { setupErrorTracking };
