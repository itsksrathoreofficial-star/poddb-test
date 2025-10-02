-- TEST EDIT APPROVAL PROCESS
-- Run this to test if edit approval is working correctly

-- Step 1: Check recent contributions with data
SELECT 
    id,
    target_table,
    target_id,
    status,
    data,
    created_at
FROM contributions 
WHERE status = 'pending'
ORDER BY created_at DESC 
LIMIT 5;

-- Step 2: Check what data is stored in contributions
SELECT 
    id,
    target_table,
    target_id,
    jsonb_pretty(data) as formatted_data
FROM contributions 
WHERE target_table = 'podcasts' 
AND status = 'pending'
ORDER BY created_at DESC 
LIMIT 3;

-- Step 3: Check current podcast data for comparison
SELECT 
    id,
    title,
    description,
    categories,
    submission_status,
    updated_at
FROM podcasts 
WHERE id IN (
    SELECT target_id::uuid 
    FROM contributions 
    WHERE target_table = 'podcasts' 
    AND status = 'pending'
    LIMIT 3
);

-- Step 4: Test manual approval of a contribution
-- (Replace the contribution ID with actual ID from step 1)
/*
-- First, get the contribution data
SELECT data FROM contributions WHERE id = YOUR_CONTRIBUTION_ID;

-- Then manually apply the changes to the podcast
UPDATE podcasts 
SET 
    title = (SELECT data->>'title' FROM contributions WHERE id = YOUR_CONTRIBUTION_ID),
    description = (SELECT data->>'description' FROM contributions WHERE id = YOUR_CONTRIBUTION_ID),
    categories = (SELECT data->'categories' FROM contributions WHERE id = YOUR_CONTRIBUTION_ID),
    submission_status = 'approved',
    updated_at = NOW()
WHERE id = (SELECT target_id::uuid FROM contributions WHERE id = YOUR_CONTRIBUTION_ID);

-- Update the contribution status
UPDATE contributions 
SET 
    status = 'approved',
    reviewed_at = NOW()
WHERE id = YOUR_CONTRIBUTION_ID;
*/

-- Step 5: Success message
SELECT 'Edit approval test queries ready! Use the manual queries above to test.' as status;
