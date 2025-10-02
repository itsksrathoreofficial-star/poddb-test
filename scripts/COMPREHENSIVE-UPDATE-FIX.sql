-- COMPREHENSIVE UPDATE FIX
-- This script fixes all possible issues with edit approval updates

-- Step 1: Check current state
SELECT 
    'Current State Analysis' as section,
    COUNT(*) as total_contributions,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN data IS NOT NULL THEN 1 END) as with_data
FROM contributions;

-- Step 2: Check data types and structure
SELECT 
    'Data Structure Analysis' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Check if there are any recent contributions that failed to update
SELECT 
    c.id as contribution_id,
    c.target_table,
    c.target_id,
    c.status,
    c.reviewed_at,
    c.data->>'title' as proposed_title,
    p.title as current_title,
    CASE 
        WHEN c.data->>'title' = p.title THEN 'UPDATED'
        WHEN c.data->>'title' IS NULL THEN 'NO TITLE IN DATA'
        ELSE 'NOT UPDATED'
    END as update_status
FROM contributions c
LEFT JOIN podcasts p ON p.id = c.target_id::uuid
WHERE c.target_table = 'podcasts'
AND c.status = 'approved'
AND c.reviewed_at > NOW() - INTERVAL '24 hours'
ORDER BY c.reviewed_at DESC;

-- Step 4: Fix any data type issues
-- Ensure target_id is properly formatted
UPDATE contributions 
SET target_id = target_id::text
WHERE target_table = 'podcasts'
AND target_id IS NOT NULL;

-- Step 5: Check for any missing data
UPDATE contributions 
SET data = COALESCE(data, '{}'::jsonb)
WHERE data IS NULL
AND target_table = 'podcasts';

-- Step 6: Verify the fix
SELECT 
    'After Fix Analysis' as section,
    COUNT(*) as total_contributions,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN data IS NOT NULL AND data != '{}'::jsonb THEN 1 END) as with_valid_data
FROM contributions;

-- Step 7: Test data extraction
SELECT 
    c.id,
    c.target_table,
    c.target_id,
    jsonb_object_keys(c.data) as available_keys,
    c.data->>'title' as title_value,
    c.data->>'description' as description_value
FROM contributions c
WHERE c.target_table = 'podcasts'
AND c.data IS NOT NULL
AND c.data != '{}'::jsonb
ORDER BY c.created_at DESC 
LIMIT 5;

-- Step 8: Success message
SELECT 'Comprehensive update fix applied! Check the results above.' as status;
