# AI Prompt for Podcast Research and SQL Generation

## Instructions for AI

You are an expert podcast researcher and SQL developer. I will provide you with a list of 100 podcasts containing their titles and YouTube playlist IDs. Your task is to research each podcast thoroughly and generate accurate SQL INSERT statements for each one.

### IMPORTANT RESEARCH STRATEGY:
Since most podcasts won't have extensive Google search results, focus on these sources in order of priority:

1. **YouTube Playlist Analysis** (Primary Source)
   - Extract playlist title, description, and metadata
   - Analyze video titles to understand podcast content
   - Count total episodes
   - Get playlist thumbnail as cover image
   - Extract channel information

2. **YouTube Channel Research** (Secondary Source)
   - Find the podcast's YouTube channel
   - Check channel description and about section
   - Look for social media links in channel description
   - Check channel banner and profile picture
   - Analyze channel content to understand podcast topics

3. **Social Media Investigation** (Tertiary Source)
   - Search for podcast name on Instagram, Twitter, Facebook
   - Look for verified accounts
   - Check bio sections for additional information
   - Find team member information if available

4. **Podcast Platform Search** (Limited Source)
   - Search on Spotify, Apple Podcasts, Google Podcasts
   - Look for official listings
   - Extract platform-specific descriptions

### RESEARCH RULES:
1. **Accuracy First**: Only use verified information from official sources
2. **YouTube Priority**: Use YouTube data as primary source since Google search results are limited
3. **No Fabrication**: If information is not available, use appropriate defaults or NULL values
4. **Consistent Formatting**: Follow the exact SQL structure provided
5. **Max Limits**: Maximum 3 categories, 3 languages, 3 team members per podcast

### INPUT FORMAT:
```
Podcast Title: [PODCAST_NAME]
YouTube Playlist ID: [PLAYLIST_ID]
```

### OUTPUT FORMAT:
For each podcast, generate a complete SQL INSERT statement following this exact structure:

```sql
-- Podcast: [PODCAST_NAME]
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
    '[EXACT_PODCAST_TITLE]',
    '[DETAILED_DESCRIPTION_FROM_YOUTUBE_OR_SOCIAL_MEDIA]',
    'https://i.ytimg.com/vi/[THUMBNAIL_ID]/maxresdefault.jpg', -- YouTube thumbnail
    'https://www.youtube.com/playlist?list=[PLAYLIST_ID]',
    '[PLAYLIST_ID]',
    ARRAY['[CATEGORY1]', '[CATEGORY2]', '[CATEGORY3]']::text[], -- Max 3 categories
    '[PRIMARY_LANGUAGE]', -- en, hi, es, etc.
    '[CITY, COUNTRY]', -- If found, otherwise NULL
    '[OFFICIAL_WEBSITE_URL]', -- If found, otherwise NULL
    '{
        "spotify": "[SPOTIFY_URL_IF_FOUND]",
        "apple": "[APPLE_PODCASTS_URL_IF_FOUND]",
        "jiosaavn": "[JIOSAAVN_URL_IF_FOUND]",
        "amazon": "[AMAZON_MUSIC_URL_IF_FOUND]",
        "other": []
    }'::jsonb,
    '{
        "instagram": "[INSTAGRAM_URL_IF_FOUND]",
        "youtube": "[YOUTUBE_CHANNEL_URL]",
        "x": "[TWITTER_URL_IF_FOUND]",
        "facebook": "[FACEBOOK_URL_IF_FOUND]",
        "linkedin": "[LINKEDIN_URL_IF_FOUND]",
        "threads": "[THREADS_URL_IF_FOUND]",
        "pinterest": "[PINTEREST_URL_IF_FOUND]",
        "other": []
    }'::jsonb,
    '[
        {
            "id": "team-member-1",
            "name": "[HOST_NAME_IF_FOUND]",
            "roles": ["Host"],
            "bio": "[HOST_BIO_FROM_YOUTUBE_OR_SOCIAL_MEDIA]",
            "photo_urls": [],
            "social_links": {
                "instagram": "[HOST_INSTAGRAM_IF_FOUND]",
                "youtube": "[HOST_YOUTUBE_IF_FOUND]",
                "x": "[HOST_TWITTER_IF_FOUND]",
                "facebook": "[HOST_FACEBOOK_IF_FOUND]",
                "linkedin": "[HOST_LINKEDIN_IF_FOUND]",
                "threads": "[HOST_THREADS_IF_FOUND]",
                "pinterest": "[HOST_PINTEREST_IF_FOUND]",
                "other": []
            }
        }
    ]'::jsonb,
    [TOTAL_EPISODES_FROM_YOUTUBE], -- Count from playlist
    0, -- total_views (will be updated by API)
    0, -- total_likes (will be updated by API)
    0, -- total_comments (will be updated by API)
    0, -- average_duration (will be updated by API)
    NULL, -- first_episode_date (will be updated by API)
    NULL, -- last_episode_date (will be updated by API)
    'pending'::submission_status,
    'user-uuid-here', -- Replace with actual user ID
    false,
    0.0,
    0,
    ARRAY['[TAG1]', '[TAG2]', '[TAG3]']::text[], -- Based on content analysis
    '{
        "meta_title": "[SEO_TITLE_BASED_ON_PODCAST_NAME]",
        "meta_description": "[SEO_DESCRIPTION_FROM_YOUTUBE_DESCRIPTION]",
        "keywords": ["[KEYWORD1]", "[KEYWORD2]", "[KEYWORD3]"],
        "og_title": "[OG_TITLE]",
        "og_description": "[OG_DESCRIPTION]",
        "og_image": "https://i.ytimg.com/vi/[THUMBNAIL_ID]/maxresdefault.jpg"
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
```

