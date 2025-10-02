-- FIX EDIT APPROVAL PROCESS
-- This script ensures that contribution data is properly applied when approved

-- Step 1: Check current contributions table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check if there are any pending contributions with data
SELECT 
    COUNT(*) as total_pending,
    COUNT(CASE WHEN data IS NOT NULL THEN 1 END) as with_data,
    COUNT(CASE WHEN data IS NULL THEN 1 END) as without_data
FROM contributions 
WHERE status = 'pending';

-- Step 3: Check recent contributions and their data
SELECT 
    id,
    target_table,
    target_id,
    status,
    CASE 
        WHEN data IS NULL THEN 'No data'
        WHEN jsonb_typeof(data) = 'object' THEN 'Has data object'
        ELSE 'Other data type'
    END as data_status,
    created_at
FROM contributions 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 4: Verify that the data column contains the expected structure
SELECT 
    id,
    target_table,
    jsonb_object_keys(data) as data_keys
FROM contributions 
WHERE data IS NOT NULL 
AND target_table = 'podcasts'
LIMIT 5;

-- Step 5: Check if there are any contributions that should be applied
SELECT 
    c.id as contribution_id,
    c.target_table,
    c.target_id,
    c.status as contribution_status,
    p.title as current_title,
    c.data->>'title' as proposed_title,
    p.submission_status as current_podcast_status
FROM contributions c
LEFT JOIN podcasts p ON p.id = c.target_id::uuid
WHERE c.target_table = 'podcasts'
AND c.status = 'pending'
ORDER BY c.created_at DESC
LIMIT 5;

-- Step 6: Success message
SELECT 'Edit approval process analysis complete! Check the results above to see what needs to be fixed.' as status;
