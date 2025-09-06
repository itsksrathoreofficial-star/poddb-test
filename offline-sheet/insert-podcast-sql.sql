-- SQL Code to Insert Podcast Data from JSON
-- Replace the JSON data below with your actual podcast data
-- This code handles max 3 categories and max 3 languages

-- Step 1: Insert Podcast Data
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
    gen_random_uuid(), -- Generate new UUID
    'Your Podcast Title Here', -- Replace with actual title
    'Your podcast description here. Make sure it is at least 100 words and describes the podcast content accurately.', -- Replace with actual description
    'https://example.com/cover-image.jpg', -- Replace with actual cover image URL
    'https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID', -- Replace with actual playlist URL
    'YOUR_PLAYLIST_ID', -- Replace with actual playlist ID
    ARRAY['Category1', 'Category2', 'Category3']::text[], -- Max 3 categories
    'en', -- Primary language (en, hi, etc.)
    'City, Country', -- Replace with actual location
    'https://yourpodcast.com', -- Replace with actual website
    '{
        "spotify": "https://open.spotify.com/show/your-show-id",
        "apple": "https://podcasts.apple.com/us/podcast/your-podcast/id1234567890",
        "jiosaavn": "https://www.jiosaavn.com/show/your-podcast/xyz123",
        "amazon": "https://music.amazon.com/podcasts/abc123/your-podcast",
        "other": [
            {
                "title": "Google Podcasts",
                "url": "https://podcasts.google.com/feed/abc123"
            }
        ]
    }'::jsonb, -- Replace with actual platform links
    '{
        "instagram": "https://instagram.com/yourpodcast",
        "youtube": "https://youtube.com/@yourpodcast",
        "x": "https://x.com/yourpodcast",
        "facebook": "https://facebook.com/yourpodcast",
        "linkedin": "https://linkedin.com/company/yourpodcast",
        "threads": "https://threads.net/@yourpodcast",
        "pinterest": "https://pinterest.com/yourpodcast",
        "other": [
            {
                "title": "TikTok",
                "url": "https://tiktok.com/@yourpodcast"
            }
        ]
    }'::jsonb, -- Replace with actual social links
    '[
        {
            "id": "team-member-1",
            "name": "Host Name",
            "roles": ["Host", "Producer"],
            "bio": "Host bio here. Make sure it is at least 50 words and describes the host accurately.",
            "photo_urls": ["https://example.com/host-photo.jpg"],
            "social_links": {
                "instagram": "https://instagram.com/hostname",
                "youtube": "https://youtube.com/@hostname",
                "x": "https://x.com/hostname",
                "facebook": "https://facebook.com/hostname",
                "linkedin": "https://linkedin.com/in/hostname",
                "threads": "https://threads.net/@hostname",
                "pinterest": "https://pinterest.com/hostname",
                "other": []
            }
        }
    ]'::jsonb, -- Replace with actual team members
    0, -- total_episodes (will be updated by YouTube API)
    0, -- total_views (will be updated by YouTube API)
    0, -- total_likes (will be updated by YouTube API)
    0, -- total_comments (will be updated by YouTube API)
    0, -- average_duration (will be updated by YouTube API)
    NULL, -- first_episode_date (will be updated by YouTube API)
    NULL, -- last_episode_date (will be updated by YouTube API)
    'pending'::submission_status, -- submission_status
    'your-user-id-here', -- Replace with actual user ID
    false, -- is_verified
    0.0, -- average_rating
    0, -- rating_count
    ARRAY['tag1', 'tag2', 'tag3']::text[], -- Replace with actual tags
    '{
        "meta_title": "Your SEO Title Here",
        "meta_description": "Your SEO description here. Make it compelling and under 160 characters.",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "og_title": "Your OG Title Here",
        "og_description": "Your OG description here for social sharing.",
        "og_image": "https://example.com/og-image.jpg"
    }'::jsonb, -- Replace with actual SEO metadata
    '{
        "title": "complete",
        "description": "complete",
        "cover_image_url": "complete",
        "categories": "complete",
        "platform_links": "complete",
        "social_links": "complete",
        "team_members": "complete"
    }'::jsonb, -- field_status
    NOW(), -- created_at
    NOW() -- updated_at
);

