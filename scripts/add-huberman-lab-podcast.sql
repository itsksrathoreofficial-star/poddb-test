-- Add Huberman Lab Podcast with specific UUID and approved status
-- This will be ready for immediate sync and episode fetching

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
    '05995722-6e50-46af-8405-4267db726472', -- Your specified UUID
    'Huberman Lab',
    'The Huberman Lab podcast is hosted by Andrew Huberman, Ph.D., a neuroscientist and tenured professor in the department of neurobiology, and by courtesy, psychiatry and behavioral sciences at Stanford School of Medicine. The podcast discusses neuroscience and science-based tools for everyday life.',
    'https://i.ytimg.com/vi/hqdefault/maxresdefault.jpg',
    'https://www.youtube.com/playlist?list=PLPNW_gerXa4Pc8S2qoUQc5e8Ir97RLuVW',
    'PLPNW_gerXa4Pc8S2qoUQc5e8Ir97RLuVW',
    ARRAY['Science', 'Health', 'Education']::text[],
    'en',
    'Stanford, California, USA',
    'https://www.hubermanlab.com',
    '{
        "spotify": "https://open.spotify.com/show/79CkJF3UJTHFV8Dse3Oy0P",
        "apple": "https://podcasts.apple.com/us/podcast/huberman-lab/id1545953110",
        "jiosaavn": "",
        "amazon": "",
        "other": []
    }'::jsonb,
    '{
        "instagram": "https://www.instagram.com/hubermanlab/",
        "youtube": "https://www.youtube.com/@hubermanlab",
        "x": "https://x.com/hubermanlab",
        "facebook": "",
        "linkedin": "https://www.linkedin.com/in/andrew-huberman",
        "threads": "",
        "pinterest": "",
        "other": []
    }'::jsonb,
    '[
        {
            "id": "team-member-huberman-lab",
            "name": "Andrew Huberman",
            "roles": ["Host"],
            "bio": "Andrew Huberman, Ph.D., is a neuroscientist and tenured professor in the department of neurobiology, and by courtesy, psychiatry and behavioral sciences at Stanford School of Medicine. He has made numerous important contributions to the fields of brain development, brain function, and neural plasticity.",
            "photo_urls": [],
            "social_links": {
                "instagram": "https://www.instagram.com/hubermanlab/",
                "youtube": "",
                "x": "https://x.com/hubermanlab",
                "facebook": "",
                "linkedin": "https://www.linkedin.com/in/andrew-huberman",
                "threads": "",
                "pinterest": "",
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
    'approved'::submission_status, -- APPROVED status for immediate sync
    '05995722-6e50-46af-8405-4267db726472', -- Using same UUID as submitted_by
    false, -- is_verified
    0.0, -- average_rating
    0, -- rating_count
    ARRAY['neuroscience', 'health', 'science', 'stanford', 'brain', 'wellness']::text[],
    '{
        "meta_title": "Huberman Lab - Neuroscience & Health Podcast",
        "meta_description": "The Huberman Lab podcast is hosted by Andrew Huberman, Ph.D., a neuroscientist and tenured professor at Stanford School of Medicine. The podcast discusses neuroscience and science-based tools for everyday life.",
        "keywords": ["neuroscience", "health", "science", "stanford", "brain", "wellness", "andrew huberman"],
        "og_title": "Huberman Lab - Neuroscience & Health Podcast",
        "og_description": "The Huberman Lab podcast is hosted by Andrew Huberman, Ph.D., a neuroscientist and tenured professor at Stanford School of Medicine. The podcast discusses neuroscience and science-based tools for everyday life.",
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
    NOW(),
    NOW()
);

-- Verify the podcast was inserted correctly
SELECT 
    id,
    title,
    submission_status,
    total_episodes,
    youtube_playlist_id,
    created_at
FROM podcasts 
WHERE id = '05995722-6e50-46af-8405-4267db726472';

-- Check if episodes exist (should be 0 initially)
SELECT 
    p.title,
    p.total_episodes,
    COUNT(e.id) as actual_episode_count,
    CASE 
        WHEN COUNT(e.id) = 0 THEN '✅ Ready for sync - no episodes yet'
        ELSE '⚠️ Episodes already exist'
    END as sync_status
FROM podcasts p
LEFT JOIN episodes e ON p.id = e.podcast_id
WHERE p.id = '05995722-6e50-46af-8405-4267db726472'
GROUP BY p.id, p.title, p.total_episodes;

-- Instructions for next steps:
/*
NEXT STEPS:

1. Run this SQL script to add the Huberman Lab podcast
2. Go to Admin Panel → Data Sync Tab
3. Click "Start Sync" or "Manual Sync"
4. The system will automatically:
   - Fetch all episodes from the YouTube playlist
   - Get views, likes, comments, and other stats
   - Update podcast totals
   - Sort episodes by published date
   - Assign proper episode numbers

5. After sync, verify episodes were created:
   SELECT COUNT(*) as episode_count FROM episodes 
   WHERE podcast_id = '05995722-6e50-46af-8405-4267db726472';

6. Check episode details:
   SELECT title, episode_number, duration, views, likes, comments, published_at
   FROM episodes 
   WHERE podcast_id = '05995722-6e50-46af-8405-4267db726472'
   ORDER BY episode_number;
*/
