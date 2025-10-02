-- FIX EPISODE NUMBERING
-- This script fixes episode numbering to show oldest episodes first

-- Step 1: Check current episode numbering
SELECT 
    'CURRENT EPISODE NUMBERING' as section,
    p.title as podcast_title,
    e.title as episode_title,
    e.episode_number,
    e.published_at,
    e.created_at
FROM episodes e
JOIN podcasts p ON e.podcast_id = p.id
WHERE p.submission_status = 'approved'
ORDER BY p.title, e.published_at
LIMIT 10;

-- Step 2: Fix episode numbering for each podcast
-- This will assign episode numbers based on published date (oldest first)
WITH numbered_episodes AS (
    SELECT 
        e.id,
        e.podcast_id,
        e.published_at,
        ROW_NUMBER() OVER (
            PARTITION BY e.podcast_id 
            ORDER BY e.published_at ASC, e.created_at ASC
        ) as new_episode_number
    FROM episodes e
    JOIN podcasts p ON e.podcast_id = p.id
    WHERE p.submission_status = 'approved'
)
UPDATE episodes 
SET episode_number = numbered_episodes.new_episode_number
FROM numbered_episodes
WHERE episodes.id = numbered_episodes.id;

-- Step 3: Verify the fix
SELECT 
    'AFTER FIX - EPISODE NUMBERING' as section,
    p.title as podcast_title,
    e.title as episode_title,
    e.episode_number,
    e.published_at,
    e.created_at
FROM episodes e
JOIN podcasts p ON e.podcast_id = p.id
WHERE p.submission_status = 'approved'
ORDER BY p.title, e.episode_number
LIMIT 10;

-- Step 4: Check episode count per podcast
SELECT 
    'EPISODE COUNT PER PODCAST' as section,
    p.title as podcast_title,
    COUNT(e.id) as total_episodes,
    MIN(e.episode_number) as first_episode_number,
    MAX(e.episode_number) as last_episode_number
FROM podcasts p
LEFT JOIN episodes e ON p.id = e.podcast_id
WHERE p.submission_status = 'approved'
GROUP BY p.id, p.title
HAVING COUNT(e.id) > 0
ORDER BY p.title
LIMIT 10;

-- Step 5: Success message
SELECT 'Episode numbering fix applied! Episodes are now numbered by published date (oldest first).' as status;
