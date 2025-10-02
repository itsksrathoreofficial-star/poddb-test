-- DEBUG UPDATE ISSUE
-- Run this to find out exactly what's happening with edit approval

-- Step 1: Check recent contributions and their data
SELECT 
    id,
    target_table,
    target_id,
    status,
    created_at,
    reviewed_at,
    reviewed_by,
    CASE 
        WHEN data IS NULL THEN 'NULL'
        WHEN jsonb_typeof(data) = 'object' THEN 'Object with data'
        ELSE 'Other: ' || jsonb_typeof(data)
    END as data_info
FROM contributions 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 2: Check specific podcast contributions with detailed data
SELECT 
    c.id as contribution_id,
    c.target_table,
    c.target_id,
    c.status as contribution_status,
    c.created_at as contribution_created,
    c.reviewed_at,
    c.reviewed_by,
    jsonb_pretty(c.data) as contribution_data
FROM contributions c
WHERE c.target_table = 'podcasts'
ORDER BY c.created_at DESC 
LIMIT 5;

-- Step 3: Check current podcast data for comparison
SELECT 
    p.id,
    p.title,
    p.description,
    p.categories,
    p.submission_status,
    p.updated_at,
    p.approved_by
FROM podcasts p
WHERE p.id IN (
    SELECT c.target_id::uuid 
    FROM contributions c
    WHERE c.target_table = 'podcasts'
    ORDER BY c.created_at DESC 
    LIMIT 5
)
ORDER BY p.updated_at DESC;

-- Step 4: Check if there are any recent approvals
SELECT 
    c.id as contribution_id,
    c.target_table,
    c.target_id,
    c.status,
    c.reviewed_at,
    c.reviewed_by,
    p.title as current_podcast_title,
    c.data->>'title' as proposed_title,
    CASE 
        WHEN p.title = c.data->>'title' THEN 'SAME'
        ELSE 'DIFFERENT'
    END as title_match
FROM contributions c
LEFT JOIN podcasts p ON p.id = c.target_id::uuid
WHERE c.target_table = 'podcasts'
AND c.status = 'approved'
ORDER BY c.reviewed_at DESC 
LIMIT 5;

-- Step 5: Check for any errors in the process
SELECT 
    'Recent contributions count' as metric,
    COUNT(*) as value
FROM contributions 
WHERE created_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
    'Approved in last hour' as metric,
    COUNT(*) as value
FROM contributions 
WHERE status = 'approved' 
AND reviewed_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
    'Pending contributions' as metric,
    COUNT(*) as value
FROM contributions 
WHERE status = 'pending';

-- Step 6: Check the exact data structure
SELECT 
    c.id,
    c.target_table,
    c.target_id,
    jsonb_object_keys(c.data) as data_keys,
    c.data->>'title' as proposed_title,
    c.data->>'description' as proposed_description
FROM contributions c
WHERE c.target_table = 'podcasts'
AND c.data IS NOT NULL
ORDER BY c.created_at DESC 
LIMIT 3;

-- Step 7: Check if target_id conversion is working
SELECT 
    c.id,
    c.target_id,
    c.target_id::uuid as converted_target_id,
    p.id as podcast_id,
    CASE 
        WHEN c.target_id::uuid = p.id THEN 'MATCH'
        ELSE 'NO MATCH'
    END as id_match
FROM contributions c
LEFT JOIN podcasts p ON p.id = c.target_id::uuid
WHERE c.target_table = 'podcasts'
ORDER BY c.created_at DESC 
LIMIT 5;
