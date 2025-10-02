-- Add Multiple Podcasts with Approved Status for Immediate Sync
-- All podcasts will be ready for data sync and episode fetching

-- PODCAST 1: The Joe Rogan Experience
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
    'https://youtube.com/playlist?list=PLk1Sqn_f33KuWf3tW9BBe_4TP7x8l0m3T',
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
            "bio": "Joe Rogan is an American podcaster, UFC color commentator, comedian, actor, and former television host. He hosts The Joe Rogan Experience, which is one of the most popular podcasts in the world with millions of listeners.",
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
    false, 0.0, 0, ARRAY['comedy', 'interviews', 'ufc', 'entertainment', 'joe-rogan']::text[],
    '{
        "meta_title": "The Joe Rogan Experience - Comedy & Interviews Podcast",
        "meta_description": "The Joe Rogan Experience is a podcast hosted by American comedian, presenter, and UFC color commentator Joe Rogan. One of the worlds most popular podcasts with millions of views per episode.",
        "keywords": ["comedy", "interviews", "entertainment", "ufc", "joe-rogan"],
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

-- PODCAST 2: HUGE Conversations
INSERT INTO podcasts (
    id, title, description, cover_image_url, youtube_playlist_url, youtube_playlist_id,
    categories, language, location, official_website, platform_links, social_links,
    team_members, total_episodes, total_views, total_likes, total_comments, 
    average_duration, first_episode_date, last_episode_date, submission_status,
    submitted_by, is_verified, average_rating, rating_count, tags, seo_metadata,
    field_status, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'HUGE Conversations',
    'HUGE Conversations is hosted by Cleo Abram, a video journalist who produces optimistic content about science and technology. If you want to know what the people building the future are imagining it will look like, Huge Conversations is the show for you.',
    'https://i.ytimg.com/vi/hqdefault/maxresdefault.jpg',
    'https://www.youtube.com/playlist?list=PLF-HhhjMki5mV1OrDe5YkVkS8UIi4lY7m',
    'PLF-HhhjMki5mV1OrDe5YkVkS8UIi4lY7m',
    ARRAY['Technology', 'Science', 'Education']::text[],
    'en', 'New York, USA', 'https://hugeconversations.com',
    '{
        "spotify": "https://open.spotify.com/show/36BlVngSlvbKW84Ntxeijy",
        "apple": "https://podcasts.apple.com/us/podcast/huge-conversations/id1729475841",
        "jiosaavn": "",
        "amazon": "",
        "other": []
    }'::jsonb,
    '{
        "instagram": "https://www.instagram.com/hugeconversations/",
        "youtube": "https://www.youtube.com/c/CleoAbram/about",
        "x": "https://x.com/cleoabram",
        "facebook": "",
        "linkedin": "https://www.linkedin.com/in/cleocabram",
        "threads": "https://www.threads.com/@cleoabram/",
        "pinterest": "",
        "other": []
    }'::jsonb,
    '[
        {
            "id": "team-member-huge-conversations",
            "name": "Cleo Abram",
            "roles": ["Host"],
            "bio": "Cleo Abram is a video journalist who produces Huge If True, an optimistic show about science and technology. Previously, Cleo was a video producer at Vox and directed for Explained on Netflix.",
            "photo_urls": [],
            "social_links": {
                "instagram": "https://www.instagram.com/cleoabram/",
                "youtube": "https://www.youtube.com/c/CleoAbram/about",
                "x": "https://x.com/cleoabram",
                "facebook": "",
                "linkedin": "https://www.linkedin.com/in/cleocabram",
                "threads": "https://www.threads.com/@cleoabram/",
                "pinterest": "",
                "other": []
            }
        }
    ]'::jsonb,
    0, 0, 0, 0, 0, NULL, NULL, 'approved'::submission_status, 'user-uuid-here',
    false, 0.0, 0, ARRAY['technology', 'science', 'future', 'optimistic', 'cleo-abram']::text[],
    '{
        "meta_title": "HUGE Conversations - Technology & Science Podcast",
        "meta_description": "HUGE Conversations is hosted by Cleo Abram, a video journalist who produces optimistic content about science and technology. Discover what the people building the future are imagining.",
        "keywords": ["technology", "science", "education", "future", "optimistic", "cleo-abram"],
        "og_title": "HUGE Conversations",
        "og_description": "HUGE Conversations is hosted by Cleo Abram, a video journalist who produces optimistic content about science and technology. Discover what the people building the future are imagining.",
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

