-- Fix Joe Rogan Podcast with Correct Playlist ID
-- This script will update the podcast with the correct YouTube playlist information

-- First, let's check what we currently have
SELECT 
    id,
    title,
    youtube_playlist_id,
    youtube_playlist_url,
    submission_status,
    total_episodes
FROM podcasts 
WHERE title = 'The Joe Rogan Experience';

-- Update Joe Rogan podcast with correct playlist information
-- Using the official Joe Rogan Experience playlist
UPDATE podcasts 
SET 
    youtube_playlist_id = 'PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T',
    youtube_playlist_url = 'https://www.youtube.com/playlist?list=PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T',
    submission_status = 'approved',
    total_episodes = 0,  -- Reset to force re-fetch
    updated_at = NOW()
WHERE title = 'The Joe Rogan Experience';

-- Alternative: If the above playlist doesn't work, try this one
-- (Uncomment if needed)
/*
UPDATE podcasts 
SET 
    youtube_playlist_id = 'PLrAXtmRdnEQy6nuLMOVF5w4LbLTUhUOcN',
    youtube_playlist_url = 'https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMOVF5w4LbLTUhUOcN',
    submission_status = 'approved',
    total_episodes = 0,
    updated_at = NOW()
WHERE title = 'The Joe Rogan Experience';
*/

-- Verify the update
SELECT 
    title,
    submission_status,
    youtube_playlist_id,
    youtube_playlist_url,
    total_episodes,
    updated_at
FROM podcasts 
WHERE title = 'The Joe Rogan Experience';

-- Check if there are any episodes currently
SELECT 
    p.title,
    COUNT(e.id) as episode_count
FROM podcasts p
LEFT JOIN episodes e ON p.id = e.podcast_id
WHERE p.title = 'The Joe Rogan Experience'
GROUP BY p.id, p.title;

-- Instructions for testing:
/*
TESTING STEPS:

1. Run this script to update Joe Rogan podcast
2. Go to Admin Panel → Data Sync Tab
3. Look for "The Joe Rogan Experience" in the podcast list
4. Check if it shows as "approved" and ready for sync
5. Run a manual sync
6. Check if episodes start appearing

ALTERNATIVE PLAYLIST IDs TO TRY:

If the current playlist doesn't work, try these:
- PLrAXtmRdnEQy6nuLMOVF5w4LbLTUhUOcN (Alternative JRE playlist)
- PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T (Current one)

MANUAL VERIFICATION:
- Visit: https://www.youtube.com/playlist?list=PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T
- Check if the playlist is public and accessible
- If not accessible, try the alternative playlist ID above

SYNC SERVER LOGS:
- Check sync server logs for any specific error messages
- Look for "Joe Rogan" or the playlist ID in error logs
- Check if YouTube API quota is exhausted
*/
