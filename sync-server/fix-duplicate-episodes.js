const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDuplicateEpisodes() {
  console.log('🔍 Checking for duplicate episodes...');
  
  try {
    // Find episodes with duplicate slugs
    const { data: duplicates, error } = await supabase
      .from('episodes')
      .select('slug, id, title, podcast_id, created_at')
      .order('slug')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching episodes:', error);
      return;
    }

    // Group by slug to find duplicates
    const slugGroups = {};
    duplicates.forEach(episode => {
      if (!slugGroups[episode.slug]) {
        slugGroups[episode.slug] = [];
      }
      slugGroups[episode.slug].push(episode);
    });

    const duplicateSlugs = Object.keys(slugGroups).filter(slug => slugGroups[slug].length > 1);
    
    console.log(`Found ${duplicateSlugs.length} duplicate slug groups`);

    let fixedCount = 0;
    for (const slug of duplicateSlugs) {
      const episodes = slugGroups[slug];
      console.log(`\n📝 Fixing slug: "${slug}" (${episodes.length} episodes)`);
      
      // Keep the first episode, update slugs for the rest
      for (let i = 1; i < episodes.length; i++) {
        const episode = episodes[i];
        const newSlug = `${slug}-${Date.now()}-${i}`;
        
        console.log(`  Updating episode ${episode.id}: "${episode.title}" -> "${newSlug}"`);
        
        const { error: updateError } = await supabase
          .from('episodes')
          .update({ slug: newSlug })
          .eq('id', episode.id);
        
        if (updateError) {
          console.error(`  ❌ Error updating episode ${episode.id}:`, updateError.message);
        } else {
          console.log(`  ✅ Updated episode ${episode.id}`);
          fixedCount++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} duplicate episodes!`);
    
  } catch (error) {
    console.error('Error fixing duplicate episodes:', error);
  }
}

// Run the fix
fixDuplicateEpisodes();
