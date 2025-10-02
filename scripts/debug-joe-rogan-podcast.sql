-- Debug Joe Rogan Podcast Sync Issue
-- Check why Joe Rogan podcast data didn't fetch

-- Step 1: Check if Joe Rogan podcast exists and its status
SELECT 
    id,
    title,
    submission_status,
    youtube_playlist_id,
    youtube_playlist_url,
    total_episodes,
    created_at,
    updated_at
FROM podcasts 
WHERE title = 'The Joe Rogan Experience'
ORDER BY created_at DESC;

-- Step 2: Check if episodes exist for Joe Rogan
SELECT 
    p.title as podcast_title,
    p.total_episodes,
    COUNT(e.id) as actual_episode_count,
    p.youtube_playlist_id
FROM podcasts p
LEFT JOIN episodes e ON p.id = e.podcast_id
WHERE p.title = 'The Joe Rogan Experience'
GROUP BY p.id, p.title, p.total_episodes, p.youtube_playlist_id;

-- Step 3: Check recent sync sessions for errors
SELECT 
    status,
    total_podcasts,
    successful_podcasts,
    failed_podcasts,
    total_episodes,
    successful_episodes,
    failed_episodes,
    created_at,
    completed_at
FROM sync_sessions
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Check if there are any specific errors for Joe Rogan
SELECT 
    p.title,
    p.youtube_playlist_id,
    p.submission_status,
    CASE 
        WHEN p.youtube_playlist_id IS NULL THEN '❌ No YouTube Playlist ID'
        WHEN p.submission_status != 'approved' THEN '❌ Not Approved - Status: ' || p.submission_status
        WHEN p.total_episodes = 0 THEN '⚠️ No episodes fetched yet'
        ELSE '✅ Should be working'
    END as issue_diagnosis
FROM podcasts p
WHERE p.title = 'The Joe Rogan Experience';

-- Step 5: Test YouTube Playlist ID manually
-- Check if the playlist ID is valid
SELECT 
    'PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T' as playlist_id,
    'https://youtube.com/playlist?list=PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T' as playlist_url,
    'This is the playlist ID from the insert script' as note;

-- Step 6: Check if there are any sync logs or errors
-- (This would require checking the sync server logs, but we can check database for clues)

-- Step 7: Force update Joe Rogan podcast to ensure it's ready for sync
UPDATE podcasts 
SET 
    submission_status = 'approved',
    total_episodes = 0,  -- Reset to 0 to force re-fetch
    updated_at = NOW()
WHERE title = 'The Joe Rogan Experience';

-- Step 8: Verify the update
SELECT 
    title,
    submission_status,
    total_episodes,
    youtube_playlist_id,
    updated_at
FROM podcasts 
WHERE title = 'The Joe Rogan Experience';

-- Instructions for manual testing:
/*
POSSIBLE ISSUES AND SOLUTIONS:

1. **Playlist ID Issue**: 
   - The playlist ID might be incorrect or the playlist might be private
   - Check: https://youtube.com/playlist?list=PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T

2. **Sync Server Issue**:
   - The sync server might have encountered an error
   - Check sync server logs for specific error messages

3. **YouTube API Quota**:
   - The API might have hit quota limits
   - Check if other podcasts are also not syncing

4. **Playlist Access**:
   - The playlist might be private or restricted
   - Try accessing it manually in browser

NEXT STEPS:

1. Run this debug script to identify the issue
2. Check the YouTube playlist URL manually
3. If playlist is accessible, try running sync again
4. If still not working, check sync server logs
5. Consider updating the playlist ID if it's incorrect

MANUAL SYNC TEST:
- Go to Admin Panel → Data Sync Tab
- Look for Joe Rogan in the podcast list
- Check if it shows any error messages
- Try running a manual sync specifically for this podcast
*/
