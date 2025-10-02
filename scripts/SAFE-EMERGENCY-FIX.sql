-- SAFE EMERGENCY FIX FOR UPDATE ISSUE
-- This version handles data type conversions properly

-- Step 1: Check what's in contributions table
SELECT 
    'CONTRIBUTIONS CHECK' as section,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN data IS NOT NULL THEN 1 END) as with_data
FROM contributions;

-- Step 2: Check recent podcast contributions
SELECT 
    'RECENT PODCAST CONTRIBUTIONS' as section,
    id,
    target_id,
    status,
    created_at,
    CASE 
        WHEN data IS NULL THEN 'NO DATA'
        WHEN data = '{}'::jsonb THEN 'EMPTY DATA'
        ELSE 'HAS DATA'
    END as data_status
FROM contributions 
WHERE target_table = 'podcasts'
ORDER BY created_at DESC 
LIMIT 5;

-- Step 3: Check data structure
SELECT 
    'DATA STRUCTURE CHECK' as section,
    id,
    target_id,
    data->>'title' as title,
    data->>'description' as description,
    data->'categories' as categories_json,
    jsonb_typeof(data->'categories') as categories_type
FROM contributions 
WHERE target_table = 'podcasts'
AND data IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- Step 4: Manual fix for recent contributions (SAFE VERSION)
-- This will manually apply changes from contributions to podcasts
UPDATE podcasts 
SET 
    title = COALESCE(c.data->>'title', podcasts.title),
    description = COALESCE(c.data->>'description', podcasts.description),
    categories = CASE 
        WHEN c.data->'categories' IS NOT NULL THEN 
            ARRAY(SELECT jsonb_array_elements_text(c.data->'categories'))
        ELSE podcasts.categories
    END,
    submission_status = 'approved',
    updated_at = NOW()
FROM contributions c
WHERE podcasts.id = c.target_id::uuid
AND c.target_table = 'podcasts'
AND c.status = 'pending'
AND c.data IS NOT NULL
AND c.data != '{}'::jsonb;

-- Step 5: Update contribution status
UPDATE contributions 
SET 
    status = 'approved',
    reviewed_at = NOW()
WHERE target_table = 'podcasts'
AND status = 'pending'
AND data IS NOT NULL
AND data != '{}'::jsonb;

-- Step 6: Verify the fix
SELECT 
    'AFTER FIX CHECK' as section,
    COUNT(*) as total_contributions,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
FROM contributions 
WHERE target_table = 'podcasts';

-- Step 7: Check updated podcasts
SELECT 
    'UPDATED PODCASTS' as section,
    id,
    title,
    description,
    categories,
    submission_status,
    updated_at
FROM podcasts 
WHERE submission_status = 'approved'
ORDER BY updated_at DESC 
LIMIT 5;

-- Step 8: Success message
SELECT 'SAFE EMERGENCY FIX APPLIED! Check if updates are working now.' as status;