-- Step 2: Get the inserted podcast ID for reference
-- Run this query after inserting to get the podcast ID
SELECT id, title, created_at 
FROM podcasts 
WHERE title = 'Your Podcast Title Here' 
ORDER BY created_at DESC 
LIMIT 1;

-- Step 3: Insert People (if you have guest information)
-- Uncomment and modify the following if you have people data
/*
INSERT INTO people (
    id,
    full_name,
    bio,
    birth_date,
    location,
    website_url,
    photo_urls,
    social_links,
    is_verified,
    average_rating,
    rating_count,
    total_appearances,
    custom_fields,
    seo_metadata,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Guest Name',
    'Guest bio here. Make sure it is detailed and accurate.',
    '1990-01-01', -- Replace with actual birth date or NULL
    'City, Country', -- Replace with actual location or NULL
    'https://guestwebsite.com', -- Replace with actual website or NULL
    ARRAY['https://example.com/guest-photo.jpg'], -- Replace with actual photo URLs
    '{
        "instagram": "https://instagram.com/guestname",
        "youtube": "https://youtube.com/@guestname",
        "x": "https://x.com/guestname",
        "facebook": "https://facebook.com/guestname",
        "linkedin": "https://linkedin.com/in/guestname",
        "threads": "https://threads.net/@guestname",
        "pinterest": "https://pinterest.com/guestname",
        "other": []
    }'::jsonb,
    false, -- is_verified
    0.0, -- average_rating
    0, -- rating_count
    0, -- total_appearances
    '{
        "expertise": ["Expertise1", "Expertise2"],
        "institution": "Institution Name",
        "title": "Professional Title",
        "years_experience": 10
    }'::jsonb,
    '{
        "meta_title": "Guest Name - Professional Title",
        "meta_description": "Guest description for SEO",
        "keywords": ["keyword1", "keyword2"]
    }'::jsonb,
    NOW(),
    NOW()
);
*/

-- Step 4: Validation Queries
-- Run these to verify the data was inserted correctly

-- Check podcast data
SELECT 
    id,
    title,
    description,
    categories,
    language,
    location,
    submission_status,
    created_at
FROM podcasts 
WHERE title = 'Your Podcast Title Here'
ORDER BY created_at DESC;

-- Check categories (should be max 3)
SELECT 
    title,
    categories,
    array_length(categories, 1) as category_count
FROM podcasts 
WHERE title = 'Your Podcast Title Here'
ORDER BY created_at DESC;

-- Check team members
SELECT 
    title,
    jsonb_array_length(team_members) as team_member_count,
    team_members
FROM podcasts 
WHERE title = 'Your Podcast Title Here'
ORDER BY created_at DESC;

-- Check platform links
SELECT 
    title,
    platform_links
FROM podcasts 
WHERE title = 'Your Podcast Title Here'
ORDER BY created_at DESC;

-- Check social links
SELECT 
    title,
    social_links
FROM podcasts 
WHERE title = 'Your Podcast Title Here'
ORDER BY created_at DESC;

-- Step 5: Update Categories (if you need to modify)
-- Use this to update categories (max 3)
/*
UPDATE podcasts 
SET categories = ARRAY['NewCategory1', 'NewCategory2', 'NewCategory3']::text[]
WHERE title = 'Your Podcast Title Here';
*/

-- Step 6: Update Languages (if you need to modify)
-- Use this to update language
/*
UPDATE podcasts 
SET language = 'hi' -- or 'en', 'es', etc.
WHERE title = 'Your Podcast Title Here';
*/

-- Step 7: Delete Podcast (if you need to remove)
-- Use this to delete the podcast if needed
/*
DELETE FROM podcasts 
WHERE title = 'Your Podcast Title Here';
*/

-- Instructions for Use:
-- 1. Replace all placeholder values with actual data from your JSON
-- 2. Make sure categories array has maximum 3 items
-- 3. Ensure language is a valid language code
-- 4. Verify all URLs are correct and accessible
-- 5. Check that team member bios are at least 50 words
-- 6. Ensure podcast description is at least 100 words
-- 7. Run the validation queries to verify data integrity

