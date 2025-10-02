-- MANUAL TEST FOR UPDATE ISSUE
-- Use this to manually test the update process

-- Step 1: Find a recent contribution to test with
SELECT 
    c.id as contribution_id,
    c.target_table,
    c.target_id,
    c.status,
    c.data->>'title' as proposed_title,
    c.data->>'description' as proposed_description,
    p.title as current_title,
    p.description as current_description
FROM contributions c
LEFT JOIN podcasts p ON p.id = c.target_id::uuid
WHERE c.target_table = 'podcasts'
AND c.status = 'pending'
ORDER BY c.created_at DESC 
LIMIT 3;

-- Step 2: Manual test - Apply changes directly
-- Replace CONTRIBUTION_ID with actual ID from step 1
/*
-- Get the contribution data
SELECT 
    target_id,
    data
FROM contributions 
WHERE id = CONTRIBUTION_ID;

-- Apply the changes manually
UPDATE podcasts 
SET 
    title = (SELECT data->>'title' FROM contributions WHERE id = CONTRIBUTION_ID),
    description = (SELECT data->>'description' FROM contributions WHERE id = CONTRIBUTION_ID),
    categories = (SELECT data->'categories' FROM contributions WHERE id = CONTRIBUTION_ID),
    updated_at = NOW()
WHERE id = (SELECT target_id::uuid FROM contributions WHERE id = CONTRIBUTION_ID);

-- Update contribution status
UPDATE contributions 
SET 
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = 'your-admin-id-here'::uuid
WHERE id = CONTRIBUTION_ID;

-- Verify the changes
SELECT 
    id,
    title,
    description,
    categories,
    updated_at
FROM podcasts 
WHERE id = (SELECT target_id::uuid FROM contributions WHERE id = CONTRIBUTION_ID);
*/

-- Step 3: Check if there are any data type issues
SELECT 
    c.id,
    c.target_id,
    pg_typeof(c.target_id::uuid) as target_id_type,
    c.data->>'title' as proposed_title,
    pg_typeof(c.data->>'title') as title_type
FROM contributions c
WHERE c.target_table = 'podcasts'
AND c.data IS NOT NULL
LIMIT 3;

-- Step 4: Success message
SELECT 'Manual test queries ready! Use the commented queries above to test manually.' as status;
