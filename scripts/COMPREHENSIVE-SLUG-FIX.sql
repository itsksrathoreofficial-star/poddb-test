-- Comprehensive Slug Generation for Existing Data
-- Run this in Supabase SQL Editor

-- Step 1: Check current state
SELECT 'Current state before fix:' as status;
SELECT 
    'episodes' as table_name,
    COUNT(*) as total,
    COUNT(slug) as with_slugs,
    COUNT(*) - COUNT(slug) as without_slugs
FROM episodes
UNION ALL
SELECT 
    'podcasts' as table_name,
    COUNT(*) as total,
    COUNT(slug) as with_slugs,
    COUNT(*) - COUNT(slug) as without_slugs
FROM podcasts;

-- Step 2: Create a function to generate clean slugs
CREATE OR REPLACE FUNCTION generate_clean_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
                    '\s+', '-', 'g'
                ),
                '-+', '-', 'g'
            ),
            '^-|-$', '', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Step 3: Update episodes without slugs
UPDATE episodes 
SET slug = generate_clean_slug(title)
WHERE slug IS NULL OR slug = '';

-- Step 4: Handle duplicate episode slugs
WITH duplicate_slugs AS (
    SELECT 
        id,
        slug,
        ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
    FROM episodes 
    WHERE slug IS NOT NULL
)
UPDATE episodes 
SET slug = CASE 
    WHEN duplicate_slugs.rn = 1 THEN duplicate_slugs.slug
    ELSE duplicate_slugs.slug || '-' || (duplicate_slugs.rn - 1)
END
FROM duplicate_slugs
WHERE episodes.id = duplicate_slugs.id 
AND duplicate_slugs.rn > 1;

-- Step 5: Update podcasts without slugs
UPDATE podcasts 
SET slug = generate_clean_slug(title)
WHERE slug IS NULL OR slug = '';

-- Step 6: Handle duplicate podcast slugs
WITH duplicate_slugs AS (
    SELECT 
        id,
        slug,
        ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
    FROM podcasts 
    WHERE slug IS NOT NULL
)
UPDATE podcasts 
SET slug = CASE 
    WHEN duplicate_slugs.rn = 1 THEN duplicate_slugs.slug
    ELSE duplicate_slugs.slug || '-' || (duplicate_slugs.rn - 1)
END
FROM duplicate_slugs
WHERE podcasts.id = duplicate_slugs.id 
AND duplicate_slugs.rn > 1;

-- Step 7: Final verification
SELECT 'Final state after fix:' as status;
SELECT 
    'episodes' as table_name,
    COUNT(*) as total,
    COUNT(slug) as with_slugs,
    COUNT(*) - COUNT(slug) as without_slugs
FROM episodes
UNION ALL
SELECT 
    'podcasts' as table_name,
    COUNT(*) as total,
    COUNT(slug) as with_slugs,
    COUNT(*) - COUNT(slug) as without_slugs
FROM podcasts;

-- Step 8: Show some examples
SELECT 'Sample episodes with slugs:' as status;
SELECT id, title, slug 
FROM episodes 
WHERE slug IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'Sample podcasts with slugs:' as status;
SELECT id, title, slug 
FROM podcasts 
WHERE slug IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 9: Clean up
DROP FUNCTION IF EXISTS generate_clean_slug(TEXT);

SELECT 'Slug generation completed successfully!' as status;
