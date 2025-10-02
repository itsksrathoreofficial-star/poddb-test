-- Test Script for SQL Podcast Insert and Sync
-- This script tests the complete flow: SQL insert → admin sync → episode fetching

-- Step 1: Insert a test podcast using the updated SQL
INSERT INTO podcasts (
    id,
    title,
    description,
    cover_image_url,
    youtube_playlist_url,
    youtube_playlist_id,
    categories,
    language,
    location,
    official_website,
    platform_links,
    social_links,
    team_members,
    total_episodes,
    total_views,
    total_likes,
    total_comments,
    average_duration,
    first_episode_date,
    last_episode_date,
    submission_status,
    submitted_by,
    is_verified,
    average_rating,
    rating_count,
    tags,
    seo_metadata,
    field_status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Test Podcast for Sync Verification',
    'This is a test podcast to verify that the SQL insert and sync functionality works correctly. The podcast should be automatically approved and episodes should be fetched during the next sync run.',
    'https://example.com/test-cover.jpg',
    'https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMOVF5w4LbLTUhUOcN', -- Replace with actual test playlist
    'PLrAXtmRdnEQy6nuLMOVF5w4LbLTUhUOcN', -- Replace with actual test playlist ID
    ARRAY['Technology', 'Testing', 'Development']::text[],
    'en',
    'Test City, Test Country',
    'https://testpodcast.example.com',
    '{
        "spotify": "https://open.spotify.com/show/test-show-id",
        "apple": "https://podcasts.apple.com/us/podcast/test-podcast/id1234567890",
        "jiosaavn": "https://www.jiosaavn.com/show/test-podcast/xyz123",
        "amazon": "https://music.amazon.com/podcasts/abc123/test-podcast",
        "other": []
    }'::jsonb,
    '{
        "instagram": "https://instagram.com/testpodcast",
        "youtube": "https://youtube.com/@testpodcast",
        "x": "https://x.com/testpodcast",
        "facebook": "https://facebook.com/testpodcast",
        "linkedin": "https://linkedin.com/company/testpodcast",
        "threads": "https://threads.net/@testpodcast",
        "pinterest": "https://pinterest.com/testpodcast",
        "other": []
    }'::jsonb,
    '[
        {
            "id": "test-host-1",
            "name": "Test Host",
            "roles": ["Host", "Producer"],
            "bio": "This is a test host bio for the sync verification test. The bio should be detailed and accurate for testing purposes.",
            "photo_urls": ["https://example.com/test-host-photo.jpg"],
            "social_links": {
                "instagram": "https://instagram.com/testhost",
                "youtube": "https://youtube.com/@testhost",
                "x": "https://x.com/testhost",
                "facebook": "https://facebook.com/testhost",
                "linkedin": "https://linkedin.com/in/testhost",
                "threads": "https://threads.net/@testhost",
                "pinterest": "https://pinterest.com/testhost",
                "other": []
            }
        }
    ]'::jsonb,
    0, -- total_episodes (will be updated by sync)
    0, -- total_views (will be updated by sync)
    0, -- total_likes (will be updated by sync)
    0, -- total_comments (will be updated by sync)
    0, -- average_duration (will be updated by sync)
    NULL, -- first_episode_date (will be updated by sync)
    NULL, -- last_episode_date (will be updated by sync)
    'approved'::submission_status, -- submission_status (set to approved for immediate sync)
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    false, -- is_verified
    0.0, -- average_rating
    0, -- rating_count
    ARRAY['test', 'sync', 'verification']::text[],
    '{
        "meta_title": "Test Podcast for Sync Verification",
        "meta_description": "Test podcast description for SEO verification testing.",
        "keywords": ["test", "sync", "verification", "podcast"],
        "og_title": "Test Podcast for Sync Verification",
        "og_description": "Test podcast description for social sharing verification.",
        "og_image": "https://example.com/test-og-image.jpg"
    }'::jsonb,
    '{
        "title": "complete",
        "description": "complete",
        "cover_image_url": "complete",
        "categories": "complete",
        "platform_links": "complete",
        "social_links": "complete",
        "team_members": "complete"
    }'::jsonb,
    NOW(),
    NOW()
);

-- Step 2: Get the inserted podcast ID for verification
SELECT 
    id, 
    title, 
    submission_status, 
    total_episodes,
    youtube_playlist_id,
    created_at 
FROM podcasts 
WHERE title = 'Test Podcast for Sync Verification' 
ORDER BY created_at DESC 
LIMIT 1;

-- Step 3: Verify the podcast was inserted with correct status
SELECT 
    title,
    submission_status,
    total_episodes,
    youtube_playlist_id,
    CASE 
        WHEN submission_status = 'approved' THEN '✅ Podcast is approved and ready for sync'
        ELSE '❌ Podcast is not approved - sync will be skipped'
    END as sync_status
FROM podcasts 
WHERE title = 'Test Podcast for Sync Verification'
ORDER BY created_at DESC;

-- Step 4: Check if episodes exist (should be 0 initially)
SELECT 
    p.title,
    p.total_episodes,
    COUNT(e.id) as actual_episode_count,
    CASE 
        WHEN COUNT(e.id) = 0 THEN '✅ No episodes yet - ready for first sync'
        ELSE '⚠️ Episodes already exist - sync will update existing data'
    END as episode_status
FROM podcasts p
LEFT JOIN episodes e ON p.id = e.podcast_id
WHERE p.title = 'Test Podcast for Sync Verification'
GROUP BY p.id, p.title, p.total_episodes;

-- Step 5: Instructions for testing
/*
TESTING INSTRUCTIONS:

1. Run this SQL script to insert the test podcast
2. Go to the admin panel and trigger a data sync
3. Check the sync logs to see if the podcast is processed
4. Verify that episodes are fetched and inserted
5. Run the verification queries below after sync

VERIFICATION QUERIES (run after sync):

-- Check if episodes were created
SELECT 
    p.title as podcast_title,
    p.total_episodes,
    COUNT(e.id) as actual_episodes,
    MIN(e.published_at) as first_episode_date,
    MAX(e.published_at) as last_episode_date
FROM podcasts p
LEFT JOIN episodes e ON p.id = e.podcast_id
WHERE p.title = 'Test Podcast for Sync Verification'
GROUP BY p.id, p.title, p.total_episodes;

-- Check episode details
SELECT 
    e.title,
    e.episode_number,
    e.duration,
    e.views,
    e.likes,
    e.comments,
    e.published_at
FROM episodes e
JOIN podcasts p ON e.podcast_id = p.id
WHERE p.title = 'Test Podcast for Sync Verification'
ORDER BY e.episode_number;

-- Check sync session logs
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
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 5;

CLEANUP (run after testing):
DELETE FROM episodes WHERE podcast_id IN (
    SELECT id FROM podcasts WHERE title = 'Test Podcast for Sync Verification'
);
DELETE FROM podcasts WHERE title = 'Test Podcast for Sync Verification';
*/
