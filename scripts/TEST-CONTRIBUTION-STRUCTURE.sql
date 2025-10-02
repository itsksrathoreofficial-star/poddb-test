-- TEST CONTRIBUTION STRUCTURE
-- This script tests the exact structure used in contributions

-- Step 1: Check recent contributions and their structure
SELECT 
    'CONTRIBUTION STRUCTURE CHECK' as section,
    id,
    target_table,
    target_id,
    status,
    jsonb_pretty(data) as formatted_data
FROM contributions 
WHERE target_table = 'podcasts'
ORDER BY created_at DESC 
LIMIT 3;

-- Step 2: Check specific fields in contribution data
SELECT 
    'FIELD ANALYSIS' as section,
    id,
    target_id,
    data->>'title' as title,
    data->>'description' as description,
    data->'categories' as categories_json,
    jsonb_typeof(data->'categories') as categories_type,
    data->'platform_links' as platform_links,
    data->'social_links' as social_links,
    data->>'official_website' as official_website
FROM contributions 
WHERE target_table = 'podcasts'
AND data IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- Step 3: Test manual update with correct structure
-- (Replace CONTRIBUTION_ID with actual ID from step 1)
/*
-- Get the contribution data
SELECT 
    target_id,
    data->>'title' as title,
    data->>'description' as description,
    data->'categories' as categories,
    data->'platform_links' as platform_links,
    data->'social_links' as social_links,
    data->>'official_website' as official_website
FROM contributions 
WHERE id = CONTRIBUTION_ID;

-- Apply the changes manually
UPDATE podcasts 
SET 
    title = (SELECT data->>'title' FROM contributions WHERE id = CONTRIBUTION_ID),
    description = (SELECT data->>'description' FROM contributions WHERE id = CONTRIBUTION_ID),
    categories = (SELECT data->'categories' FROM contributions WHERE id = CONTRIBUTION_ID),
    platform_links = (SELECT data->'platform_links' FROM contributions WHERE id = CONTRIBUTION_ID),
    social_links = (SELECT data->'social_links' FROM contributions WHERE id = CONTRIBUTION_ID),
    official_website = (SELECT data->>'official_website' FROM contributions WHERE id = CONTRIBUTION_ID),
    submission_status = 'approved',
    updated_at = NOW()
WHERE id = (SELECT target_id::uuid FROM contributions WHERE id = CONTRIBUTION_ID);

-- Update contribution status
UPDATE contributions 
SET 
    status = 'approved',
    reviewed_at = NOW()
WHERE id = CONTRIBUTION_ID;

-- Verify the update
SELECT 
    id,
    title,
    description,
    categories,
    platform_links,
    social_links,
    official_website,
    submission_status,
    updated_at
FROM podcasts 
WHERE id = (SELECT target_id::uuid FROM contributions WHERE id = CONTRIBUTION_ID);
*/

-- Step 4: Check if there are any data type mismatches
SELECT 
    'DATA TYPE CHECK' as section,
    c.id,
    c.target_id,
    pg_typeof(c.data->'categories') as categories_type,
    pg_typeof(p.categories) as podcast_categories_type,
    CASE 
        WHEN pg_typeof(c.data->'categories') = pg_typeof(p.categories) THEN 'MATCH'
        ELSE 'MISMATCH'
    END as type_match
FROM contributions c
LEFT JOIN podcasts p ON p.id = c.target_id::uuid
WHERE c.target_table = 'podcasts'
AND c.data IS NOT NULL
ORDER BY c.created_at DESC 
LIMIT 3;

-- Step 5: Success message
SELECT 'Contribution structure analysis complete! Use the manual queries above to test.' as status;
