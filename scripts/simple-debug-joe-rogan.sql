-- Simple Debug for Joe Rogan Podcast
-- This script will check the basic issues without complex queries

-- Step 1: Check if Joe Rogan podcast exists and its basic info
SELECT 
    id,
    title,
    submission_status,
    youtube_playlist_id,
    total_episodes,
    created_at
FROM podcasts 
WHERE title = 'The Joe Rogan Experience'
ORDER BY created_at DESC;

-- Step 2: Check if episodes exist
SELECT 
    p.title,
    p.total_episodes,
    COUNT(e.id) as actual_episodes
FROM podcasts p
LEFT JOIN episodes e ON p.id = e.podcast_id
WHERE p.title = 'The Joe Rogan Experience'
GROUP BY p.id, p.title, p.total_episodes;

-- Step 3: Check sync readiness
SELECT 
    p.title,
    p.submission_status,
    p.youtube_playlist_id,
    p.total_episodes,
    CASE 
        WHEN p.submission_status = 'approved' AND p.youtube_playlist_id IS NOT NULL THEN '✅ Ready for sync'
        WHEN p.submission_status != 'approved' THEN '❌ Not approved - Status: ' || p.submission_status
        WHEN p.youtube_playlist_id IS NULL THEN '❌ No playlist ID'
        ELSE '⚠️ Check configuration'
    END as status
FROM podcasts p
WHERE p.title = 'The Joe Rogan Experience';

-- Step 4: Force update to ensure it's ready
UPDATE podcasts 
SET 
    submission_status = 'approved',
    total_episodes = 0,
    updated_at = NOW()
WHERE title = 'The Joe Rogan Experience';

-- Step 5: Verify the update
SELECT 
    title,
    submission_status,
    total_episodes,
    youtube_playlist_id,
    updated_at
FROM podcasts 
WHERE title = 'The Joe Rogan Experience';

-- Step 6: Check recent sync activity
SELECT 
    status,
    total_podcasts,
    successful_podcasts,
    failed_podcasts,
    created_at
FROM sync_sessions
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 3;

-- Instructions:
/*
NEXT STEPS:

1. Run this script to check Joe Rogan podcast status
2. If it shows "✅ Ready for sync", go to Admin Panel → Data Sync
3. Run a manual sync
4. Check if episodes appear

If still not working:
- Check if the YouTube playlist is accessible: 
  https://www.youtube.com/playlist?list=PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T
- Try a different playlist ID if this one doesn't work
- Check sync server logs for any error messages
*/



