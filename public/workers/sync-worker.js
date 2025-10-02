// Sync Worker for parallel processing
class SyncWorker {
  constructor() {
    this.isProcessing = false;
    this.setupMessageHandler();
  }

  setupMessageHandler() {
    self.onmessage = async (event) => {
      const { type, data } = event.data;
      
      try {
        switch (type) {
          case 'process_episodes':
            await this.processEpisodes(data);
            break;
          case 'process_podcast':
            await this.processPodcast(data);
            break;
          case 'validate_data':
            this.validateData(data);
            break;
          default:
            throw new Error(`Unknown message type: ${type}`);
        }
      } catch (error) {
        self.postMessage({
          type: 'error',
          data: {
            type: 'worker',
            message: error.message,
            error: error.stack
          }
        });
      }
    };
  }

  async processEpisodes({ podcastId, episodes, config }) {
    this.isProcessing = true;
    
    try {
      const results = [];
      const batchSize = config.batchSize || 100;
      
      // Process episodes in chunks
      for (let i = 0; i < episodes.length; i += batchSize) {
        const chunk = episodes.slice(i, i + batchSize);
        const processedChunk = await this.processEpisodeChunk(podcastId, chunk, config);
        results.push(...processedChunk);
        
        // Send progress update
        self.postMessage({
          type: 'progress',
          data: {
            processedEpisodes: i + chunk.length,
            totalEpisodes: episodes.length,
            currentPodcast: podcastId
          }
        });
      }

      self.postMessage({
        type: 'completed',
        data: {
          podcastId,
          processedCount: results.length,
          results
        }
      });

    } catch (error) {
      throw new Error(`Failed to process episodes: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  async processPodcast({ podcastId, config }) {
    try {
      // Fetch podcast data
      const podcastData = await this.fetchPodcastData(podcastId);
      
      // Fetch episodes
      const episodes = await this.fetchEpisodes(podcastId);
      
      // Process episodes
      const processedEpisodes = await this.processEpisodes({
        podcastId,
        episodes,
        config
      });

      return {
        podcast: podcastData,
        episodes: processedEpisodes
      };

    } catch (error) {
      throw new Error(`Failed to process podcast: ${error.message}`);
    }
  }

  async processEpisodeChunk(podcastId, episodes, config) {
    const processed = [];
    
    for (const episode of episodes) {
      try {
        // Validate episode data
        const validated = this.validateEpisode(episode);
        
        // Enrich episode data
        const enriched = await this.enrichEpisodeData(validated, podcastId);
        
        // Transform data for database
        const transformed = this.transformEpisodeData(enriched);
        
        processed.push(transformed);
        
      } catch (error) {
        self.postMessage({
          type: 'error',
          data: {
            type: 'episode',
            message: `Failed to process episode ${episode.title}`,
            error: error.message,
            podcastId,
            episodeId: episode.id
          }
        });
      }
    }
    
    return processed;
  }

  validateEpisode(episode) {
    const required = ['id', 'title', 'podcast_id'];
    
    for (const field of required) {
      if (!episode[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    return {
      ...episode,
      created_at: episode.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async enrichEpisodeData(episode, podcastId) {
    // Add additional processing here
    return {
      ...episode,
      podcast_id: podcastId,
      processed_at: new Date().toISOString()
    };
  }

  transformEpisodeData(episode) {
    // Transform data for database storage
    return {
      id: episode.id,
      title: episode.title,
      description: episode.description || '',
      podcast_id: episode.podcast_id,
      audio_url: episode.audio_url || '',
      duration: episode.duration || 0,
      published_at: episode.published_at || episode.created_at,
      created_at: episode.created_at,
      updated_at: episode.updated_at,
      is_processed: true
    };
  }

  async fetchPodcastData(podcastId) {
    // Mock implementation - replace with actual API call
    return {
      id: podcastId,
      title: `Podcast ${podcastId}`,
      rss_url: `https://example.com/podcast/${podcastId}/rss`
    };
  }

  async fetchEpisodes(podcastId) {
    // Mock implementation - replace with actual RSS parsing
    return [];
  }

  validateData(data) {
    // Validate data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure');
    }
    
    return true;
  }
}

// Initialize worker
new SyncWorker();
