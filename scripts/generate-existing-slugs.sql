-- Generate slugs for existing episodes that don't have them
-- Run this in Supabase SQL Editor

-- First, let's see how many episodes don't have slugs
SELECT 
    COUNT(*) as total_episodes,
    COUNT(slug) as episodes_with_slugs,
    COUNT(*) - COUNT(slug) as episodes_without_slugs
FROM episodes;

-- Update episodes that don't have slugs
-- We'll use a simple approach: title -> slug conversion
UPDATE episodes 
SET slug = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
    )
)
WHERE slug IS NULL OR slug = '';

-- Handle duplicates by adding numbers
WITH numbered_episodes AS (
    SELECT 
        id,
        slug,
        ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
    FROM episodes 
    WHERE slug IS NOT NULL
)
UPDATE episodes 
SET slug = CASE 
    WHEN numbered_episodes.rn = 1 THEN numbered_episodes.slug
    ELSE numbered_episodes.slug || '-' || (numbered_episodes.rn - 1)
END
FROM numbered_episodes
WHERE episodes.id = numbered_episodes.id 
AND numbered_episodes.rn > 1;

-- Verify the results
SELECT 
    COUNT(*) as total_episodes,
    COUNT(slug) as episodes_with_slugs,
    COUNT(*) - COUNT(slug) as episodes_without_slugs
FROM episodes;

-- Show some examples
SELECT id, title, slug 
FROM episodes 
WHERE slug IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;
