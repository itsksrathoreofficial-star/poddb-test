-- FIX CONTRIBUTION STRUCTURE
-- This script applies the correct structure for contribution data

-- Step 1: Check current contributions
SELECT 
    'BEFORE FIX' as section,
    COUNT(*) as total_contributions,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
FROM contributions 
WHERE target_table = 'podcasts';

-- Step 2: Check data structure
SELECT 
    'DATA STRUCTURE' as section,
    id,
    target_id,
    data->>'title' as title,
    data->>'description' as description,
    data->'categories' as categories,
    jsonb_typeof(data->'categories') as categories_type
FROM contributions 
WHERE target_table = 'podcasts'
AND status = 'pending'
ORDER BY created_at DESC 
LIMIT 3;

-- Step 3: Apply changes using correct structure
UPDATE podcasts 
SET 
    title = COALESCE(c.data->>'title', podcasts.title),
    description = COALESCE(c.data->>'description', podcasts.description),
    categories = CASE 
        WHEN c.data->'categories' IS NOT NULL AND jsonb_typeof(c.data->'categories') = 'array' THEN
            ARRAY(SELECT jsonb_array_elements_text(c.data->'categories'))
        ELSE podcasts.categories
    END,
    platform_links = COALESCE(c.data->'platform_links', podcasts.platform_links),
    social_links = COALESCE(c.data->'social_links', podcasts.social_links),
    official_website = COALESCE(c.data->>'official_website', podcasts.official_website),
    team_members = COALESCE(c.data->'team_members', podcasts.team_members),
    submission_status = 'approved',
    approved_by = '00000000-0000-0000-0000-000000000000'::uuid, -- Replace with actual admin ID
    updated_at = NOW()
FROM contributions c
WHERE podcasts.id = c.target_id::uuid
AND c.target_table = 'podcasts'
AND c.status = 'pending'
AND c.data IS NOT NULL
AND c.data != '{}'::jsonb;

-- Step 4: Update contribution status
UPDATE contributions 
SET 
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = '00000000-0000-0000-0000-000000000000'::uuid -- Replace with actual admin ID
WHERE target_table = 'podcasts'
AND status = 'pending'
AND data IS NOT NULL
AND data != '{}'::jsonb;

-- Step 5: Verify the fix
SELECT 
    'AFTER FIX' as section,
    COUNT(*) as total_contributions,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
FROM contributions 
WHERE target_table = 'podcasts';

-- Step 6: Check updated podcasts
SELECT 
    'UPDATED PODCASTS' as section,
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
WHERE submission_status = 'approved'
ORDER BY updated_at DESC 
LIMIT 5;

-- Step 7: Success message
SELECT 'Contribution structure fix applied! All pending contributions have been processed.' as status;
