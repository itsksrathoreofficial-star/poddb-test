-- EMERGENCY FIX FOR UPDATE ISSUE
-- Run this to fix the update problem immediately

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

-- Step 3: Check if target_id format is correct
SELECT 
    'TARGET ID CHECK' as section,
    id,
    target_id,
    LENGTH(target_id) as id_length,
    CASE 
        WHEN target_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'VALID UUID'
        ELSE 'INVALID UUID'
    END as uuid_check
FROM contributions 
WHERE target_table = 'podcasts'
ORDER BY created_at DESC 
LIMIT 3;

-- Step 4: Check podcast table
SELECT 
    'PODCAST TABLE CHECK' as section,
    COUNT(*) as total_podcasts,
    COUNT(CASE WHEN submission_status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN submission_status = 'pending' THEN 1 END) as pending
FROM podcasts;

-- Step 5: Manual fix for recent contributions
-- This will manually apply changes from contributions to podcasts
UPDATE podcasts 
SET 
    title = c.data->>'title',
    description = c.data->>'description',
    categories = ARRAY(SELECT jsonb_array_elements_text(c.data->'categories')),
    submission_status = 'approved',
    updated_at = NOW()
FROM contributions c
WHERE podcasts.id = c.target_id::uuid
AND c.target_table = 'podcasts'
AND c.status = 'pending'
AND c.data IS NOT NULL
AND c.data != '{}'::jsonb;

-- Step 6: Update contribution status
UPDATE contributions 
SET 
    status = 'approved',
    reviewed_at = NOW()
WHERE target_table = 'podcasts'
AND status = 'pending'
AND data IS NOT NULL
AND data != '{}'::jsonb;

-- Step 7: Verify the fix
SELECT 
    'AFTER FIX CHECK' as section,
    COUNT(*) as total_contributions,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
FROM contributions 
WHERE target_table = 'podcasts';

-- Step 8: Success message
SELECT 'EMERGENCY FIX APPLIED! Check if updates are working now.' as status;
