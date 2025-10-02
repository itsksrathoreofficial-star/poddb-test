-- Re-add Joe Rogan Podcast with Correct Configuration
-- This will delete the existing one and add a fresh copy

-- Step 1: Delete existing Joe Rogan podcast and episodes
DELETE FROM episodes WHERE podcast_id IN (
    SELECT id FROM podcasts WHERE title = 'The Joe Rogan Experience'
);

DELETE FROM podcasts WHERE title = 'The Joe Rogan Experience';

-- Step 2: Add Joe Rogan podcast with correct configuration
INSERT INTO podcasts (
    id, title, description, cover_image_url, youtube_playlist_url, youtube_playlist_id,
    categories, language, location, official_website, platform_links, social_links,
    team_members, total_episodes, total_views, total_likes, total_comments, 
    average_duration, first_episode_date, last_episode_date, submission_status,
    submitted_by, is_verified, average_rating, rating_count, tags, seo_metadata,
    field_status, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'The Joe Rogan Experience',
    'The Joe Rogan Experience is a podcast hosted by American comedian, presenter, and UFC color commentator Joe Rogan. It was initiated on December 24, 2009, on YouTube by Rogan and comedian Brian Redban. By 2015, it was one of the worlds most popular podcasts, regularly receiving millions of views per episode.',
    'https://i.ytimg.com/vi/hqdefault/maxresdefault.jpg',
    'https://www.youtube.com/playlist?list=PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T',
    'PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T',
    ARRAY['Comedy', 'Interviews', 'Entertainment']::text[],
    'en', 'Austin, Texas, USA', 'https://www.joerogan.com',
    '{
        "spotify": "https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk",
        "apple": "https://podcasts.apple.com/us/podcast/the-joe-rogan-experience/id360084272",
        "jiosaavn": "",
        "amazon": "",
        "other": []
    }'::jsonb,
    '{
        "instagram": "https://www.instagram.com/joerogan/",
        "youtube": "https://www.youtube.com/@joerogan/videos",
        "x": "",
        "facebook": "",
        "linkedin": "",
        "threads": "",
        "pinterest": "",
        "other": []
    }'::jsonb,
    '[
        {
            "id": "team-member-the-joe-rogan-experience",
            "name": "Joe Rogan",
            "roles": ["Host"],
            "bio": "Joe Rogan is an American podcaster, UFC color commentator, comedian, actor, and former television host. He hosts The Joe Rogan Experience, which is one of the most popular podcasts in the world with millions of listeners worldwide.",
            "photo_urls": [],
            "social_links": {
                "instagram": "https://www.instagram.com/joerogan/",
                "youtube": "https://www.youtube.com/@joerogan/videos",
                "x": "",
                "facebook": "",
                "linkedin": "",
                "threads": "",
                "pinterest": "",
                "other": []
            }
        }
    ]'::jsonb,
    0, 0, 0, 0, 0, NULL, NULL, 'approved'::submission_status, 'user-uuid-here',
    false, 0.0, 0, ARRAY['comedy', 'interviews', 'ufc', 'entertainment', 'joe-rogan', 'podcast']::text[],
    '{
        "meta_title": "The Joe Rogan Experience - Comedy & Interviews Podcast",
        "meta_description": "The Joe Rogan Experience is a podcast hosted by American comedian, presenter, and UFC color commentator Joe Rogan. One of the worlds most popular podcasts with millions of views per episode.",
        "keywords": ["comedy", "interviews", "entertainment", "ufc", "joe-rogan", "podcast"],
        "og_title": "The Joe Rogan Experience",
        "og_description": "The Joe Rogan Experience is a podcast hosted by American comedian, presenter, and UFC color commentator Joe Rogan. One of the worlds most popular podcasts with millions of views per episode.",
        "og_image": "https://i.ytimg.com/vi/hqdefault/maxresdefault.jpg"
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
    NOW(), NOW()
);

-- Step 3: Verify the new podcast was added correctly
SELECT 
    id,
    title,
    submission_status,
    youtube_playlist_id,
    youtube_playlist_url,
    total_episodes,
    created_at
FROM podcasts 
WHERE title = 'The Joe Rogan Experience'
ORDER BY created_at DESC;

-- Step 4: Check sync readiness
SELECT 
    p.title,
    p.submission_status,
    p.youtube_playlist_id,
    p.total_episodes,
    CASE 
        WHEN p.submission_status = 'approved' AND p.youtube_playlist_id IS NOT NULL THEN '✅ Ready for sync'
        WHEN p.submission_status != 'approved' THEN '❌ Not approved'
        WHEN p.youtube_playlist_id IS NULL THEN '❌ No playlist ID'
        ELSE '⚠️ Check configuration'
    END as sync_status
FROM podcasts p
WHERE p.title = 'The Joe Rogan Experience';

-- Step 5: Test the playlist URL manually
SELECT 
    'https://www.youtube.com/playlist?list=PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T' as playlist_url,
    'PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T' as playlist_id,
    'Test this URL in browser to verify it works' as instruction;

-- Instructions for next steps:
/*
NEXT STEPS:

1. Run this script to completely re-add Joe Rogan podcast
2. Verify the podcast appears in the database with correct settings
3. Go to Admin Panel → Data Sync Tab
4. Look for "The Joe Rogan Experience" in the podcast list
5. Run a manual sync
6. Check if episodes start appearing

TROUBLESHOOTING:

If still not working, check:

1. **Playlist Accessibility**:
   - Visit: https://www.youtube.com/playlist?list=PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T
   - Make sure the playlist is public and accessible

2. **Sync Server Logs**:
   - Check sync server logs for any error messages
   - Look for YouTube API quota issues

3. **Alternative Playlist**:
   - If the current playlist doesn't work, try finding another Joe Rogan playlist
   - Update the youtube_playlist_id with a working one

4. **Manual Test**:
   - Try adding a different podcast with a known working playlist
   - If that works, the issue is specific to Joe Rogan's playlist

VERIFICATION QUERIES (run after sync):

-- Check if episodes were created
SELECT 
    p.title,
    COUNT(e.id) as episode_count,
    SUM(e.views) as total_views,
    SUM(e.likes) as total_likes
FROM podcasts p
LEFT JOIN episodes e ON p.id = e.podcast_id
WHERE p.title = 'The Joe Rogan Experience'
GROUP BY p.id, p.title;

-- Check episode details
SELECT 
    e.title,
    e.episode_number,
    e.duration,
    e.views,
    e.likes,
    e.published_at
FROM episodes e
JOIN podcasts p ON e.podcast_id = p.id
WHERE p.title = 'The Joe Rogan Experience'
ORDER BY e.episode_number
LIMIT 10;
*/



