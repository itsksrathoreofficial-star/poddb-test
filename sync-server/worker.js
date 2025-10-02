const { parentPort, workerData } = require('worker_threads');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const { workerId, config } = workerData;

// Worker performance tracking
let processedTasks = 0;
let totalProcessingTime = 0;
let errors = 0;

// Handle messages from main thread
parentPort.on('message', async (task) => {
  const startTime = Date.now();
  
  try {
    const result = await processTask(task);
    
    const processingTime = Date.now() - startTime;
    processedTasks++;
    totalProcessingTime += processingTime;
    
    // Send result back to main thread
    parentPort.postMessage({
      taskId: task.id,
      result: result,
      processingTime: processingTime,
      workerId: workerId
    });
    
  } catch (error) {
    errors++;
    console.error(`Worker ${workerId} error:`, error);
    
    // Send error back to main thread
    parentPort.postMessage({
      taskId: task.id,
      error: error.message,
      workerId: workerId
    });
  }
});

// Process different types of tasks
async function processTask(task) {
  const { type, data } = task;
  
  switch (type) {
    case 'process_episodes':
      return await processEpisodes(data);
    case 'process_podcast':
      return await processPodcast(data);
    case 'bulk_insert':
      return await bulkInsert(data);
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

// Process episodes with ultra power
async function processEpisodes(data) {
  const { episodes, podcast, config } = data;
  
  try {
    // Validate episodes data
    const validatedEpisodes = episodes.map(episode => ({
      ...episode,
      created_at: episode.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      podcast_id: podcast.id
    }));
    
    // Bulk insert episodes
    const { error: insertError } = await supabase
      .from('episodes')
      .upsert(validatedEpisodes, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (insertError) {
      throw new Error(`Bulk insert error: ${insertError.message}`);
    }
    
    return {
      success: true,
      processed: episodes.length,
      podcast: podcast.title,
      workerId: workerId
    };
    
  } catch (error) {
    console.error(`Worker ${workerId} episode processing error:`, error);
    throw error;
  }
}

// Process podcast data
async function processPodcast(data) {
  const { podcast, config } = data;
  
  try {
    // Get episodes count
    const { count, error: countError } = await supabase
      .from('episodes')
      .select('*', { count: 'exact', head: true })
      .eq('podcast_id', podcast.id);
    
    if (countError) {
      throw new Error(`Error counting episodes: ${countError.message}`);
    }
    
    return {
      success: true,
      podcast: podcast.title,
      episodesCount: count || 0,
      workerId: workerId
    };
    
  } catch (error) {
    console.error(`Worker ${workerId} podcast processing error:`, error);
    throw error;
  }
}

// Bulk insert data
async function bulkInsert(data) {
  const { table, records, config } = data;
  
  try {
    const { error: insertError } = await supabase
      .from(table)
      .upsert(records, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (insertError) {
      throw new Error(`Bulk insert error: ${insertError.message}`);
    }
    
    return {
      success: true,
      processed: records.length,
      table: table,
      workerId: workerId
    };
    
  } catch (error) {
    console.error(`Worker ${workerId} bulk insert error:`, error);
    throw error;
  }
}

// Send worker stats periodically
setInterval(() => {
  parentPort.postMessage({
    type: 'stats',
    data: {
      workerId: workerId,
      processedTasks: processedTasks,
      totalProcessingTime: totalProcessingTime,
      averageProcessingTime: processedTasks > 0 ? totalProcessingTime / processedTasks : 0,
      errors: errors,
      memoryUsage: process.memoryUsage()
    }
  });
}, 5000); // Send stats every 5 seconds

// Handle worker termination
process.on('SIGTERM', () => {
  console.log(`Worker ${workerId} terminating...`);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(`Worker ${workerId} interrupted...`);
  process.exit(0);
});

console.log(`Worker ${workerId} started with config:`, config);