-- PODCAST 3: The Tony Robbins Podcast
INSERT INTO podcasts (
    id, title, description, cover_image_url, youtube_playlist_url, youtube_playlist_id,
    categories, language, location, official_website, platform_links, social_links,
    team_members, total_episodes, total_views, total_likes, total_comments, 
    average_duration, first_episode_date, last_episode_date, submission_status,
    submitted_by, is_verified, average_rating, rating_count, tags, seo_metadata,
    field_status, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'The Tony Robbins Podcast',
    'Why live an ordinary life, when you can live an extraordinary one? Tony Robbins, the #1 Life and Business Strategist, has helped over 50 million people from 100 countries create real and lasting change in their lives. In this podcast, he shares proven strategies and tactics so you, too, can achieve massive results in your business, relationships, health and finances.',
    'https://i.ytimg.com/vi/hqdefault/maxresdefault.jpg',
    'https://www.youtube.com/playlist?list=PLYTXvUDQT5pWkFiK1Yal1WtPcMrVbmjzA',
    'PLYTXvUDQT5pWkFiK1Yal1WtPcMrVbmjzA',
    ARRAY['Business', 'Self-Improvement', 'Education']::text[],
    'en', 'USA', 'https://www.tonyrobbins.com',
    '{
        "spotify": "",
        "apple": "https://podcasts.apple.com/id/podcast/the-tony-robbins-podcast/id1098413063",
        "jiosaavn": "",
        "amazon": "",
        "other": []
    }'::jsonb,
    '{
        "instagram": "https://www.instagram.com/tonyrobbins/",
        "youtube": "https://www.youtube.com/channel/UCJLMboBYME_CLEfwsduI0wQ",
        "x": "",
        "facebook": "",
        "linkedin": "",
        "threads": "",
        "pinterest": "",
        "other": []
    }'::jsonb,
    '[
        {
            "id": "team-member-the-tony-robbins-podcast",
            "name": "Tony Robbins",
            "roles": ["Host"],
            "bio": "Tony Robbins is a #1 New York Times best-selling author, entrepreneur, philanthropist, and the nations #1 Life and Business Strategist. He has helped over 50 million people create real and lasting change in their lives.",
            "photo_urls": [],
            "social_links": {
                "instagram": "https://www.instagram.com/tonyrobbins/",
                "youtube": "https://www.youtube.com/channel/UCJLMboBYME_CLEfwsduI0wQ",
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
    false, 0.0, 0, ARRAY['motivation', 'success', 'business', 'life-coach', 'tony-robbins']::text[],
    '{
        "meta_title": "The Tony Robbins Podcast - Business & Self-Improvement",
        "meta_description": "Tony Robbins, the #1 Life and Business Strategist, shares proven strategies and tactics to help you achieve massive results in your business, relationships, health and finances.",
        "keywords": ["business", "self-improvement", "education", "motivation", "success", "tony-robbins"],
        "og_title": "The Tony Robbins Podcast",
        "og_description": "Tony Robbins, the #1 Life and Business Strategist, shares proven strategies and tactics to help you achieve massive results in your business, relationships, health and finances.",
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

-- Verification queries
SELECT 
    title,
    submission_status,
    youtube_playlist_id,
    created_at
FROM podcasts 
WHERE title IN ('The Joe Rogan Experience', 'HUGE Conversations', 'The Tony Robbins Podcast')
ORDER BY created_at DESC;

-- Check sync readiness
SELECT 
    p.title,
    p.submission_status,
    p.total_episodes,
    COUNT(e.id) as actual_episode_count,
    CASE 
        WHEN p.submission_status = 'approved' AND COUNT(e.id) = 0 THEN '✅ Ready for sync - no episodes yet'
        WHEN p.submission_status = 'approved' AND COUNT(e.id) > 0 THEN '⚠️ Episodes already exist - sync will update'
        WHEN p.submission_status = 'pending' THEN '❌ Not approved - sync will be skipped'
        ELSE '❓ Unknown status'
    END as sync_status
FROM podcasts p
LEFT JOIN episodes e ON p.id = e.podcast_id
WHERE p.title IN ('The Joe Rogan Experience', 'HUGE Conversations', 'The Tony Robbins Podcast')
GROUP BY p.id, p.title, p.submission_status, p.total_episodes
ORDER BY p.created_at DESC;

-- Instructions for next steps:
/*
NEXT STEPS:

1. Run this SQL script to add all three podcasts
2. Go to Admin Panel → Data Sync Tab
3. Click "Start Sync" or "Manual Sync"
4. The system will automatically:
   - Fetch all episodes from each YouTube playlist
   - Get views, likes, comments, and other stats
   - Update podcast totals
   - Sort episodes by published date
   - Assign proper episode numbers

5. After sync, verify episodes were created for each podcast:
   SELECT 
       p.title,
       COUNT(e.id) as episode_count,
       SUM(e.views) as total_views,
       SUM(e.likes) as total_likes
   FROM podcasts p
   LEFT JOIN episodes e ON p.id = e.podcast_id
   WHERE p.title IN ('The Joe Rogan Experience', 'HUGE Conversations', 'The Tony Robbins Podcast')
   GROUP BY p.id, p.title
   ORDER BY p.title;

6. Check individual episode details:
   SELECT 
       p.title as podcast_title,
       e.title as episode_title,
       e.episode_number,
       e.duration,
       e.views,
       e.likes,
       e.comments,
       e.published_at
   FROM episodes e
   JOIN podcasts p ON e.podcast_id = p.id
   WHERE p.title IN ('The Joe Rogan Experience', 'HUGE Conversations', 'The Tony Robbins Podcast')
   ORDER BY p.title, e.episode_number;
*/