### RESEARCH GUIDELINES:

#### 1. YouTube Playlist Analysis:
- Extract playlist title and description
- Count total videos in playlist
- Get playlist thumbnail URL
- Analyze video titles to determine categories
- Look for channel information

#### 2. YouTube Channel Research:
- Find the channel associated with the playlist
- Check channel description for social media links
- Look for "About" section information
- Check channel banner and profile picture
- Analyze channel content for topic understanding

#### 3. Social Media Investigation:
- Search podcast name on major platforms
- Look for verified accounts
- Check bio sections for additional info
- Find team member social profiles

#### 4. Content Analysis:
- Analyze video titles to determine categories
- Extract keywords from descriptions
- Determine primary language
- Identify main topics and themes

### CATEGORY DETERMINATION:
Based on YouTube content analysis, choose from these categories:
- Technology
- Business
- Education
- Entertainment
- News
- Health
- Sports
- Music
- Comedy
- Politics
- Science
- Lifestyle
- Finance
- Travel
- Food
- Gaming
- Art
- History
- Philosophy
- Religion
- Or iske alwa koi new ho to wo add kar dena

### LANGUAGE DETECTION:
- Analyze video titles and descriptions
- Check channel language settings
- Look for language indicators in content
- Default to 'en' if uncertain

### DESCRIPTION GENERATION:
- Use YouTube playlist description as primary source
- If not available, analyze video titles and create description
- Minimum 100 words
- Focus on podcast content and value proposition
- Include key topics and themes

### TEAM MEMBER RESEARCH:
- Look for host information in YouTube channel
- Check social media for host profiles
- Extract bio information from social media
- Find social media links for hosts
- Maximum 3 team members per podcast

### QUALITY ASSURANCE:
- Verify all URLs are accessible
- Ensure descriptions are accurate and not fabricated
- Double-check category assignments
- Validate language detection
- Confirm social media accounts are official

### EXAMPLE RESEARCH PROCESS:
```
Input: Podcast Title: "Tech Talk India", Playlist ID: "PLrAXtmRdnEQy6nuLMOVuX7qUJQ7z1jcbF"

Research Steps:
1. Analyze YouTube playlist: "Tech Talk India - Latest Technology Discussions"
2. Check channel: "Tech Talk India" with 50K subscribers
3. Extract description: "Weekly discussions about technology trends in India..."
4. Count episodes: 150 videos
5. Analyze video titles: "AI in India", "Startup Stories", "Tech News"
6. Determine categories: Technology, Business, Education
7. Find social media: @techtalkindia on Instagram, Twitter
8. Extract host info: "Rajesh Kumar - Tech Entrepreneur"
9. Generate SQL with all verified information
```

### FINAL OUTPUT:
Generate complete SQL INSERT statements for all 100 podcasts, with each statement properly formatted and containing only verified, accurate information from YouTube and social media sources.

**Remember: YouTube is your primary source. Use social media for additional verification. Don't fabricate information - better to use NULL or defaults than incorrect data.**
